from polymarket import PolymarketFetcher

# Create a new PolymarketFetcher instance
fetcher = PolymarketFetcher()

# Fetch the top 10 markets
print("Fetching top markets...")
markets = fetcher.fetch_top_markets_by_volume(10)

# Parse and display the categories
print("\nParsed Market Categories:")
print("-" * 80)
print(f"{'Rank':<5} {'Category':<15} {'Title':<60}")
print("-" * 80)

for i, market in enumerate(markets[:10], 1):
    parsed = fetcher.parse_market_data(market, i)
    if parsed:
        print(f"{parsed['rank']:<5} {parsed['category']:<15} {parsed['title'][:60]}")

print("\nDone!")