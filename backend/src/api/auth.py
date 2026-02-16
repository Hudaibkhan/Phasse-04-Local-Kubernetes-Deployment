from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session
from ..db.session import get_session
from ..services.auth_service import AuthService
from ..schemas.auth import RegisterRequest, LoginRequest, UserResponse, TokenResponse
from ..models.user import UserCreate
from ..middleware.auth import get_current_user_id
from uuid import UUID
from typing import Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: RegisterRequest,
    session: Session = Depends(get_session)
):
    try:
        logger.info(f"Register request received for email: {user_data.email}")
        # Convert RegisterRequest to UserCreate for the service layer
        user_create = UserCreate(email=user_data.email, username=user_data.username, password=user_data.password)
        user = AuthService.register_user(session, user_create)
        logger.info(f"User registered successfully with id: {user.id}")
        return user
    except ValueError as e:
        logger.error(f"ValueError during registration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    session: Session = Depends(get_session)
):
    try:
        access_token, user = AuthService.login_user(session, login_data.identifier, login_data.password)

        # Set HTTP-only cookie with the token
        response.set_cookie(
            key="auth_token",
            value=access_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=86400  # 24 hours
        )

        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_current_user(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    user_id = UUID(current_user_id)
    user = AuthService.get_current_user(session, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user

@router.post("/logout")
def logout(response: Response):
    # Clear the auth token cookie
    response.set_cookie(
        key="auth_token",
        value="",
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=0  # Expire immediately
    )
    return {"message": "Logged out successfully"}
