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
    
    def fetch_top_events_by_volume(self, n: int = 50) -> List[Dict]:
        """Fetch top N events by 24h volume from Polymarket Gamma Events API"""
        print(f"Fetching top {n} events by 24h volume from Polymarket Gamma Events API...")
        
        try:
            url = f"{self.base_url}{self.events_endpoint}"
            params = {
                'order': 'volume24hr',
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
                print(f"First event title: {events[0].get('title', 'N/A')}")
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
            # Extract 24h volume
            volume = 0
            volume_fields_to_try = [
                'volume24hr', 'volume_24hr', 'volume_24h', 'dailyVolume', 'daily_volume',
                'volume', 'totalVolume', 'total_volume', 'volumeUSD', 'volume_usd'
            ]
            
            for field in volume_fields_to_try:
                if event.get(field) is not None:
                    try:
                        volume = float(event.get(field, 0))
                        break
                    except (ValueError, TypeError):
                        continue
            
            if volume == 0:
                print(f"WARNING: No valid volume found for event {rank}")
            
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
            
            # Skip low volume events
            if volume < 1000:
                print(f"Skipping low-volume event {rank}: ${volume}")
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
                'volume_usd': volume,
                'volume_24h': volume,  # Same as volume_usd for events
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
        volume_formatted = f"${event['volume_usd']:,.2f}"
        created_date = event['created_at'][:10] if event['created_at'] else 'Unknown'
        
        status = "● Active" if event['is_active'] and not event['is_closed'] else "⏸ Inactive"
        
        info = f"""
#{event['rank']}: {event['title']}
24h Volume: {volume_formatted}
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
        
        # Define CSV headers
        headers = [
            'rank', 'title', 'volume_24h', 'status', 'category', 
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
                    'volume_24h': event['volume_24h'],
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
    print("Fetching top events by 24h volume...")
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
    categories = {}
    for event in top_events:
        cat = event['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n{'='*60}")
    print(f"TOP 50 POLYMARKET EVENTS BY 24H VOLUME")
    print(f"{'='*60}")
    print(f"Total 24h Volume: ${total_volume:,.2f}")
    print(f"Active Events: {len(top_events)}")
    print(f"Categories: {dict(sorted(categories.items(), key=lambda x: x[1], reverse=True))}")
    print(f"{'='*60}\n")
    
    # Display top 10 events
    print("TOP 10 EVENTS BY 24H VOLUME:")
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