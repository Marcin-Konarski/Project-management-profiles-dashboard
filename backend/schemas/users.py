from pydantic import BaseModel, Field


# signup
class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=50)


# login
class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    username: str


# token payload data
class TokenData(BaseModel):
    user_id: str  # user id for any necessary future client requests
