import re
from sqlmodel import Session, select
from ..models.user import User, UserCreate
from ..schemas.auth import UserResponse
from ..utils.password import hash_password, verify_password
from ..utils.jwt import create_access_token
from datetime import timedelta
from typing import Optional
from uuid import UUID

class AuthService:
    @staticmethod
    def register_user(session: Session, user_data: UserCreate) -> UserResponse:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
        if existing_user:
            raise ValueError("Email already registered")

        # Check if username already exists
        existing_username = session.exec(select(User).where(User.username == user_data.username)).first()
        if existing_username:
            raise ValueError("Username already taken")

        # Hash the password
        hashed_password = hash_password(user_data.password)

        # Create the user
        user = User(
            email=user_data.email.lower(),
            username=user_data.username,
            password_hash=hashed_password
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        # Return the user response
        return UserResponse.from_orm(user)

    @staticmethod
    def login_user(session: Session, identifier: str, password: str) -> tuple[str, UserResponse]:
        # Check if identifier is an email
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        is_email = '@' in identifier and bool(re.match(email_regex, identifier))

        # Find the user by email or username
        if is_email:
            user = session.exec(select(User).where(User.email == identifier.lower())).first()
        else:
            # Search by username
            user = session.exec(select(User).where(User.username == identifier)).first()

        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid credentials")

        # Create access token
        token_data = {
            "sub": str(user.id),
            "email": user.email
        }
        access_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=1440)  # 24 hours
        )

        # Return token and user info
        user_response = UserResponse.from_orm(user)
        return access_token, user_response

    @staticmethod
    def get_current_user(session: Session, user_id: UUID) -> Optional[UserResponse]:
        user = session.get(User, user_id)
        if not user:
            return None
        return UserResponse.from_orm(user)
