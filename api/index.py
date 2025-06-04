import sys
import os
import logging

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Add the parent directory to the path so we can import app
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    logger.info(f"Python path: {sys.path}")
    logger.info(f"Current directory: {os.getcwd()}")
    logger.info(f"Directory contents: {os.listdir('.')}")
    
    from app import app
    
    # Vercel expects the app to be exposed directly
    logger.info("Flask app imported successfully")
    
except Exception as e:
    logger.error(f"Failed to import app: {str(e)}")
    logger.error(f"Import error type: {type(e).__name__}")
    import traceback
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Create a minimal error app
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/')
    def error():
        return jsonify({
            "error": "Failed to initialize application",
            "details": str(e),
            "type": type(e).__name__
        }), 500 