# backend/db/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Union # Import Union for older Python versions

# Load environment variables from .env file in the backend directory
load_dotenv() 

# Fetch Supabase credentials from environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL") 
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") 

# Use Union[Client, None] for compatibility with Python < 3.10
supabase_client: Union[Client, None] = None

# Check if credentials were loaded
if not SUPABASE_URL or not SUPABASE_KEY:
    print("---")
    print("Error: SUPABASE_URL or SUPABASE_KEY environment variables not found or empty.")
    print("Ensure you have a .env file in the /backend directory with these values:")
    print("SUPABASE_URL=YOUR_PROJECT_URL")
    print("SUPABASE_KEY=YOUR_SERVICE_ROLE_SECRET_KEY")
    print("---")
    # Keep supabase_client as None
else:
    # Initialize Supabase client
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully.")
        # Optional: You could add a test query here if needed, like listing tables
        # Be mindful that using admin functions might require specific setup/permissions
        # try:
        #     # Example: Test connection by attempting to list tables (requires permissions)
        #     # This is just an example, might not work depending on Supabase setup/permissions
        #     # tables = supabase_client.rpc('pg_tables', {}).execute() 
        #     # print(f"Successfully connected to Supabase. Test query successful.")
        #     pass # Add a meaningful test if desired
        # except Exception as test_error:
        #     print(f"Supabase client initialized, but a test query failed: {test_error}")

    except Exception as e:
        print(f"--- Error initializing Supabase client ---")
        print(f"Error: {e}")
        print(f"Used URL: {SUPABASE_URL[:20]}... (check if correct)") 
        # Don't print the key
        print("-----------------------------------------")
        supabase_client = None # Set to None if initialization fails

def get_supabase_client() -> Union[Client, None]:
    """Returns the initialized Supabase client instance."""
    if supabase_client is None:
        # This warning will now appear only if initialization actually failed
        print("Warning: get_supabase_client() called, but Supabase client is not available. Check initialization logs.")
    return supabase_client