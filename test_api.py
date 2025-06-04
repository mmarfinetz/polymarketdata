from polymarket import PolymarketFetcher
import json

def main():
    fetcher = PolymarketFetcher()
    markets = fetcher.fetch_top_markets_by_volume(1)
    
    if markets and len(markets) > 0:
        market = markets[0]
        print("\nSample market keys:", list(market.keys()))
        
        volume_fields = []
        for key in market.keys():
            if 'volume' in key.lower():
                volume_fields.append(key)
                print(f"{key}: {market.get(key)}")
        
        print("\nAll volume fields:", volume_fields)
    else:
        print("No markets found")

if __name__ == "__main__":
    main()