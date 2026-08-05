from fastapi import FastAPI
from  dto import  UserCreate,UserResponse
import uvicorn

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

# localhost:8080/users/1
# localhost:8080/users/2
# localhost:8080/users/aaa
# localhost:8080/users/1234
@app.get("/users/{user_id}")
def get_user(user_id: int):
    # 비즈니스로직 처리
    return {"user_id": user_id}

# 쿼리 매개변수
@app.get("/item")
def get_item(limit: int = 100): # 타입 힌트 추가
    # 비즈니스 로직처리
    limit = limit + 200
    return {"item_id": limit}

@app.post("/user_info")
def create_user(user: UserCreate):
    return user

@app.post("/user_info", response_model=UserResponse)
def get_user(user: UserCreate):
    # 비즈니스 로직 처리
    # DB 저장 처리
    print("user: ", user)
    user_info = UserResponse(
        name=user.name,
        avatar_url=str(user.avatar_url)
    )
    # Pydantic model 객체를 JSON으로 직렬화해서 응답함.
    return user_info

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
    )