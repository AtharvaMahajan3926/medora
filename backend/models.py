"""
Pydantic models for request / response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ── Auth Requests ─────────────────────────────────────────────

class UserSignUp(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="user", pattern="^(user|pharmacist)$")

    # Pharmacist-only fields (required when role == pharmacist)
    pharmacy_name: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    timings: Optional[str] = None
    license_number: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DeliveryAgentSignUp(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone: str
    vehicle_type: str = "bike"
    role: str = "delivery_agent"

class UserSignIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# ── Auth Responses ────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str = "active"
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Delivery Agent Models ─────────────────────────────────────

class DeliveryAgentResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    vehicle_type: str
    availability_status: bool
    status: str
    created_at: Optional[str] = None


# ── Address Models ────────────────────────────────────────────

class AddressBase(BaseModel):
    full_name: str
    phone_number: str
    house_number: str
    street: str
    city: str
    state: str
    pincode: str
    lat: float
    lng: float
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: str
    user_id: str


# ── Admin Models ──────────────────────────────────────────────

class AdminStats(BaseModel):
    totalUsers: int
    totalPharmacies: int
    totalStocks: int
    pendingVerifications: int
    totalDeliveryAgents: int


class PharmacyStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(verified|pending|denied|banned)$")


class DeliveryAgentStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(active|banned)$")


class PharmacyResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    owner_name: str
    email: str
    phone: str
    city: str
    address: str
    lat: float
    lng: float
    timings: str
    license: str
    status: str
    created_at: Optional[str] = None


# ── Inventory Models ──────────────────────────────────────────

class InventoryItemCreate(BaseModel):
    name: str = Field(..., min_length=1)
    type: str = "Tablet"
    category: str
    stock: int
    price: float = 0.0
    expiryDate: str
    rxRequired: bool = False

class InventoryItemUpdate(BaseModel):
    name: str
    type: str = "Tablet"
    category: str
    stock: int
    price: float = 0.0
    expiryDate: str
    rxRequired: bool

class InventoryItemResponse(BaseModel):
    id: str
    medicine_id: str
    name: str
    type: str
    category: str
    stock: int
    price: float
    expiryDate: str
    rxRequired: bool

# ── Booking Models ──────────────────────────────────────────

class BookingItem(BaseModel):
    medicine_id: str
    quantity: int

class BookingCreate(BaseModel):
    pharmacy_id: str
    items: list[BookingItem]

class BookingResponse(BaseModel):
    id: str
    user_id: str
    pharmacy_id: str
    items: list[dict]
    status: str
    qr_token: str
    expires_at: str
    created_at: str

class VerifyBookingRequest(BaseModel):
    qr_token: str


# ── Orders Models (New System) ────────────────────────────────

class OrderItem(BaseModel):
    medicine_id: str
    quantity: int

class OrderCreate(BaseModel):
    pharmacy_id: str
    items: list[OrderItem]
    delivery_method: str = Field(..., pattern="^(home_delivery|store_pickup)$")
    payment_method: str = Field(..., pattern="^(pay_on_delivery|pay_at_shop)$")
    address_id: Optional[str] = None
    is_emergency: bool = False

class OrderResponse(BaseModel):
    id: str
    user_id: str
    pharmacy_id: str
    items: list[dict]
    delivery_method: str
    payment_method: str
    address_id: Optional[str] = None
    delivery_agent_id: Optional[str] = None
    status: str
    qr_code: str
    estimated_delivery_time: Optional[str] = None
    is_emergency: bool
    total_amount: float
    created_at: str
    updated_at: str

