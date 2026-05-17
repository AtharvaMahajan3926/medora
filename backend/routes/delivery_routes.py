from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime, timezone

from database import orders_collection, pharmacies_collection, users_collection, addresses_collection, delivery_agents_collection
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/delivery", tags=["Delivery"])

class StatusUpdate(BaseModel):
    status: str

class AssignAgentRequest(BaseModel):
    agent_id: str

@router.get("/agents")
async def get_all_agents(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["pharmacist", "admin"]:
        raise HTTPException(status_code=403, detail="Privileges required")
        
    agents_cur = delivery_agents_collection.find({})
    results = []
    async for agent in agents_cur:
        # Check active orders
        active_orders = await orders_collection.count_documents({
            "delivery_agent_id": agent["agent_id"],
            "status": {"$nin": ["Delivered", "Cancelled", "Completed"]}
        })
        
        results.append({
            "id": agent["agent_id"],
            "name": agent.get("name"),
            "phone": agent.get("phone"),
            "vehicle_type": agent.get("vehicle_type"),
            "active_orders": active_orders,
            "status": "Busy" if active_orders > 0 else "Available"
        })
        
    return results

@router.post("/assign-to-agent/{order_id}")
async def assign_to_agent(order_id: str, data: AssignAgentRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Pharmacist privileges required")
        
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check if pharmacy owns this order
    pharmacy = await pharmacies_collection.find_one({"owner_id": current_user["_id"]})
    if not pharmacy or (pharmacy.get("legacy_id") != order["pharmacy_id"] and str(pharmacy["_id"]) != order["pharmacy_id"]):
        raise HTTPException(status_code=403, detail="Not your pharmacy's order")

    # Verify agent exists
    agent = await delivery_agents_collection.find_one({"agent_id": data.agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Delivery agent not found")
        
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "delivery_agent_id": data.agent_id,
            "status": "Assigned to Delivery Agent",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"detail": "Order successfully assigned to agent"}

@router.get("/available-orders")
async def get_available_orders(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "delivery_agent":
        raise HTTPException(status_code=403, detail="Delivery agent privileges required")
        
    agent_id = str(current_user["_id"])
    
    # Query for:
    # 1. Orders explicitly assigned to this agent that are active (not Delivered/Completed/Cancelled)
    # 2. General unassigned orders that are waiting for an agent
    query = {
        "delivery_method": "home_delivery",
        "$or": [
            {
                "delivery_agent_id": agent_id,
                "status": {"$in": ["Assigned to Delivery Agent", "Out for Delivery"]}
            },
            {
                "delivery_agent_id": None,
                "status": {"$in": ["Packed", "Ready for Delivery", "Accepted"]}
            }
        ]
    }
    
    orders_cur = orders_collection.find(query).sort("created_at", -1)
    results = []
    async for order in orders_cur:
        # Get pharmacy info
        p_query = {"$or": [{"legacy_id": order["pharmacy_id"]}]}
        if ObjectId.is_valid(order["pharmacy_id"]):
            p_query["$or"].append({"_id": ObjectId(order["pharmacy_id"])})
        pharmacy = await pharmacies_collection.find_one(p_query)
        
        # Get customer address
        address = None
        if order.get("address_id") and ObjectId.is_valid(order["address_id"]):
            address = await addresses_collection.find_one({"_id": ObjectId(order["address_id"])})
            if address:
                address["_id"] = str(address["_id"])
                
        user = await users_collection.find_one({"_id": ObjectId(order["user_id"])})
        
        results.append({
            "id": str(order["_id"]),
            "customer_name": user.get("name", "Unknown") if user else "Unknown",
            "customer_phone": address.get("phone_number") if address else "",
            "pharmacy_name": pharmacy.get("name") if pharmacy else "Unknown Pharmacy",
            "pharmacy_address": pharmacy.get("address") if pharmacy else "",
            "pharmacy_lat": pharmacy.get("lat") if pharmacy else 0,
            "pharmacy_lng": pharmacy.get("lng") if pharmacy else 0,
            "address": address,
            "status": order.get("status"),
            "payment_method": order.get("payment_method"),
            "total_amount": order.get("total_amount"),
            "is_emergency": order.get("is_emergency", False),
            "estimated_delivery_time": order.get("estimated_delivery_time"),
            "created_at": order.get("created_at"),
            "delivery_agent_id": order.get("delivery_agent_id")
        })
        
    return results

@router.post("/assign/{order_id}")
async def assign_order(order_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "delivery_agent":
        raise HTTPException(status_code=403, detail="Delivery agent privileges required")
        
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.get("delivery_agent_id"):
        raise HTTPException(status_code=400, detail="Order already assigned to an agent")
        
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "delivery_agent_id": str(current_user["_id"]),
            "status": "Assigned to Delivery Agent",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"detail": "Order successfully assigned to you"}

@router.get("/my-deliveries")
async def get_my_deliveries(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "delivery_agent":
        raise HTTPException(status_code=403, detail="Delivery agent privileges required")
        
    # Return completed/delivered orders only (Delivery History)
    orders_cur = orders_collection.find({
        "delivery_agent_id": str(current_user["_id"]),
        "status": {"$in": ["Delivered", "Completed"]}
    }).sort("updated_at", -1)
    
    results = []
    async for order in orders_cur:
        # Get pharmacy info
        p_query = {"$or": [{"legacy_id": order["pharmacy_id"]}]}
        if ObjectId.is_valid(order["pharmacy_id"]):
            p_query["$or"].append({"_id": ObjectId(order["pharmacy_id"])})
        pharmacy = await pharmacies_collection.find_one(p_query)
        
        # Get customer address
        address = None
        if order.get("address_id") and ObjectId.is_valid(order["address_id"]):
            address = await addresses_collection.find_one({"_id": ObjectId(order["address_id"])})
            if address:
                address["_id"] = str(address["_id"])
                
        user = await users_collection.find_one({"_id": ObjectId(order["user_id"])})
        
        results.append({
            "id": str(order["_id"]),
            "customer_name": user.get("name", "Unknown") if user else "Unknown",
            "customer_phone": address.get("phone_number") if address else "",
            "pharmacy_name": pharmacy.get("name") if pharmacy else "Unknown Pharmacy",
            "pharmacy_lat": pharmacy.get("lat") if pharmacy else 0,
            "pharmacy_lng": pharmacy.get("lng") if pharmacy else 0,
            "address": address,
            "status": order.get("status"),
            "payment_method": order.get("payment_method"),
            "total_amount": order.get("total_amount"),
            "is_emergency": order.get("is_emergency", False),
            "estimated_delivery_time": order.get("estimated_delivery_time"),
            "updated_at": order.get("updated_at")
        })
        
    return results

@router.post("/update-status/{order_id}")
async def update_order_status(order_id: str, data: StatusUpdate, current_user: dict = Depends(get_current_user)):
    # Both Pharmacist and Delivery Agent can update statuses based on role
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    role = current_user.get("role")
    valid_status = False
    
    if role == "delivery_agent":
        if order.get("delivery_agent_id") != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not assigned to this order")
        if data.status in ["Out for Delivery"]:
            valid_status = True
            
    elif role == "pharmacist":
        # Check if pharmacy owns this order
        pharmacy = await pharmacies_collection.find_one({"owner_id": current_user["_id"]})
        if not pharmacy or (pharmacy.get("legacy_id") != order["pharmacy_id"] and str(pharmacy["_id"]) != order["pharmacy_id"]):
            raise HTTPException(status_code=403, detail="Not your pharmacy's order")
            
        if data.status in ["Accepted", "Rejected", "Packed", "Ready for Pickup", "Cancelled"]:
            valid_status = True
            
    if not valid_status:
        raise HTTPException(status_code=400, detail=f"Invalid status update for role {role}")
        
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "status": data.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"detail": f"Status updated to {data.status}"}
