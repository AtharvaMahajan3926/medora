from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from typing import List

from database import addresses_collection
from models import AddressCreate, AddressResponse
from auth import get_current_user

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])

@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(data: AddressCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    # If is_default is true, unset other defaults
    if data.is_default:
        await addresses_collection.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )

    address_doc = data.dict()
    address_doc["user_id"] = user_id
    
    result = await addresses_collection.insert_one(address_doc)
    
    # Return response
    return AddressResponse(
        id=str(result.inserted_id),
        **address_doc
    )

@router.get("/", response_model=List[AddressResponse])
async def get_addresses(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    addresses_cur = addresses_collection.find({"user_id": user_id})
    addresses = []
    
    async for addr in addresses_cur:
        addr_resp = AddressResponse(
            id=str(addr["_id"]),
            user_id=addr["user_id"],
            full_name=addr["full_name"],
            phone_number=addr["phone_number"],
            house_number=addr["house_number"],
            street=addr["street"],
            city=addr["city"],
            state=addr["state"],
            pincode=addr["pincode"],
            lat=addr["lat"],
            lng=addr["lng"],
            is_default=addr.get("is_default", False)
        )
        addresses.append(addr_resp)
        
    return addresses

@router.put("/{address_id}", response_model=AddressResponse)
async def update_address(address_id: str, data: AddressCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    if not ObjectId.is_valid(address_id):
        raise HTTPException(status_code=400, detail="Invalid address ID")
        
    existing = await addresses_collection.find_one({"_id": ObjectId(address_id), "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
        
    if data.is_default:
        await addresses_collection.update_many(
            {"user_id": user_id},
            {"$set": {"is_default": False}}
        )
        
    update_data = data.dict()
    await addresses_collection.update_one(
        {"_id": ObjectId(address_id)},
        {"$set": update_data}
    )
    
    return AddressResponse(
        id=address_id,
        user_id=user_id,
        **update_data
    )

@router.delete("/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    if not ObjectId.is_valid(address_id):
        raise HTTPException(status_code=400, detail="Invalid address ID")
        
    result = await addresses_collection.delete_one({"_id": ObjectId(address_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
        
    return {"detail": "Address deleted successfully"}
