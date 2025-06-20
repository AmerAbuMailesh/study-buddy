from fastapi import APIRouter, Request, HTTPException, Depends
from ..database.db import get_db, create_quota
from svix.webhooks import Webhook
import os, json
from sqlalchemy.orm import Session

router = APIRouter()
@router.post("/clerk")
async def handle_user_created(request: Request, db: Session = Depends(get_db)):
    webhook_secret = os.getenv("CLERK_WEBHOOK_SECRET")

    if not webhook_secret:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET is not set")
    
    body = await request.body()
    payload = body.decode("utf-8")
    headers = dict(request.headers)

    try:
        wh = Webhook(webhook_secret)
        event = wh.verify(payload, headers)
        data = json.loads(payload)

        if data.get("type") == "user.created":
            return {"status": "ignored"}
        
        user_data = data.get("data", {})
        user_id = user_data.get("id")

        create_quota(db, user_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))