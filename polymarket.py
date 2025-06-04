import requests
import json
from datetime import datetime
from typing import List, Dict, Optional
import time

try:
    from dateutil.parser import parse as parse_date
except ImportError:
    print("Warning: python-dateutil not installed. Date parsing may be limited.")
    def parse_date(date_string):
        # Fallback basic date parsing
        return datetime.fromisoformat(date_string.replace('Z', '+00:00'))

class PolymarketFetcher:
    def __init__(self):
        self.base_url = "https://gamma-api.polymarket.com"
        self.markets_endpoint = "/markets"
        self.events_endpoint = "/events"  # Add events endpoint
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def parse_category_from_tags(self, tags: List[Dict]) -> str:
        """Parse category from tags list, prioritizing meaningful categories"""
        if not tags:
            return 'Uncategorized'
        
        # Define category priorities (higher priority categories listed first)
        priority_categories = {
            'Global Elections': 'Politics',
            'Elections': 'Politics', 
            'Politics': 'Politics',
            'US Election': 'Politics',
            'World Elections': 'Politics',
            'Trump Presidency': 'Politics',
            'Fed Rates': 'Economy',
            'Economy': 'Economy',
            'Economic Policy': 'Economy',
            'Business': 'Economy',
            'Crypto': 'Crypto',
            'Bitcoin': 'Crypto',
            'Ethereum': 'Crypto',
            'Crypto Prices': 'Crypto',
            'Solana': 'Crypto',
            'Sports': 'Sports',
            'NBA': 'Sports',
            'MLB': 'Sports',
            'NHL': 'Sports',
            'UFC': 'Sports',
            'Tennis': 'Sports',
            'Soccer': 'Sports',
            'Formula 1': 'Sports',
            'Basketball': 'Sports',
            'Hockey': 'Sports',
            'Football': 'Sports',
            'Culture': 'Entertainment',
            'Movies': 'Entertainment',
            'Pop Culture': 'Entertainment',
            'Chess': 'Entertainment',
            'Geopolitics': 'World Affairs',
            'World': 'World Affairs',
            'Foreign Policy': 'World Affairs',
            'Ukraine': 'World Affairs',
            'Israel': 'World Affairs',
            'Russia': 'World Affairs',
            'China': 'World Affairs',
            'Iran': 'World Affairs',
            'AI': 'Technology',
            'Big Tech': 'Technology',
            'Breaking News': 'News'
        }
        
        # Extract labels from tags
        labels = []
        for tag in tags:
            if isinstance(tag, dict) and 'label' in tag:
                label = tag['label']
                if not tag.get('forceHide', False):  # Skip hidden tags
                    labels.append(label)
            elif isinstance(tag, str):
                labels.append(tag)
        
        # Find highest priority category
        for label in labels:
            if label in priority_categories:
                return priority_categories[label]
        
        # If no priority match, use the first non-generic label
        generic_labels = {'Recurring', 'Hide From New', 'Monthly', 'Weekly', 'Daily', '2025 Predictions'}
        for label in labels:
            if label not in generic_labels and len(label) > 2:
                return label
            
        return 'Uncategorized'
    
    def fetch_top_markets_by_volume(self, n: int = 50) -> List[Dict]:
        """Fetch top N markets by volume from Gamma Markets API"""
        print(f"Fetching top {n} markets by volume from Polymarket Gamma API...")
        
        try:
            # Try different API parameters to match website behavior
            url = f"{self.base_url}{self.markets_endpoint}"
            params = {
                'order': 'volume24hr',  # Try 24hr volume instead of total volume
                'ascending': 'false',
                'limit': n * 3,  # Fetch more to account for filtering
                'closed': 'false',
                'active': 'true',
                'include_trading_stats': 'true',
                'include_market_liquidity': 'true',
                'include_categories': 'true',
                'include_timestamps': 'true',
                'end_date_min': int(datetime.now().timestamp())
            }
            
            print(f"Requesting URL: {url}")
            print(f"Request parameters: {json.dumps(params, indent=2)}")
            
            start_time = time.time()
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response_time = time.time() - start_time
            
            print(f"API response time: {response_time:.2f} seconds")
            print(f"Response status code: {response.status_code}")
            
            try:
                response.raise_for_status()
            except requests.exceptions.HTTPError as e:
                print(f"HTTP Error: {e}")
                print(f"Response body: {response.text[:500]}...")
                
                # If 24hr volume doesn't work, try regular volume ordering
                print("Trying with regular 'volume' parameter...")
                params['order'] = 'volume'
                response = requests.get(url, headers=self.headers, params=params, timeout=30)
                response.raise_for_status()
            
            try:
                markets = response.json()
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw response content: {response.text[:500]}...")
                return []
            
            # Debug: Print first few markets to see structure
            if isinstance(markets, list) and len(markets) > 0:
                print(f"Successfully fetched {len(markets)} markets")
                print("\n=== DEBUG: First market structure ===")
                first_market = markets[0]
                print(f"Market keys: {list(first_market.keys())}")
                
                # Look for different volume fields
                volume_fields = []
                for key in first_market.keys():
                    if 'volume' in key.lower():
                        volume_fields.append(f"{key}: {first_market.get(key)}")
                
                print(f"Volume-related fields: {volume_fields}")
                print(f"Title: {first_market.get('title', 'N/A')}")
                print(f"Active: {first_market.get('active', 'N/A')}")
                print(f"Closed: {first_market.get('closed', 'N/A')}")
                print("=====================================\n")
                
                return markets
            elif isinstance(markets, dict) and 'markets' in markets:
                markets_list = markets.get('markets', [])
                print(f"Extracted {len(markets_list)} markets from response")
                
                if len(markets_list) > 0:
                    print("\n=== DEBUG: First market structure ===")
                    first_market = markets_list[0]
                    print(f"Market keys: {list(first_market.keys())}")
                    
                    volume_fields = []
                    for key in first_market.keys():
                        if 'volume' in key.lower():
                            volume_fields.append(f"{key}: {first_market.get(key)}")
                    
                    print(f"Volume-related fields: {volume_fields}")
                    print(f"Title: {first_market.get('title', 'N/A')}")
                    print("=====================================\n")
                
                return markets_list
            else:
                print(f"Unexpected response format: {type(markets)}")
                print(f"Response keys: {markets.keys() if isinstance(markets, dict) else 'Not a dictionary'}")
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Network error fetching markets: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in fetch_top_markets_by_volume: {type(e).__name__}: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return []
    
    def fetch_top_events_by_volume(self, n: int = 50) -> List[Dict]:
        """Fetch top N events by volume from Gamma Events API"""
        print(f"Fetching top {n} events by volume from Polymarket Gamma Events API...")
        
        try:
            url = f"{self.base_url}{self.events_endpoint}"
            params = {
                'order': 'volume24hr',
                'ascending': 'false',
                'limit': n * 2,
                'closed': 'false',
                'active': 'true',
                'include_trading_stats': 'true',
                'include_market_liquidity': 'true',
                'include_categories': 'true',
                'include_timestamps': 'true',
                'end_date_min': int(datetime.now().timestamp())
            }
            
            print(f"Requesting Events URL: {url}")
            print(f"Request parameters: {json.dumps(params, indent=2)}")
            
            start_time = time.time()
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response_time = time.time() - start_time
            
            print(f"Events API response time: {response_time:.2f} seconds")
            print(f"Response status code: {response.status_code}")
            
            try:
                response.raise_for_status()
            except requests.exceptions.HTTPError as e:
                print(f"Events API HTTP Error: {e}")
                print(f"Response body: {response.text[:500]}...")
                return []
            
            try:
                events = response.json()
            except json.JSONDecodeError as e:
                print(f"Events API JSON parsing error: {e}")
                print(f"Raw response content: {response.text[:500]}...")
                return []
            
            if isinstance(events, list) and len(events) > 0:
                print(f"Successfully fetched {len(events)} events")
                print("\n=== DEBUG: First event structure ===")
                first_event = events[0]
                print(f"Event keys: {list(first_event.keys())}")
                
                volume_fields = []
                for key in first_event.keys():
                    if 'volume' in key.lower():
                        volume_fields.append(f"{key}: {first_event.get(key)}")
                
                print(f"Volume-related fields: {volume_fields}")
                print(f"Title: {first_event.get('title', 'N/A')}")
                print("=====================================\n")
                
                return events
            elif isinstance(events, dict) and 'events' in events:
                events_list = events.get('events', [])
                print(f"Extracted {len(events_list)} events from response")
                return events_list
            else:
                print(f"Events API: Unexpected response format: {type(events)}")
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Network error fetching events: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error in fetch_top_events_by_volume: {type(e).__name__}: {e}")
            return []
    
    def parse_market_data(self, market: Dict, rank: int) -> Dict:
        """Parse and extract relevant market data from Gamma API response"""
        try:
            # Extract volume - try different volume fields
            volume = 0
            volume_fields_to_try = [
                'volume24hr', 'volume_24hr', 'volume_24h', 'dailyVolume', 'daily_volume',
                'volume', 'totalVolume', 'total_volume', 'volumeUSD', 'volume_usd'
            ]
            
            for field in volume_fields_to_try:
                if market.get(field) is not None:
                    try:
                        volume = float(market.get(field, 0))
                        print(f"Using volume field '{field}': {volume}")
                        break
                    except (ValueError, TypeError):
                        continue
            
            if volume == 0:
                print(f"WARNING: No valid volume found for market {rank}")
                print(f"Available fields: {list(market.keys())}")
            
            # Improved date parsing with more field options
            created_at = None
            for field in ['created_at', 'start_date', 'createdAt', 'startDate', 'created_time', 'creation_time', 'creation_date']:
                if market.get(field):
                    created_at = market.get(field)
                    break
            
            end_date = None
            for field in ['end_date', 'endDate', 'end_date_iso', 'expiry_date', 'expiryDate', 'expiration_time', 'resolution_time']:
                if market.get(field):
                    end_date = market.get(field)
                    break
            
            # Determine if market is truly active
            is_closed = market.get('closed', False)
            is_resolved = market.get('resolved', False)
            is_active = market.get('active', True)
            
            # Skip markets that are closed or resolved
            if is_closed or is_resolved or not is_active:
                print(f"Skipping market {rank}: closed={is_closed}, resolved={is_resolved}, active={is_active}")
                return None
            
            # Skip markets with very low volume (likely not main markets)
            if volume < 1000:  # Skip markets with less than $1000 volume
                print(f"Skipping low-volume market {rank}: ${volume}")
                return None
            
            # Validate end date - skip if market has already ended
            if end_date:
                try:
                    # Handle different date formats
                    if isinstance(end_date, (int, float)):
                        end_timestamp = end_date
                    else:
                        # Try parsing ISO format
                        end_dt = parse_date(end_date)
                        end_timestamp = end_dt.timestamp()
                    
                    current_timestamp = datetime.now().timestamp()
                    if end_timestamp <= current_timestamp:
                        print(f"Skipping market {rank}: end date {end_date} is in the past")
                        return None
                except Exception as e:
                    print(f"Warning: Could not parse end date {end_date} for market {rank}: {e}")
            
            # Initialize category as Uncategorized
            category = 'Uncategorized'
            
            # Get the title and description for categorization
            title = market.get('title') or market.get('question') or ''
            description = market.get('description', '')
            
            # Simple keyword to category mapping
            keyword_categories = {
                'Fed': 'Economy',
                'Federal Reserve': 'Economy',
                'FOMC': 'Economy',
                'bps': 'Economy',
                'basis points': 'Economy',
                'interest rate': 'Economy',
                'interest rates': 'Economy',
                'GDP': 'Economy',
                'economy': 'Economy',
                'inflation': 'Economy',
                'Trump': 'Politics',
                'Biden': 'Politics',
                'election': 'Politics',
                'president': 'Politics',
                'vote': 'Politics',
                'congress': 'Politics',
                'mayor': 'Politics',
                'Russia': 'World Affairs',
                'Ukraine': 'World Affairs',
                'China': 'World Affairs',
                'Israel': 'World Affairs',
                'Iran': 'World Affairs',
                'Gaza': 'World Affairs',
                'Middle East': 'World Affairs',
                'war': 'World Affairs',
                'ceasefire': 'World Affairs',
                'bitcoin': 'Crypto',
                'ethereum': 'Crypto',
                'crypto': 'Crypto',
                'NBA': 'Sports',
                'NHL': 'Sports',
                'MLB': 'Sports',
                'NFL': 'Sports',
                'UFC': 'Sports',
                'tennis': 'Sports',
                'football': 'Sports',
                'basketball': 'Sports',
                'baseball': 'Sports',
                'hockey': 'Sports',
                'championship': 'Sports',
                'finals': 'Sports',
                'tournament': 'Sports',
                'movie': 'Entertainment',
                'award': 'Entertainment',
                'Oscar': 'Entertainment',
                'Emmy': 'Entertainment',
                'Grammy': 'Entertainment',
                'AI': 'Technology',
                'OpenAI': 'Technology',
                'tech': 'Technology',
                'Elon': 'Technology',
                'tweet': 'Technology'
            }
            
            # First try to categorize based on title or description
            for keyword, cat in keyword_categories.items():
                if keyword.lower() in title.lower() or keyword.lower() in description.lower():
                    category = cat
                    break
            
            # If we still don't have a category, check if this market has event data
            if category == 'Uncategorized' and market.get('events'):
                events = market.get('events', [])
                if events and len(events) > 0:
                    event = events[0]
                    event_title = event.get('title', '')
                    
                    # Try to categorize based on event title
                    for keyword, cat in keyword_categories.items():
                        if event_title and keyword.lower() in event_title.lower():
                            category = cat
                            break
                    
                    # Check for series information
                    if category == 'Uncategorized' and event.get('series'):
                        series = event.get('series')
                        if isinstance(series, list) and len(series) > 0:
                            series_title = series[0].get('title', '')
                            # Try to categorize based on series title
                            for keyword, cat in keyword_categories.items():
                                if series_title and keyword.lower() in series_title.lower():
                                    category = cat
                                    break
            
            # Extract other metadata
            parsed_data = {
                'rank': rank,
                'title': market.get('title') or market.get('question') or market.get('name') or 'Unknown',
                'market_slug': market.get('slug', ''),
                'market_id': market.get('id', ''),
                'condition_id': market.get('condition_id', ''),
                'volume_usd': volume,
                'category': category,
                'created_at': created_at,
                'end_date': end_date,
                'is_resolved': is_resolved,
                'active': is_active,
                'closed': is_closed,
                'description': market.get('description', '') or market.get('market_description', ''),
                'outcomes': market.get('outcomes') or market.get('outcome_options') or [],
                'liquidity': float(market.get('liquidity_num', 0) or market.get('liquidity', 0) or 0),
                'url': f"https://polymarket.com/event/{market.get('slug', '')}" if market.get('slug') else ''
            }
            
            # Log missing critical fields
            missing_fields = []
            if not parsed_data['title'] or parsed_data['title'] == 'Unknown':
                missing_fields.append('title')
            if not parsed_data['market_id']:
                missing_fields.append('market_id')
            if not parsed_data['created_at']:
                missing_fields.append('created_at')
            if not parsed_data['end_date']:
                missing_fields.append('end_date')
            if missing_fields:
                print(f"WARNING: Market {rank} missing fields: {', '.join(missing_fields)}")
            
            return parsed_data
            
        except Exception as e:
            print(f"Error parsing market data for market {rank}: {e}")
            try:
                print(f"Problematic market data: {json.dumps({k: v for k, v in market.items() if k in ['id', 'title', 'slug', 'closed', 'active', 'volume']})}")
            except:
                print("Could not dump market data for debugging")
            return None
    
    def format_market_info(self, market: Dict) -> str:
        """Format market information for display"""
        volume_formatted = f"${market['volume_usd']:,.2f}"
        created_date = market['created_at'][:10] if market['created_at'] else 'Unknown'
        
        if market['closed']:
            status = "✓ Closed"
        elif not market['active']:
            status = "⏸ Inactive"
        else:
            status = "● Active"
        
        info = f"""
#{market['rank']}: {market['title']}
Volume: {volume_formatted}
Status: {status}
Category: {market['category']}
Created: {created_date}
URL: {market['url']}
"""
        
        return info
    
    def save_to_json(self, markets: List[Dict], filename: str = "polymarket_top50.json"):
        """Save market data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(markets, f, indent=2, ensure_ascii=False)
        print(f"\nData saved to {filename}")
    
    def save_to_csv(self, markets: List[Dict], filename: str = "polymarket_top50.csv"):
        """Save market data to CSV file"""
        import csv
        
        if not markets:
            return
        
        # Define CSV headers
        headers = [
            'rank', 'title', 'volume_usd', 'status', 'category', 
            'created_at', 'end_date', 'url', 'liquidity', 'market_id'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            
            for market in markets:
                row = {
                    'rank': market['rank'],
                    'title': market['title'],
                    'volume_usd': market['volume_usd'],
                    'status': 'Closed' if market['closed'] else ('Inactive' if not market['active'] else 'Active'),
                    'category': market['category'],
                    'created_at': market['created_at'],
                    'end_date': market['end_date'],
                    'url': market['url'],
                    'liquidity': market['liquidity'],
                    'market_id': market['market_id']
                }
                writer.writerow(row)
        
        print(f"Data saved to {filename}")

def main():
    """Main function to fetch and display top 50 Polymarket markets"""
    print("Starting main function...")
    fetcher = PolymarketFetcher()
    
    print("Trying to fetch top events (grouped markets) by volume first...")
    
    # Try Events API first for grouped markets
    print("About to try Events API...")
    raw_events = fetcher.fetch_top_events_by_volume(50)
    
    if raw_events and len(raw_events) > 0:
        print(f"Events API successful! Got {len(raw_events)} events")
        print("Using Events API data (grouped markets)...")
        raw_markets = raw_events
        api_type = "Events"
    else:
        print("Events API failed or returned no data. Falling back to individual Markets API...")
        # Fall back to individual markets
        raw_markets = fetcher.fetch_top_markets_by_volume(100)
        api_type = "Markets"
    
    print(f"Returned {len(raw_markets) if raw_markets else 0} raw {api_type.lower()}")
    
    if not raw_markets:
        print(f"Failed to fetch {api_type.lower()} data")
        return
    
    # Parse and filter the markets/events
    parsed_markets = []
    parsing_errors = 0
    skipped_markets = 0
    
    print(f"Parsing and filtering {api_type.lower()} data...")
    for i, market in enumerate(raw_markets, 1):
        try:
            parsed = fetcher.parse_market_data(market, i)
            if parsed:
                parsed_markets.append(parsed)
            else:
                skipped_markets += 1
        except Exception as e:
            parsing_errors += 1
            print(f"Unexpected error parsing {api_type.lower()} at index {i}: {type(e).__name__}: {e}")
    
    print(f"Successfully parsed {len(parsed_markets)} active {api_type.lower()}")
    print(f"Skipped {skipped_markets} closed/inactive {api_type.lower()}")
    
    if parsing_errors > 0:
        print(f"WARNING: {parsing_errors} {api_type.lower()} failed to parse properly")
        
    if len(parsed_markets) == 0:
        print(f"ERROR: No valid active {api_type.lower()} data after filtering")
        return
    
    # Take only top 50 and re-rank them
    top_markets = parsed_markets[:50]
    for i, market in enumerate(top_markets, 1):
        market['rank'] = i
    
    # Display summary statistics
    total_volume = sum(m['volume_usd'] for m in top_markets)
    markets_with_dates = sum(1 for m in top_markets if m['created_at'] and m['end_date'])
    
    print(f"\n{'='*60}")
    print(f"TOP 50 ACTIVE POLYMARKET {api_type.upper()} BY VOLUME")
    print(f"(Only {api_type.lower()} ending in the future)")
    print(f"{'='*60}")
    print(f"Total Volume (Top 50): ${total_volume:,.2f}")
    print(f"Active {api_type}: {len(top_markets)}")
    print(f"{api_type} with complete dates: {markets_with_dates}")
    print(f"{'='*60}\n")
    
    # Display top 10 markets
    print(f"TOP 10 ACTIVE {api_type.upper()}:")
    for market in top_markets[:10]:
        print(fetcher.format_market_info(market))
        print("-" * 40)
    
    # Save data
    save_option = input("\nSave full data? (j)son, (c)sv, (b)oth, (n)one: ").lower()
    
    if save_option in ['j', 'b']:
        filename = f"polymarket_top50_{api_type.lower()}.json"
        fetcher.save_to_json(top_markets, filename)
    if save_option in ['c', 'b']:
        filename = f"polymarket_top50_{api_type.lower()}.csv"
        fetcher.save_to_csv(top_markets, filename)
    
    print("\nDone!")

if __name__ == "__main__":
    main()