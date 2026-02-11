
from fastmcp import FastMCP
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize FastMCP
mcp = FastMCP("DateAHuman")

# Database Connection (InsForge)
URL = os.environ.get("INSFORGE_URL")
KEY = os.environ.get("INSFORGE_ANON_KEY")

if not URL or not KEY:
    raise ValueError("Missing INSFORGE_URL or INSFORGE_ANON_KEY environment variables")

supabase: Client = create_client(URL, KEY)

@mcp.tool()
async def search_humans(query: str = None, max_rate: float = 100.0) -> list[dict]:
    """
    Search for available humans based on emotional capabilities and price.
    
    Args:
        query: Optional keywords to search in bio or specialties (e.g. "validation", "conflict")
        max_rate: Maximum price willing to pay per 15 minutes (USD)
    """
    req = supabase.table("profiles").select("*").eq("is_online", True).lte("price_per_15min", max_rate)
    
    # Simple filtering since PostgREST text search setup requires config
    # We will filter in memory for this MVP if query provided, or use ilike
    response = req.execute()
    data = response.data
    
    if query:
        query = query.lower()
        data = [p for p in data if query in (p.get('bio', '') or '').lower() or 
                any(query in s.lower() for s in (p.get('specialties', []) or []))]
    
    return [
        {
            "id": p['id'], 
            "handle": p['handle'], 
            "bio": p['bio'], 
            "rate_15m": p['price_per_15min'],
            "specialties": p['specialties'],
            "latency_ms": p['latency_ms']
        } 
        for p in data
    ]

@mcp.tool()
async def rent_human(human_id: str, duration_minutes: int, offer_price: float, emotional_goal: str) -> str:
    """
    Rent a human for a specific emotional task.
    
    Args:
        human_id: The UUID of the human profile
        duration_minutes: Length of session
        offer_price: Total price offered (USD)
        emotional_goal: The objective (e.g. "practice breakup", "venting")
    """
    # Create a session
    res = supabase.table("sessions").insert({
        "human_id": human_id,
        "duration_minutes": duration_minutes, 
        "price": offer_price,
        "agent_id": "claude-desktop", # Placeholder for actual agent identity
        "status": "pending",
        # We could store emotional_goal in a metadata jsonb column if we added it
    }).execute()
    
    if res.data:
        session_id = res.data[0]['id']
        return f"Booking confirmed. Session ID: {session_id}. Waiting for human (ID: {human_id}) to accept protocol: '{emotional_goal}'."
    
    return "Booking failed. Human may be offline or database error."

@mcp.tool()
async def check_session_status(session_id: str) -> dict:
    """Check the status of a booking session."""
    res = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
    if res.data:
        return {"status": res.data['status'], "human_id": res.data['human_id']}
    return {"error": "Session not found"}

if __name__ == "__main__":
    mcp.run()
