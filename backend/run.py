import os
import sys
import uvicorn

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",  # Use the import string format
        host="0.0.0.0",
        port=8001,
        reload=True
    ) 
