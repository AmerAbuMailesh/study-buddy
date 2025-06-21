from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.db import get_db, create_timer_session
from ..database.models import TimerSession
from ..utils import authenticate_and_get_user_details
from sqlalchemy import select
from datetime import datetime, timedelta

router = APIRouter()

class TimerSessionCreate(BaseModel):
    subject: str
    duration: int  # duration in seconds

@router.post("/timer-session")
async def create_timer_session_endpoint(
    timer_data: TimerSessionCreate, 
    request: Request, 
    db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request)
        user_id = str(user_details.get("user_id"))
        duration_minutes = timer_data.duration // 60

        # Create the timer session with start time calculated from completion time
        completion_time = datetime.now()
        start_time = completion_time - timedelta(minutes=duration_minutes)
        
        timer_session = create_timer_session(
            db=db, 
            user_id=user_id, 
            subject=timer_data.subject, 
            duration=duration_minutes,
            date_started=start_time
        )

        return {
            "id": timer_session.id,
            "subject": timer_session.subject,
            "duration": timer_session.duration,
            "date_started": timer_session.date_started.isoformat() if timer_session.date_started else None,
            "message": f"Timer session for {timer_data.subject} ({timer_data.duration // 60} minutes) saved successfully!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/timer-sessions")
async def get_timer_sessions(request: Request, db: Session = Depends(get_db)):
    try:
        user_details = authenticate_and_get_user_details(request)
        user_id = str(user_details["user_id"])
        
        # Get all timer sessions for the user, ordered by most recent first
        timer_sessions = db.scalars(
            select(TimerSession)
            .where(TimerSession.user_id == user_id)
            .order_by(TimerSession.date_started.desc())
        ).all()
        
        return {
            "timer_sessions": [
                {
                    "id": session.id,
                    "subject": session.subject,
                    "duration": session.duration,
                    "date_started": session.date_started.isoformat() if session.date_started else None
                }
                for session in timer_sessions
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 