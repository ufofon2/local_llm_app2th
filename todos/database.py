from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

# DB_URL = 'sqlite:///todos.sqlite3'

# 데이터베이스에 연결하는 엔진을 생성하는 함수
# engine = create_engine(DB_URL, connect_args={'check_same_thread': False})


from db_env import user, password, host, db_name

# mysql 연결 시·
# "mysql+pymysql://user_ID:password@host_IP:3306/DB_name"

DB_URL = f"mysql+pymysql://{user}:{password}@{host}:3306/{db_name}"
# mysql 연결 객체 생성
engine = create_engine(DB_URL)

# 데이터베이스와 상호 작용하는 세션을 생성하는 클래스
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLAlchemy의 선언적 모델링을 위한 기본 클래스
Base = declarative_base()