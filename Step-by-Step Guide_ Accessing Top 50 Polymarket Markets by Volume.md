# Step-by-Step Guide: Accessing Top 50 Polymarket Markets by Volume

This guide provides detailed instructions for retrieving and ranking the top 50 Polymarket markets by trading volume using various methods.

## Method 1: Using the Official Gamma Markets API (Recommended)

The Gamma Markets API is the most direct and reliable method for accessing volume data for Polymarket markets.

### Prerequisites
- Basic understanding of API requests
- Tool for making HTTP requests (curl, Postman, Python with requests library, etc.)

### Steps

1. **Make a GET request to the markets endpoint**

   ```
   GET https://gamma-api.polymarket.com/markets
   ```

2. **Add query parameters to sort by volume in descending order**

   ```
   GET https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50
   ```

   Parameters explained:
   - `order=volume`: Sort by the volume field
   - `ascending=false`: Sort in descending order (highest volume first)
   - `limit=50`: Return only the top 50 results

3. **Parse the JSON response**

   The response will contain an array of market objects, each with a `volume` field indicating the trading volume.

4. **Optional: Apply additional filters**

   You can add more query parameters to refine results:
   - `active=true`: Only show active markets
   - `closed=false`: Exclude closed markets
   - `volume_num_min=X`: Only show markets with minimum volume X

### Example Python Implementation

```python
import requests
import json

# Request the top 50 markets by volume
url = "https://gamma-api.polymarket.com/markets"
params = {
    "order": "volume",
    "ascending": "false",
    "limit": 50,
    "active": "true"  # Optional: only active markets
}

response = requests.get(url, params=params)
markets = response.json()

# Print the results
print(f"Top {len(markets)} Polymarket Markets by Volume:")
for i, market in enumerate(markets, 1):
    print(f"{i}. {market.get('title', 'Unnamed Market')}")
    print(f"   Volume: ${market.get('volume', 0):,.2f}")
    print(f"   Market ID: {market.get('id')}")
    print(f"   Status: {'Active' if market.get('active') else 'Inactive'}")
    print()
```

## Method 2: Using the MCP Server

The Model Context Protocol (MCP) server provides a standardized interface for accessing Polymarket data.

### Prerequisites
- Python 3.9 or higher
- Git

### Steps

1. **Clone the MCP repository**

   ```bash
   git clone https://github.com/berlinbra/polymarket-mcp.git
   cd polymarket-mcp
   ```

2. **Install dependencies**

   ```bash
   pip install -e .
   ```

3. **Create a .env file with your API key (if needed)**

   ```
   KEY=your_api_key_here
   FUNDER=your_polymarket_wallet_address
   ```

4. **Run the server**

   ```bash
   python src/polymarket_mcp/server.py
   ```

5. **Use the list-markets tool with volume sorting**

   The MCP server provides a `list-markets` tool that can be used to retrieve markets sorted by volume.

   Example request:
   ```json
   {
     "status": "open",
     "limit": 50,
     "sort_by": "volume",
     "sort_direction": "desc"
   }
   ```

## Method 3: Using Dune Analytics

Dune Analytics provides access to onchain Polymarket data, which can be used to analyze market volumes.

### Prerequisites
- Dune Analytics account

### Steps

1. **Visit the Polymarket dashboard on Dune**

   Navigate to: https://dune.com/fergmolina/polymarket

2. **Examine the queries for volume data**

   The dashboard contains queries that extract and analyze volume data from Polymarket's onchain transactions.

3. **Fork and modify the queries to focus on top markets by volume**

   You can modify the existing queries to sort markets by volume and limit to the top 50.

4. **Use LiveFetch to combine with Gamma API data**

   Dune's LiveFetch functionality can be used to pull in additional market metadata from the Gamma API.

   Example SQL with LiveFetch:
   ```sql
   WITH market_data AS (
     SELECT 
       json_extract_scalar(market_data, '$.id') as market_id,
       json_extract_scalar(market_data, '$.title') as title,
       CAST(json_extract_scalar(market_data, '$.volume') AS double) as volume
     FROM 
       UNNEST(
         CAST(json_parse(
           http_get('https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50')
         ) AS array(json))
       ) t(market_data)
   )
   
   SELECT 
     market_id,
     title,
     volume
   FROM 
     market_data
   ORDER BY 
     volume DESC
   LIMIT 50
   ```

## Best Practices

1. **Use the official Gamma API for most current data**
   - The Gamma API provides the most up-to-date and comprehensive market data
   - It includes volume data that is indexed from both onchain and offchain sources

2. **Combine with onchain data for deeper analysis**
   - Dune Analytics provides access to raw transaction data
   - This can be useful for verifying volumes or conducting more detailed analysis

3. **Consider caching for frequent queries**
   - If you need to query the data frequently, implement caching to avoid rate limits
   - The MCP server includes built-in error handling for rate limiting

4. **Verify data consistency across sources**
   - Cross-check volume data between the Gamma API and onchain sources
   - This ensures accuracy, especially for high-volume markets

5. **Monitor API changes**
   - The Polymarket API may change over time
   - Check the documentation regularly for updates

## Troubleshooting

- **Rate limiting**: If you encounter 429 errors, implement exponential backoff in your requests
- **Missing data**: Some markets may not have volume data if they are new or have low liquidity
- **API changes**: If the endpoints or parameters change, check the official documentation

## Conclusion

The most reliable and straightforward method for accessing the top 50 Polymarket markets by volume is using the official Gamma Markets API with appropriate sorting parameters. For more advanced analysis or integration needs, consider using Dune Analytics or the MCP server as complementary approaches.
