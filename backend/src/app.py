from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from clerk_backend_api import Clerk
import os
from .routes import quote, webhooks, timer

clerk_sdk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

app.include_router(quote.router, prefix="/api")
app.include_router(timer.router, prefix="/api")
app.include_router(webhooks.router, prefix="/webhooks")