#!/usr/bin/env python3
"""
Polymarket Data Fetcher Runner
This script starts the Flask web application for fetching Polymarket data.
"""

import os
import webbrowser
from threading import Timer
from app import app

def open_browser():
    """Open web browser to the application URL"""
    webbrowser.open('http://127.0.0.1:5000/')

if __name__ == "__main__":
    # Set host and port
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")
    
    # Open browser after 1 second
    Timer(1, open_browser).start()
    
    # Start the Flask application
    print("="*80)
    print("Polymarket Data Fetcher Web App")
    print("="*80)
    print(f"Starting server at http://{host}:{port}")
    print("Opening browser automatically...")
    print("Press Ctrl+C to stop the server")
    print("="*80)
    
    app.run(host=host, port=port, debug=False)