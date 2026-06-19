from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# Models
class SessionRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_a_name: str
    player_b_name: str
    level1_answers: List[Dict[str, Any]] = []
    level2_answers: List[Dict[str, Any]] = []
    status: str = "completed"  # completed | inactivity | declined
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SessionCreate(BaseModel):
    player_a_name: str
    player_b_name: str
    level1_answers: List[Dict[str, Any]] = []
    level2_answers: List[Dict[str, Any]] = []
    status: str = "completed"


@api_router.get("/")
async def root():
    return {"message": "KnowEm API. Know each other. For real."}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/sessions", response_model=SessionRecord)
async def save_session(payload: SessionCreate):
    record = SessionRecord(**payload.model_dump())
    doc = record.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.sessions.insert_one(doc)
    return record


@api_router.get("/sessions/{session_id}", response_model=Optional[SessionRecord])
async def get_session(session_id: str):
    doc = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not doc:
        return None
    if isinstance(doc.get('created_at'), str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return SessionRecord(**doc)


@api_router.get("/stats")
async def stats():
    total = await db.sessions.count_documents({})
    return {"total_sessions": total}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
