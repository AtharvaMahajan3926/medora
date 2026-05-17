from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone

from database import orders_collection, inventory_collection, pharmacies_collection, users_collection
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/qr", tags=["QR Verification"])

class VerifyQRRequest(BaseModel):
    qr_code: str

@router.post("/verify")
async def verify_qr_code(data: VerifyQRRequest, current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role not in ["delivery_agent", "pharmacist"]:
        raise HTTPException(status_code=403, detail="Not authorized to verify QR codes")
        
    order = await orders_collection.find_one({"qr_code": data.qr_code})
    if not order:
        raise HTTPException(status_code=404, detail="Invalid QR code")
        
    if order.get("status") in ["Delivered", "Picked Up", "Cancelled"]:
        raise HTTPException(status_code=400, detail=f"Order is already {order['status']}")

    new_status = ""
    # Verify ownership
    if role == "delivery_agent":
        if order.get("delivery_method") != "home_delivery":
            raise HTTPException(status_code=400, detail="This order is not for home delivery")
        if order.get("delivery_agent_id") != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="You are not assigned to this order")
        new_status = "Delivered"
            
    elif role == "pharmacist":
        if order.get("delivery_method") != "store_pickup":
            raise HTTPException(status_code=400, detail="This order is not for store pickup")
            
        pharmacy = await pharmacies_collection.find_one({"owner_id": current_user["_id"]})
        if not pharmacy or (pharmacy.get("legacy_id") != order["pharmacy_id"] and str(pharmacy["_id"]) != order["pharmacy_id"]):
            raise HTTPException(status_code=403, detail="Not your pharmacy's order")
        new_status = "Picked Up"
            
    # Reduce inventory!
    # According to rules: Stock reduces ONLY after successful delivery/pickup
    actual_pid = order["pharmacy_id"]
    for item in order["items"]:
        await inventory_collection.update_one(
            {"pharmacy_id": actual_pid, "medicine_id": item["medicine_id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
        
    # Mark order as Delivered/Picked Up
    await orders_collection.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Get user details for response
    user = await users_collection.find_one({"_id": ObjectId(order["user_id"])})
    customer_name = user.get("name", "Unknown Customer") if user else "Unknown Customer"
    
    return {
        "detail": f"Order successfully marked as {new_status}. Inventory updated.",
        "order_id": str(order["_id"]),
        "status": new_status,
        "customer_name": customer_name,
        "total_amount": order.get("total_amount")
    }
