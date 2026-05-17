from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from bson import ObjectId
from typing import List
from datetime import datetime

from database import pharmacies_collection, users_collection, inventory_collection, delivery_agents_collection
from models import PharmacyResponse, PharmacyStatusUpdate, AdminStats, DeliveryAgentResponse, DeliveryAgentStatusUpdate
from auth import get_current_user
from email_utils import send_pharmacy_status_email

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )
    return current_user

def doc_to_pharmacy_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "owner_id": str(doc["owner_id"]),
        "name": doc["name"],
        "owner_name": doc["owner_name"],
        "email": doc["email"],
        "phone": doc["phone"],
        "city": doc["city"],
        "address": doc["address"],
        "lat": doc.get("lat", 0.0),
        "lng": doc.get("lng", 0.0),
        "timings": doc["timings"],
        "license": doc["license"],
        "status": doc["status"],
        "created_at": doc.get("created_at", "").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
    }

@router.get("/pharmacies", response_model=List[PharmacyResponse])
async def get_all_pharmacies(admin_user: dict = Depends(require_admin)):
    cursor = pharmacies_collection.find()
    pharmacies = await cursor.to_list(length=1000)
    return [doc_to_pharmacy_response(p) for p in pharmacies]


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(admin_user: dict = Depends(require_admin)):
    """Return real-time platform statistics for the Admin dashboard."""

    # Total regular users (role = "user")
    total_users = await users_collection.count_documents({"role": "user"})

    # Total pharmacies
    total_pharmacies = await pharmacies_collection.count_documents({})

    # Pending pharmacy verifications
    pending_verifications = await pharmacies_collection.count_documents({"status": "pending"})

    # Total delivery agents
    total_delivery_agents = await users_collection.count_documents({"role": "delivery_agent"})

    # Total stock units across ALL inventory items
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$stock"}}}
    ]
    agg = await inventory_collection.aggregate(pipeline).to_list(length=1)
    total_stocks = agg[0]["total"] if agg else 0

    return AdminStats(
        totalUsers=total_users,
        totalPharmacies=total_pharmacies,
        totalStocks=total_stocks,
        pendingVerifications=pending_verifications,
        totalDeliveryAgents=total_delivery_agents,
    )

@router.patch("/pharmacies/{pharmacy_id}/status", response_model=PharmacyResponse)
async def update_pharmacy_status(pharmacy_id: str, data: PharmacyStatusUpdate, background_tasks: BackgroundTasks, admin_user: dict = Depends(require_admin)):
    if not ObjectId.is_valid(pharmacy_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid pharmacy ID")

    pharmacy = await pharmacies_collection.find_one({"_id": ObjectId(pharmacy_id)})
    if not pharmacy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pharmacy not found")

    new_status = data.status
    
    # 1. Update pharmacy status
    await pharmacies_collection.update_one(
        {"_id": ObjectId(pharmacy_id)},
        {"$set": {"status": new_status}}
    )
    
    # 2. Update associated user status
    user_status = "active" if new_status == "verified" else ("pending" if new_status in ["pending", "denied"] else "banned")
    await users_collection.update_one(
        {"_id": pharmacy["owner_id"]},
        {"$set": {"status": user_status}}
    )
    
    # Refetch
    updated = await pharmacies_collection.find_one({"_id": ObjectId(pharmacy_id)})
    
    # Send email notification in the background
    if new_status in ["verified", "banned"]:
        background_tasks.add_task(send_pharmacy_status_email, updated["email"], new_status, updated["name"])
        
    return doc_to_pharmacy_response(updated)


def doc_to_agent_response(doc: dict) -> dict:
    return {
        "id": doc["agent_id"],
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc["phone"],
        "vehicle_type": doc["vehicle_type"],
        "availability_status": doc.get("availability_status", True),
        "status": doc.get("status", "active"),
        "created_at": doc.get("created_at", "").isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", ""))
    }


@router.get("/delivery-agents", response_model=List[DeliveryAgentResponse])
async def get_all_delivery_agents(admin_user: dict = Depends(require_admin)):
    """Retrieve all registered delivery agents from the database."""
    cursor = delivery_agents_collection.find()
    agents = await cursor.to_list(length=1000)
    return [doc_to_agent_response(a) for a in agents]


@router.patch("/delivery-agents/{agent_id}/status", response_model=DeliveryAgentResponse)
async def update_delivery_agent_status(agent_id: str, data: DeliveryAgentStatusUpdate, admin_user: dict = Depends(require_admin)):
    """Update a delivery agent's status (active/banned) in both agent and user collections."""
    agent = await delivery_agents_collection.find_one({"agent_id": agent_id})
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery agent not found")
        
    new_status = data.status
    
    # 1. Update status in delivery_agents_collection
    await delivery_agents_collection.update_one(
        {"agent_id": agent_id},
        {"$set": {"status": new_status}}
    )
    
    # 2. Update status of the user in users_collection
    user_status = "active" if new_status == "active" else "banned"
    await users_collection.update_one(
        {"_id": ObjectId(agent_id)},
        {"$set": {"status": user_status}}
    )
    
    updated = await delivery_agents_collection.find_one({"agent_id": agent_id})
    return doc_to_agent_response(updated)
