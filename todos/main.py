from http.client import HTTPException

import uvicorn

from fastapi import Depends, FastAPI, Form, Request, status
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base
import os

import models

# models에 정의한 모든 클래스, 연결한 DB엔진에 테이블로 생성
Base.metadata.create_all(bind=engine)

# FastAPI() 객체 생성
app = FastAPI()

abs_path = os.path.dirname(os.path.realpath(__file__))
# print(abs_path)
# html 템플릿 폴더를 지정하여 jinja템플릿 객체 생성
# templates = Jinja2Templates(directory="templates")
templates = Jinja2Templates(directory=f"{abs_path}/templates")

# static 폴더(정적파일 폴더)를 app에 연결
# app.mount("/static", StaticFiles(directory=f"static"), name="static")
app.mount("/static", StaticFiles(directory=f"{abs_path}/static"), name="static")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        # 마지막에 무조건 닫음
        db.close()

# localhost:8000/
@app.get("/")
def home(request: Request, db_ss: Session = Depends(get_db)):
    # db 객체 생성, 세션연결하기 <- 의존성 주임으로 처리
    # 테이블 조회
    todos = db_ss.query(models.Todo).order_by(models.Todo.id.desc()).all()
    
    print(type(todos))
    # db 조회한 결과를 출력함
    # for todo in todos:
    #     print(todo.id, todo.task, todo.completed)

    return templates.TemplateResponse(
        request = request,
        name = "index.html",
        context={ "todos": todos}
        )

@app.post("/add")
def add(request: Request, task: str = Form(...), 
              db_ss: Session = Depends(get_db)):
    # 클라이언트에서 textarea에서 입력 데이터 넘어온것 확인
    print(task)
    # 클라이언트에서 넘어온 task를 Todo 객체로 생성
    todo = models.Todo(task=task)
    # 의존성 주입에서 처리함 Depends(get_db) : 엔진객체생성, 세션연결
    # db 테이블에 task 저장하기
    print(todo)
    db_ss.add(todo)
    # db에 실제 저장, commit
    db_ss.commit()
    # home 엔드포인함수로 제어권을 넘김
    return RedirectResponse(url=app.url_path_for("home"), 
                            status_code=status.HTTP_303_SEE_OTHER)


# todo 수정을 위한 조회
@app.get("/edit/{todo_id}")
def edit(request: Request, todo_id: int , db_ss: Session = Depends(get_db)):
    # 요청 수정 처리
    todo = db_ss.query(models.Todo).filter(models.Todo.id==todo_id).first()
    print(todo.task)

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    return templates.TemplateResponse(
        request=request,
        name = "edit.html",
        context = {"todo": todo}
    )
  
# todo 업데이터 처리
@app.post("/edit/{todo_id}")
def update(request: Request, todo_id: int, task: str = Form(...), completed: bool = Form(False), db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    todo.task = task
    todo.completed = completed
    db.commit()
    return RedirectResponse(url=app.url_path_for("home"), status_code=status.HTTP_303_SEE_OTHER)




# Todo 삭제 처리
@app.post("/delete/{todo_id}")
def delete_todo(
    request: Request,
    todo_id: int,
    db: Session = Depends(get_db)
):
    todo = (
        db.query(models.Todo)
        .filter(models.Todo.id == todo_id)
        .first()
    )

    if todo:
        db.delete(todo)
        db.commit()

    return RedirectResponse(
        url=app.url_path_for("home"),
        status_code=status.HTTP_303_SEE_OTHER
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )