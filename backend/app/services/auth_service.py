from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.models.user import User, UserRole
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, DomainException

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register_user(self, email: str, password: str, role: UserRole) -> User:
        if self.user_repo.get_by_email(email):
            raise DomainException("User with this email already exists.")
        
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=role
        )
        return self.user_repo.create(user)

    def authenticate_user(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Incorrect email or password.")
        
        if not user.is_active:
            raise DomainException("Inactive user account.")

        token = create_access_token(subject=user.id, role=user.role.value)
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role.value,
            "user_id": user.id
        }
