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

class PolymarketEventsFetcher:
    def __init__(self):
        self.base_url = "https://gamma-api.polymarket.com"
        self.events_endpoint = "/events"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def fetch_top_events_by_volume(self, n: int = 50, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
        """Fetch top N events by total volume from Polymarket Gamma Events API
        
        Args:
            n: Number of events to fetch
            start_date: Start date in ISO format (YYYY-MM-DD) for filtering events
            end_date: End date in ISO format (YYYY-MM-DD) for filtering events
        """
        print(f"Fetching top {n} events by total volume from Polymarket Gamma Events API...")
        if start_date:
            print(f"Filtering events from {start_date} to {end_date or 'now'}")
        
        try:
            url = f"{self.base_url}{self.events_endpoint}"
            params = {
                'order': 'volume',  # Changed from 'volume24hr' to 'volume' for total volume
                'ascending': 'false',
                'limit': n * 2,  # Fetch more to account for filtering
                'closed': 'false',
                'active': 'true',
                'include_trading_stats': 'true',
                'include_market_liquidity': 'true',
                'include_categories': 'true',
                'include_timestamps': 'true',
                'end_date_min': int(datetime.now().timestamp())
            }
            
            # Add date filtering parameters if provided
            if start_date:
                try:
                    start_dt = datetime.fromisoformat(start_date)
                    params['created_at_min'] = int(start_dt.timestamp())
                except ValueError:
                    print(f"Warning: Invalid start_date format: {start_date}")
            
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date)
                    params['created_at_max'] = int(end_dt.timestamp())
                    # Also update end_date_min to show events that were active during this period
                    params['end_date_min'] = int(end_dt.timestamp())
                except ValueError:
                    print(f"Warning: Invalid end_date format: {end_date}")
            
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
                
                # If total volume doesn't work, try 24hr volume as fallback
                print("Trying with 'volume24hr' parameter as fallback...")
                params['order'] = 'volume24hr'
                response = requests.get(url, headers=self.headers, params=params, timeout=30)
                response.raise_for_status()
            
            try:
                events = response.json()
            except json.JSONDecodeError as e:
                print(f"Events API JSON parsing error: {e}")
                print(f"Raw response content: {response.text[:500]}...")
                return []
            
            if isinstance(events, list) and len(events) > 0:
                print(f"Successfully fetched {len(events)} events")
                print(f"First event title: {events[0].get('title', 'N/A')}")
                
                # Debug: Print volume fields for first event
                first_event = events[0]
                print("\n=== DEBUG: First event volume fields ===")
                for key in first_event.keys():
                    if 'volume' in key.lower():
                        print(f"{key}: {first_event.get(key)}")
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
    
    def parse_event_data(self, event: Dict, rank: int) -> Dict:
        """Parse and extract relevant event data from Gamma Events API response"""
        try:
            # Extract total volume (prioritize this for main display)
            total_volume = 0
            total_volume_fields = [
                'volume', 'totalVolume', 'total_volume', 'volumeNum', 'volume_num',
                'cumulativeVolume', 'cumulative_volume', 'allTimeVolume', 'all_time_volume'
            ]
            
            for field in total_volume_fields:
                if event.get(field) is not None:
                    try:
                        total_volume = float(event.get(field, 0))
                        if total_volume > 0:
                            print(f"Using total volume field '{field}': ${total_volume:,.2f}")
                            break
                    except (ValueError, TypeError):
                        continue
            
            # Extract 24h volume separately
            volume_24h = 0
            volume_24h_fields = [
                'volume24hr', 'volume_24hr', 'volume_24h', 'dailyVolume', 'daily_volume',
                'volume24Hour', 'volume_24_hour'
            ]
            
            for field in volume_24h_fields:
                if event.get(field) is not None:
                    try:
                        volume_24h = float(event.get(field, 0))
                        if volume_24h > 0:
                            print(f"Found 24h volume field '{field}': ${volume_24h:,.2f}")
                            break
                    except (ValueError, TypeError):
                        continue
            
            # Use total volume as primary, fall back to 24h if no total volume found
            volume = total_volume if total_volume > 0 else volume_24h
            
            if volume == 0:
                print(f"WARNING: No valid volume found for event {rank}")
                # Print all available fields for debugging
                print(f"Available fields: {list(event.keys())}")
            
            # Extract dates
            created_at = None
            for field in ['createdAt', 'created_at', 'creationDate', 'startDate']:
                if event.get(field):
                    created_at = event.get(field)
                    break
            
            end_date = None
            for field in ['endDate', 'end_date', 'end_date_iso']:
                if event.get(field):
                    end_date = event.get(field)
                    break
            
            # Check if event is active
            is_closed = event.get('closed', False)
            is_active = event.get('active', True)
            
            if is_closed or not is_active:
                print(f"Skipping event {rank}: closed={is_closed}, active={is_active}")
                return None
            
            # Skip low volume events (adjust threshold for total volume)
            min_volume = 10000 if total_volume > 0 else 1000  # Higher threshold for total volume
            if volume < min_volume:
                print(f"Skipping low-volume event {rank}: ${volume:,.2f}")
                return None
            
            # Validate end date
            if end_date:
                try:
                    if isinstance(end_date, (int, float)):
                        end_timestamp = end_date
                    else:
                        end_dt = parse_date(end_date)
                        end_timestamp = end_dt.timestamp()
                    
                    current_timestamp = datetime.now().timestamp()
                    if end_timestamp <= current_timestamp:
                        print(f"Skipping event {rank}: end date {end_date} is in the past")
                        return None
                except Exception as e:
                    print(f"Warning: Could not parse end date {end_date} for event {rank}: {e}")
            
            # Parse category from tags
            tags = event.get('tags', [])
            category = self.parse_category_from_tags(tags)
            
            # Build event data
            parsed_data = {
                'rank': rank,
                'title': event.get('title') or event.get('question') or 'Unknown',
                'event_slug': event.get('slug', ''),
                'event_id': event.get('id', ''),
                'volume_usd': volume,  # This will be total volume if available, otherwise 24h
                'volume_total': total_volume,  # Explicitly store total volume
                'volume_24h': volume_24h,  # Explicitly store 24h volume
                'category': category,
                'tags': tags,
                'created_at': created_at,
                'end_date': end_date,
                'is_active': is_active,
                'is_closed': is_closed,
                'description': event.get('description', ''),
                'liquidity': float(event.get('liquidity', 0) or event.get('liquidityClob', 0) or 0),
                'url': f"https://polymarket.com/event/{event.get('slug', '')}" if event.get('slug') else '',
                'market_count': len(event.get('markets', [])),
                'featured': event.get('featured', False),
                'competitive': event.get('competitive', False)
            }
            
            return parsed_data
            
        except Exception as e:
            print(f"Error parsing event data for event {rank}: {e}")
            return None
    
    def format_event_info(self, event: Dict) -> str:
        """Format event information for display"""
        # Format volumes
        total_volume = event.get('volume_total', 0)
        volume_24h = event.get('volume_24h', 0)
        
        if total_volume > 0:
            volume_display = f"Total Volume: ${total_volume:,.2f}"
            if volume_24h > 0:
                volume_display += f"\n24h Volume: ${volume_24h:,.2f}"
        else:
            volume_display = f"24h Volume: ${volume_24h:,.2f}"
        
        created_date = event['created_at'][:10] if event['created_at'] else 'Unknown'
        
        status = "● Active" if event['is_active'] and not event['is_closed'] else "⏸ Inactive"
        
        info = f"""
#{event['rank']}: {event['title']}
{volume_display}
Status: {status}
Category: {event['category']}
Markets: {event['market_count']}
Created: {created_date}
URL: {event['url']}
"""
        
        return info
    
    def save_to_json(self, events: List[Dict], filename: str = "polymarket_top50_events.json"):
        """Save event data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        print(f"\nData saved to {filename}")
    
    def save_to_csv(self, events: List[Dict], filename: str = "polymarket_top50_events.csv"):
        """Save event data to CSV file"""
        import csv
        
        if not events:
            return
        
        # Define CSV headers - updated to include both volume fields
        headers = [
            'rank', 'title', 'volume_total', 'volume_24h', 'status', 'category', 
            'created_at', 'end_date', 'url', 'liquidity', 'market_count', 
            'featured', 'event_id'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            
            for event in events:
                row = {
                    'rank': event['rank'],
                    'title': event['title'],
                    'volume_total': event.get('volume_total', event.get('volume_usd', 0)),
                    'volume_24h': event.get('volume_24h', 0),
                    'status': 'Closed' if event['is_closed'] else ('Inactive' if not event['is_active'] else 'Active'),
                    'category': event['category'],
                    'created_at': event['created_at'],
                    'end_date': event['end_date'],
                    'url': event['url'],
                    'liquidity': event['liquidity'],
                    'market_count': event['market_count'],
                    'featured': event['featured'],
                    'event_id': event['event_id']
                }
                writer.writerow(row)
        
        print(f"Data saved to {filename}")

def main():
    """Main function to fetch and display top 50 Polymarket events"""
    print("Starting Polymarket Events Tracker...")
    fetcher = PolymarketEventsFetcher()
    
    # Fetch events
    print("Fetching top events by total volume...")
    raw_events = fetcher.fetch_top_events_by_volume(50)
    
    if not raw_events:
        print("Failed to fetch events data")
        return
    
    # Parse and filter events
    parsed_events = []
    parsing_errors = 0
    skipped_events = 0
    
    print("Parsing and filtering events data...")
    for i, event in enumerate(raw_events, 1):
        try:
            parsed = fetcher.parse_event_data(event, i)
            if parsed:
                parsed_events.append(parsed)
            else:
                skipped_events += 1
        except Exception as e:
            parsing_errors += 1
            print(f"Unexpected error parsing event at index {i}: {type(e).__name__}: {e}")
    
    print(f"Successfully parsed {len(parsed_events)} active events")
    print(f"Skipped {skipped_events} closed/inactive events")
    
    if parsing_errors > 0:
        print(f"WARNING: {parsing_errors} events failed to parse properly")
        
    if len(parsed_events) == 0:
        print("ERROR: No valid active events data after filtering")
        return
    
    # Take only top 50 and re-rank them
    top_events = parsed_events[:50]
    for i, event in enumerate(top_events, 1):
        event['rank'] = i
    
    # Display summary statistics
    total_volume = sum(e['volume_usd'] for e in top_events)
    total_24h_volume = sum(e.get('volume_24h', 0) for e in top_events)
    categories = {}
    for event in top_events:
        cat = event['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n{'='*60}")
    print(f"TOP 50 POLYMARKET EVENTS BY TOTAL VOLUME")
    print(f"{'='*60}")
    print(f"Total Volume (All Time): ${total_volume:,.2f}")
    if total_24h_volume > 0:
        print(f"Total 24h Volume: ${total_24h_volume:,.2f}")
    print(f"Active Events: {len(top_events)}")
    print(f"Categories: {dict(sorted(categories.items(), key=lambda x: x[1], reverse=True))}")
    print(f"{'='*60}\n")
    
    # Display top 10 events
    print("TOP 10 EVENTS BY TOTAL VOLUME:")
    for event in top_events[:10]:
        print(fetcher.format_event_info(event))
        print("-" * 40)
    
    # Save data
    save_option = input("\nSave data? (j)son, (c)sv, (b)oth, (n)one: ").lower()
    
    if save_option in ['j', 'b']:
        fetcher.save_to_json(top_events)
    if save_option in ['c', 'b']:
        fetcher.save_to_csv(top_events)
    
    print("\nDone!")

if __name__ == "__main__":
    main() 