from polymarketevents import PolymarketEventsFetcher
import json

def main():
    fetcher = PolymarketEventsFetcher()
    events = fetcher.fetch_top_events_by_volume(1)
    
    if events and len(events) > 0:
        event = events[0]
        print("\nSample event keys:", list(event.keys()))
        
        volume_fields = []
        for key in event.keys():
            if 'volume' in key.lower():
                volume_fields.append(key)
                print(f"{key}: {event.get(key)}")
        
        print("\nAll volume fields:", volume_fields)
    else:
        print("No events found")

if __name__ == "__main__":
    main()