# auth_server.py
from datetime import datetime, timedelta
from typing import Optional

import os
from urllib.parse import quote_plus

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    create_engine,
    select,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# =============================================================================
# Config
# =============================================================================

# change this in production (or set SECRET_KEY env)
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-to-a-strong-random-string")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# MySQL connection (env wins; else defaults to local MySQL created earlier)
# mysql+pymysql://<user>:<password>@<host>:<port>/<db>?charset=utf8mb4
DEFAULT_DB_URL = (
    f"mysql+pymysql://aspirely:{quote_plus('Strong#Password123')}"
    f"@127.0.0.1:3306/aspirely_auth?charset=utf8mb4"
)
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# =============================================================================
# DB setup
# =============================================================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # helps avoid stale connections
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # MySQL requires a length for VARCHAR; 191 works well with utf8mb4 + indexes
    email = Column(String(191), unique=True, index=True, nullable=False)
    # bcrypt hashes are ~60 chars; 255 leaves headroom
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =============================================================================
# Security helpers
# =============================================================================

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")  # path hint (we use JSON, not form)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    creds_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise creds_exc
    except JWTError:
        raise creds_exc
    user = db.scalar(select(User).where(User.email == sub))
    if not user:
        raise creds_exc
    return user


# =============================================================================
# Schemas
# =============================================================================

class SignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime


# =============================================================================
# App
# =============================================================================

app = FastAPI(title="Aspirely Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/signup", status_code=201)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    hashed = pwd.hash(body.password)

    user = User(email=email, password_hash=hashed)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")
    # Do NOT log in here; let the client go to /login
    return {"message": "signup_ok"}


@app.post("/api/auth/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    email = body.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not pwd.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return UserOut(id=current.id, email=current.email, created_at=current.created_at)


# Optional: make this file runnable directly (python auth_server.py)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("auth_server:app", host="127.0.0.1", port=8001, reload=True)


#http://127.0.0.1:8001/docs#/



#cd C:\Users\sarth\projects\aspirely1
#uvicorn auth_server:app --reload --port 8001

