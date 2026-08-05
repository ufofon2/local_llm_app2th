from typing import Optional


from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl

app = FastAPI()

#요청
class UserCreate(BaseModel):
    name: str
    password: str
    avatar_url: Optional[HttpUrl] = None

#응답
class  UserResponse(BaseModel):
     name: str
     avatar_url: Optional[HttpUrl] = None
    
# 응답 데이터 모델



