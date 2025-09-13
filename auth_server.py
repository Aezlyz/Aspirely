# auth_server.py — Aspirely Auth API (FastAPI + SQLite by default)
# Endpoints:
#   POST /auth/signup
#   POST /auth/login                  (form-data: username, password)
#   GET  /auth/me                     (Authorization: Bearer <token>)
#   POST /auth/forgot-password        (dev: prints reset link to console)
#   POST /auth/reset-password
# Aliases (so frontends can't 404):
#   POST /api/auth/signup
#   POST /api/auth/login              (JSON: {email,password})
#   POST /api/auth/forgot-password
#   POST /api/auth/reset-password
#   POST /auth/login-json             (JSON: {email,password})
# Health:
#   GET  /health

from datetime import datetime, timedelta
from typing import Optional, Dict

import os
import urllib.parse

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from sqlalchemy import create_engine, Column, Integer, String, DateTime, select
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError


# =======================
# Config / Environment
# =======================
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aspirely_auth.db")
FRONTEND_BASE = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5173")

# =======================
# App + CORS
# =======================
app = FastAPI(title="Aspirely Auth")

origins = os.getenv(
    "CORS_ORIGINS",
    "http://127.0.0.1:5173,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================
# Database
# =======================
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, future=True, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


Base.metadata.create_all(engine)

# =======================
# Security / Helpers
# =======================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # form endpoint


def create_access_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if not sub:
            raise credentials_exc
        return {"email": sub}
    except JWTError:
        raise credentials_exc


# =======================
# Schemas
# =======================
class SignupReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: Optional[str] = None


class TokenRes(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordReq(BaseModel):
    email: EmailStr


class ResetPasswordReq(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class LoginJSON(BaseModel):
    email: EmailStr
    password: str


# =======================
# Health
# =======================
@app.get("/health")
def health():
    return {"ok": True}

# Alias so frontend's /api/auth/me works
@app.get("/api/auth/me")
def api_me(identity = Depends(get_current_user)):
    return me(identity)


# =======================
# Core Auth Routes
# =======================
@app.post("/auth/signup")
def signup(body: SignupReq):
    db = SessionLocal()
    try:
        email = body.email.lower()
        if get_user_by_email(db, email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(
            email=email,
            name=body.name,
            password_hash=pwd_context.hash(body.password),
        )
        db.add(user)
        db.commit()
        return {"message": "ok"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        db.close()
# ===== Extra aliases for "forgot/reset password" so any UI path works =====

# Forgot password aliases
@app.post("/api/auth/password/forgot")
@app.post("/auth/password/forgot")
@app.post("/api/auth/forgot")
@app.post("/auth/forgot")
def alias_forgot_password(body: ForgotPasswordReq):
    return forgot_password(body)

# Reset password aliases
@app.post("/api/auth/password/reset")
@app.post("/auth/password/reset")
@app.post("/api/auth/reset")
@app.post("/auth/reset")
def alias_reset_password(body: ResetPasswordReq):
    return reset_password(body)


@app.post("/auth/login", response_model=TokenRes)
def login(form: OAuth2PasswordRequestForm = Depends()):
    """
    Form-data login
    - username: email
    - password: password
    """
    db = SessionLocal()
    try:
        user = get_user_by_email(db, form.username.lower())
        if not user or not pwd_context.verify(form.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        token = create_access_token({"sub": user.email})
        return TokenRes(access_token=token)
    finally:
        db.close()


@app.get("/auth/me")
def me(identity=Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = get_user_by_email(db, identity["email"])
        if not user:
            raise HTTPException(status_code=404, detail="Not found")
        return {"email": user.email, "name": user.name, "created_at": user.created_at}
    finally:
        db.close()


# =======================
# Password Reset (Dev)
# =======================
# In-memory token store for development. Replace with DB + expiry in production.
RESET_TOKENS: Dict[str, str] = {}

from uuid import uuid4  # keep import after top-level to avoid reordering warnings


@app.post("/auth/forgot-password")
def forgot_password(body: ForgotPasswordReq):
    token = uuid4().hex
    RESET_TOKENS[token] = body.email.lower().strip()
    link = f"{FRONTEND_BASE}/reset-password?token={urllib.parse.quote(token)}"
    # Simulate email by logging the link:
    print(f"[DEV] Password reset link for {body.email}: {link}")
    # Return generic message to avoid user enumeration
    return {"message": "If that email exists, a reset link has been sent."}


@app.post("/auth/reset-password")
def reset_password(body: ResetPasswordReq):
    email = RESET_TOKENS.pop(body.token, None)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    db = SessionLocal()
    try:
        user = get_user_by_email(db, email)
        if user:
            user.password_hash = pwd_context.hash(body.new_password)
            db.add(user)
            db.commit()
    finally:
        db.close()

    return {"message": "Password updated"}


# =======================
# Route Aliases (help frontends)
# =======================
@app.post("/api/auth/signup")
def api_signup(body: SignupReq):
    return signup(body)


@app.post("/api/auth/login", response_model=TokenRes)
@app.post("/auth/login-json", response_model=TokenRes)
def api_login_json(body: LoginJSON):
    db = SessionLocal()
    try:
        user = get_user_by_email(db, body.email.lower())
        if not user or not pwd_context.verify(body.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        token = create_access_token({"sub": user.email})
        return TokenRes(access_token=token)
    finally:
        db.close()


@app.post("/api/auth/forgot-password")
def api_forgot_password(body: ForgotPasswordReq):
    return forgot_password(body)


@app.post("/api/auth/reset-password")
def api_reset_password(body: ResetPasswordReq):
    return reset_password(body)

#cd C:\Users\sarth\projects\Aspirely
#py -m uvicorn auth_server:app --reload --host 127.0.0.1 --port 8001