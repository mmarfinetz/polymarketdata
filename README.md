# Polymarket Data Fetcher Web App

A simple web application to fetch and download top markets and events data from Polymarket.

## Features

- Fetch top 50 markets by volume
- Fetch top 50 events by 24h volume
- View results in a sortable table
- Download data as CSV files

## Installation

1. Clone this repository
2. Install required packages:

```bash
pip install -r requirements.txt
```

## Usage

1. Run the web application:

```bash
# Option 1: Using the run script (recommended)
python run.py

# Option 2: Using Flask directly
python -m flask --app app run
```

2. Open your browser and navigate to http://127.0.0.1:5000/
3. Click on either "Fetch Top Markets" or "Fetch Top Events"
4. After the data is loaded, you can download the CSV file using the "Download CSV" button

## Files

- `app.py`: Flask web application
- `polymarket.py`: Module for fetching top markets data
- `polymarketevents.py`: Module for fetching top events data
- `templates/index.html`: HTML template for the web interface

## Requirements

- Python 3.7+
- Flask
- Requests
- Pandas
- python-dateutil