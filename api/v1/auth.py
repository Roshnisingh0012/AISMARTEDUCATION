import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.security import verify_password, get_password_hash, create_access_token
from db.session import get_db
from db.models import User, UserRole
from schemas.user import UserCreate, UserResponse, Token
from api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        email_clean = user_in.email.strip().lower()
        
        result = await db.execute(select(User).where(User.email == email_clean))
        existing_user = result.scalars().first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        
        assigned_role = UserRole.LEARNER
        if user_in.role and str(user_in.role).lower() in ["admin", "userrole.admin"]:
            assigned_role = UserRole.ADMIN
            
        chosen_job_role = getattr(user_in, 'designation', None) or getattr(user_in, 'job_role', None) or "Senior Statistical Officer"
        
        new_user = User(
            id=uuid.uuid4(),
            email=email_clean,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name or email_clean.split('@')[0],
            role=assigned_role,
            department=user_in.department or "MoSPI",
            designation=chosen_job_role,
            has_completed_diagnostic=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        logger.info(f"Successfully saved user to DB: {new_user.email} with id {new_user.id}")
        print(f"Successfully saved user to DB: {new_user.email} with id {new_user.id}")
        
        access_token = create_access_token(subject=str(new_user.id))
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "id": str(new_user.id),
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
            "department": new_user.department,
            "designation": new_user.designation,
            "has_completed_diagnostic": new_user.has_completed_diagnostic
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Registration error: {e}", exc_info=True)
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    email_clean = form_data.username.strip().lower()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user
