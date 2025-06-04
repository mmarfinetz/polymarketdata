from flask import Flask, render_template, request, send_file, jsonify
import os
import json
import traceback
import logging
import tempfile
from polymarket import PolymarketFetcher
from polymarketevents import PolymarketEventsFetcher

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Ensure we have a writable tmp directory for serverless environment
temp_dir = tempfile.gettempdir()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch_markets', methods=['POST'])
def fetch_markets():
    try:
        # Set higher timeouts for serverless environment
        logger.info("Fetching top markets by volume")
        fetcher = PolymarketFetcher()
        
        # In a serverless environment, we need to be mindful of timeouts
        # Log the start of the operation
        logger.info("Starting markets API request...")
        raw_markets = fetcher.fetch_top_markets_by_volume(50)
        logger.info(f"Received markets API response with {len(raw_markets) if raw_markets else 0} markets")
        
        if not raw_markets:
            logger.error("Failed to fetch markets data - empty response")
            return jsonify({"error": "Failed to fetch markets data"}), 500
        
        # Parse and filter the markets
        parsed_markets = []
        for i, market in enumerate(raw_markets, 1):
            parsed = fetcher.parse_market_data(market, i)
            if parsed:
                parsed_markets.append(parsed)
        
        # Take only top 50 and re-rank them
        top_markets = parsed_markets[:50]
        for i, market in enumerate(top_markets, 1):
            market['rank'] = i
        
        # Save data to CSV - use temp directory for serverless environment
        filename = os.path.join(temp_dir, "polymarket_top50.csv")
        fetcher.save_to_csv(top_markets, filename)
        
        # Ensure required fields are present in each market
        for market in top_markets:
            # These fields should already be present from parse_market_data
            # Just making sure they're explicitly included
            market.setdefault('created_at', None)
            market.setdefault('end_date', None)
            market.setdefault('url', None)
            market.setdefault('liquidity', 0)
        
        logger.info(f"Successfully fetched {len(top_markets)} markets")
        return jsonify({
            "success": True, 
            "message": f"Successfully fetched {len(top_markets)} markets", 
            "markets": top_markets,
            "filename": filename
        })
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error fetching markets: {error_msg}")
        logger.error(traceback.format_exc())
        return jsonify({"error": error_msg}), 500

@app.route('/fetch_events', methods=['POST'])
def fetch_events():
    try:
        # Set higher timeouts for serverless environment
        logger.info("Fetching top events by volume")
        fetcher = PolymarketEventsFetcher()
        
        # In a serverless environment, we need to be mindful of timeouts
        # Log the start of the operation
        logger.info("Starting events API request...")
        raw_events = fetcher.fetch_top_events_by_volume(50)
        logger.info(f"Received events API response with {len(raw_events) if raw_events else 0} events")
        
        if not raw_events:
            logger.error("Failed to fetch events data - empty response")
            return jsonify({"error": "Failed to fetch events data"}), 500
        
        # Parse and filter events
        parsed_events = []
        for i, event in enumerate(raw_events, 1):
            parsed = fetcher.parse_event_data(event, i)
            if parsed:
                parsed_events.append(parsed)
        
        # Take only top 50 and re-rank them
        top_events = parsed_events[:50]
        for i, event in enumerate(top_events, 1):
            event['rank'] = i
        
        # Save data to CSV - use temp directory for serverless environment
        filename = os.path.join(temp_dir, "polymarket_top50_events.csv")
        fetcher.save_to_csv(top_events, filename)
        
        # Ensure required fields are present in each event
        for event in top_events:
            # These fields should already be present from parse_event_data
            # Just making sure they're explicitly included
            event.setdefault('created_at', None)
            event.setdefault('end_date', None)
            event.setdefault('url', None)
            event.setdefault('liquidity', 0)
            event.setdefault('market_count', 0)
            event.setdefault('featured', False)
            event.setdefault('event_id', None)
        
        logger.info(f"Successfully fetched {len(top_events)} events")
        return jsonify({
            "success": True, 
            "message": f"Successfully fetched {len(top_events)} events", 
            "events": top_events,
            "filename": filename
        })
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error fetching events: {error_msg}")
        logger.error(traceback.format_exc())
        return jsonify({"error": error_msg}), 500

@app.route('/download/<filename>')
def download_file(filename):
    if filename not in ["polymarket_top50.csv", "polymarket_top50_events.csv"]:
        logger.warning(f"Invalid download request for file: {filename}")
        return "File not found", 404
    
    # Use the temp directory path for the file
    file_path = os.path.join(temp_dir, filename)
    
    if not os.path.exists(file_path):
        logger.warning(f"Requested file does not exist: {file_path}")
        return "File not available yet. Please fetch data first.", 404
    
    logger.info(f"Serving download for file: {file_path}")
    return send_file(file_path, as_attachment=True)

# Create a WSGI entry point for Vercel
# The Vercel Python runtime will look for a variable called 'app'
# which is already defined above as our Flask application

# This section is only used for local development
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting Polymarket Data Fetcher app on {host}:{port}")
    app.run(host=host, port=port, debug=True)