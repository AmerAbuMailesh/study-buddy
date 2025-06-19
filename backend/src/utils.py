from fastapi import HTTPException
from clerk_backend_api import AuthenticateRequestOptions, Clerk
import os
from dotenv import load_dotenv

load_dotenv()

def authenticate_and_get_user_details(request):
    try:
        # Check if environment variables are set
        clerk_secret = os.getenv("CLERK_SECRET_KEY")
        jwt_key = os.getenv("JWT_KEY")
        
        if not clerk_secret:
            raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY not set")
        if not jwt_key:
            raise HTTPException(status_code=500, detail="JWT_KEY not set")
        
        clerk_sdk = Clerk(bearer_auth=clerk_secret)
        
        # Include more possible origins
        authorized_parties = [
            "https://localhost:5173",
            "https://localhost:5174", 
            "https://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "https://localhost:8000",
            "http://localhost:8000"
        ]
        
        request_state = clerk_sdk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=authorized_parties,
                jwt_key=jwt_key,
            )
        )
        
        if not request_state.is_signed_in:
            raise HTTPException(status_code=401, detail=f"Invalid token: {request_state.reason}")

        if not request_state.payload:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        user_id = request_state.payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found in token")

        return {"user_id": user_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Authentication error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")
