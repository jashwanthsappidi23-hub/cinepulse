from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, AuditLog
from backend.auth import hash_password, verify_password, create_access_token, require_auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: Optional[str] = "customer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Restrict roles self-registered via public route to customer
    assigned_role = req.role if req.role in ["customer", "manager", "admin"] else "customer"

    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hash_password(req.password),
        phone=req.phone.strip(),
        role=assigned_role
    )
    db.add(new_user)
    db.flush()

    # Log to audit trail
    audit = AuditLog(
        user_id=new_user.user_id,
        action="USER_REGISTRATION",
        entity_type="User",
        entity_id=new_user.user_id,
        details=f"New user registered with role {assigned_role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"user_id": new_user.user_id, "email": new_user.email, "role": new_user.role})
    return {
        "success": True,
        "message": "Registration successful!",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": new_user.user_id,
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "role": new_user.role
        }
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"user_id": user.user_id, "email": user.email, "role": user.role})
    
    # Audit log login
    audit = AuditLog(
        user_id=user.user_id,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=user.user_id,
        details="User authenticated successfully."
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": "Login successful!",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }

@router.get("/me")
def get_current_profile(current_user: User = Depends(require_auth)):
    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@router.get("/demo-users")
def get_demo_users():
    """Provides instant 1-click test credentials for viva / demonstration in gmail format"""
    return [
        {
            "role": "customer",
            "name": "Sahasra Reddy (Customer)",
            "email": "customer@gmail.com",
            "password": "password123",
            "portal": "Customer Portal",
            "description": "Patron booking portal. Browse movies, pick seats, order snacks, book and view tickets."
        },
        {
            "role": "manager",
            "name": "Rajesh Sharma (Cinema Manager)",
            "email": "manager@gmail.com",
            "password": "password123",
            "portal": "Manager Operations Portal",
            "description": "Cinema management suite. Schedule screenings, maintain seats, track occupancy, manage snacks."
        },
        {
            "role": "admin",
            "name": "System Administrator",
            "email": "admin@gmail.com",
            "password": "password123",
            "portal": "Admin DBMS Control Portal",
            "description": "Enterprise administrator portal. System analytics, role administration, audit trail logs, revenue reports."
        }
    ]
