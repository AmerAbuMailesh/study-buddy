from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database.db import (
    get_quota,
    create_quota,
    reset_quota_if_needed,
    create_quote,
    get_user_quotes
)
from ..database.db import get_db
from ..utils import authenticate_and_get_user_details
import json
from datetime import datetime
from ..ai_generator import generate_quote_data

router = APIRouter()

@router.post("/generate-quote")
async def generate_quote(request_obj: Request, db: Session = Depends(get_db)):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = str(user_details.get("user_id"))

        quota = get_quota(db, user_id)
        if not quota:
            quota = create_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.remaining <= 0:
            raise HTTPException(status_code=429, detail="You have reached your daily quote limit.")
        
        quote_data = generate_quote_data()
        text,author = quote_data["quote"], quote_data["author"]

        new_quote = create_quote(db, user_id, text, author)

        quota.remaining -= 1
        db.commit()
        
        return {
            "text": text,
            "author": author,
            "id": str(new_quote.id),
            "date_created": new_quote.date_created.isoformat() if new_quote.date_created else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-history")
async def get_my_history(request: Request, db: Session = Depends(get_db)):
        user_details = authenticate_and_get_user_details(request)
        user_id = str(user_details["user_id"])
        quotes = get_user_quotes(db, user_id)
        return {"quotes": quotes}
   

@router.get("/quota")
async def get_my_quota(request: Request, db: Session = Depends(get_db)):
        user_details = authenticate_and_get_user_details(request)
        user_id = str(user_details["user_id"])
        quota = get_quota(db, user_id)
        
        if not quota:
            return {
                        "user_id": user_id,
                        "quota_remaining": 0,
                        "last_reset_date": datetime.now().isoformat()
                    }
        quota = reset_quota_if_needed(db, quota)
        return quota

