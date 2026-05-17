from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import uuid
import math

from database import pharmacies_collection, inventory_collection, orders_collection, medicines_collection, users_collection
from models import OrderCreate, OrderResponse
from auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in km using Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return float('inf')
    R = 6371 # Radius of earth in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@router.get("/nearest-pharmacies/{medicine_id}")
async def get_nearest_pharmacies(medicine_id: str, lat: float, lng: float):
    # Find all inventory items for this medicine
    inv_cursor = inventory_collection.find({"medicine_id": medicine_id, "stock": {"$gt": 0}})
    available_pharmacy_ids = []
    async for inv in inv_cursor:
        available_pharmacy_ids.append(inv["pharmacy_id"])
        
    if not available_pharmacy_ids:
        return []
        
    # Get pharmacy details
    p_query = {"$or": [
        {"legacy_id": {"$in": available_pharmacy_ids}},
    ]}
    
    # Also add valid ObjectIds
    valid_obj_ids = [ObjectId(pid) for pid in available_pharmacy_ids if ObjectId.is_valid(pid)]
    if valid_obj_ids:
        p_query["$or"].append({"_id": {"$in": valid_obj_ids}})

    pharmacies_cur = pharmacies_collection.find(p_query)
    
    results = []
    async for p in pharmacies_cur:
        dist = calculate_distance(lat, lng, p.get("lat"), p.get("lng"))
        # Get stock and price
        pid_str = p.get("legacy_id") or str(p["_id"])
        inv = await inventory_collection.find_one({"pharmacy_id": pid_str, "medicine_id": medicine_id})
        
        results.append({
            "id": str(p["_id"]),
            "name": p["name"],
            "address": p.get("address", ""),
            "lat": p.get("lat"),
            "lng": p.get("lng"),
            "distance_km": dist,
            "stock": inv["stock"] if inv else 0,
            "price": inv["price"] if inv else 0.0,
            "rating": p.get("rating", 4.5) # Default rating if not present
        })
        
    # Sort by distance
    results.sort(key=lambda x: x["distance_km"])
    return results

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # Verify pharmacy
    p_query = {"$or": [{"legacy_id": data.pharmacy_id}]}
    if ObjectId.is_valid(data.pharmacy_id):
        p_query["$or"].append({"_id": ObjectId(data.pharmacy_id)})
        
    pharmacy = await pharmacies_collection.find_one(p_query)
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
        
    actual_pid = pharmacy.get("legacy_id") or str(pharmacy["_id"])
    
    order_items = []
    total_amount = 0.0
    for item in data.items:
        inv = await inventory_collection.find_one({
            "pharmacy_id": actual_pid,
            "medicine_id": item.medicine_id
        })
        if not inv or inv.get("stock", 0) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for medicine ID {item.medicine_id}")
            
        item_total = item.quantity * inv.get("price", 0.0)
        total_amount += item_total
        order_items.append({
            "medicine_id": item.medicine_id,
            "quantity": item.quantity,
            "price": inv.get("price", 0.0)
        })
        
    qr_code = str(uuid.uuid4())
    
    # Calculate ETA and delivery fee based on delivery method and emergency status
    eta = None
    if data.delivery_method == "home_delivery":
        base_minutes = 15 if data.is_emergency else 45
        eta = (datetime.now(timezone.utc) + timedelta(minutes=base_minutes)).isoformat()
        
        # Add delivery fee (5 for standard home delivery, 10 for emergency)
        delivery_fee = 10.0 if data.is_emergency else 5.0
        total_amount += delivery_fee
        
    order_doc = {
        "user_id": user_id,
        "pharmacy_id": actual_pid,
        "items": order_items,
        "delivery_method": data.delivery_method,
        "payment_method": data.payment_method,
        "address_id": data.address_id,
        "delivery_agent_id": None,
        "status": "Pending",
        "qr_code": qr_code,
        "estimated_delivery_time": eta,
        "is_emergency": data.is_emergency,
        "total_amount": total_amount,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    res = await orders_collection.insert_one(order_doc)
    
    return OrderResponse(
        id=str(res.inserted_id),
        **order_doc
    )

@router.get("/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    orders_cur = orders_collection.find({"user_id": user_id}).sort("created_at", -1)
    
    results = []
    async for order in orders_cur:
        # Get pharmacy details
        p_query = {"$or": [{"legacy_id": order["pharmacy_id"]}]}
        if ObjectId.is_valid(order["pharmacy_id"]):
            p_query["$or"].append({"_id": ObjectId(order["pharmacy_id"])})
        pharmacy = await pharmacies_collection.find_one(p_query)
        pharmacy_name = pharmacy.get("name", "Unknown Pharmacy") if pharmacy else "Unknown Pharmacy"
        
        # Enrich items
        enriched_items = []
        for item in order.get("items", []):
            med_query = {"$or": [{"legacy_id": item["medicine_id"]}]}
            if ObjectId.is_valid(item["medicine_id"]):
                med_query["$or"].append({"_id": ObjectId(item["medicine_id"])})
            med = await medicines_collection.find_one(med_query)
            med_name = med.get("name", "Unknown Medicine") if med else "Unknown Medicine"
            enriched_items.append({
                "medicine_id": item["medicine_id"],
                "medicine_name": med_name,
                "quantity": item["quantity"],
                "price": item.get("price", 0.0)
            })
            
        # Get Agent details if assigned
        agent_info = None
        if order.get("delivery_agent_id"):
            from database import delivery_agents_collection
            agent = await delivery_agents_collection.find_one({"agent_id": order["delivery_agent_id"]})
            if agent:
                agent_info = {
                    "name": agent.get("name"),
                    "phone": agent.get("phone")
                }
                
        # Get Address details if home delivery
        address_info = None
        if order.get("address_id") and ObjectId.is_valid(order["address_id"]):
            from database import addresses_collection
            address = await addresses_collection.find_one({"_id": ObjectId(order["address_id"])})
            if address:
                address_info = {
                    "house_number": address.get("house_number", ""),
                    "street": address.get("street", ""),
                    "city": address.get("city", ""),
                    "state": address.get("state", ""),
                    "zip_code": address.get("zip_code", "")
                }
                
        results.append({
            "id": str(order["_id"]),
            "pharmacy_name": pharmacy_name,
            "items": enriched_items,
            "delivery_method": order.get("delivery_method"),
            "payment_method": order.get("payment_method"),
            "status": order.get("status"),
            "qr_code": order.get("qr_code"),
            "estimated_delivery_time": order.get("estimated_delivery_time"),
            "is_emergency": order.get("is_emergency", False),
            "total_amount": order.get("total_amount", 0.0),
            "created_at": order.get("created_at"),
            "agent": agent_info,
            "address": address_info
        })
        
    return results

@router.get("/pharmacy-history")
async def get_pharmacy_orders(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "pharmacist":
        raise HTTPException(status_code=403, detail="Pharmacist privileges required")
        
    pharmacy = await pharmacies_collection.find_one({"owner_id": current_user["_id"]})
    if not pharmacy:
        raise HTTPException(status_code=404, detail="No pharmacy associated with your account")
        
    pid = pharmacy.get("legacy_id") or str(pharmacy["_id"])
    orders_cur = orders_collection.find({"pharmacy_id": pid}).sort("created_at", -1)
    
    results = []
    async for order in orders_cur:
        user = await users_collection.find_one({"_id": ObjectId(order["user_id"])})
        customer_name = user.get("name", "Unknown Customer") if user else "Unknown Customer"
        
        enriched_items = []
        for item in order.get("items", []):
            med_query = {"$or": [{"legacy_id": item["medicine_id"]}]}
            if ObjectId.is_valid(item["medicine_id"]):
                med_query["$or"].append({"_id": ObjectId(item["medicine_id"])})
            med = await medicines_collection.find_one(med_query)
            med_name = med.get("name", "Unknown Medicine") if med else "Unknown Medicine"
            enriched_items.append({
                "medicine_id": item["medicine_id"],
                "medicine_name": med_name,
                "quantity": item["quantity"],
                "price": item.get("price", 0.0)
            })
            
        results.append({
            "id": str(order["_id"]),
            "customer_name": customer_name,
            "items": enriched_items,
            "delivery_method": order.get("delivery_method"),
            "payment_method": order.get("payment_method"),
            "status": order.get("status"),
            "is_emergency": order.get("is_emergency", False),
            "total_amount": order.get("total_amount", 0.0),
            "created_at": order.get("created_at")
        })
        
    return results

@router.post("/complete/{order_id}")
async def complete_order(order_id: str, current_user: dict = Depends(get_current_user)):
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
        
    if order.get("status") == "Completed":
         raise HTTPException(status_code=400, detail="Order is already completed")
         
    # Only allow completing after order is Delivered or Picked Up
    if order.get("status") not in ["Delivered", "Picked Up"]:
         raise HTTPException(status_code=400, detail=f"Cannot complete order with status {order.get('status')}. It must be 'Delivered' or 'Picked Up' first.")
         
    # Reduce stock from inventory!
    actual_pid = order["pharmacy_id"]
    for item in order["items"]:
        # Find inventory item and decrease stock
        await inventory_collection.update_one(
            {"pharmacy_id": actual_pid, "medicine_id": item["medicine_id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
        
    # Update order status to Completed
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {
            "status": "Completed",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"detail": "Order successfully marked as Completed and inventory has been updated."}
