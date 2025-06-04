# Best Practices for Retrieving Polymarket Volume Data

## Recommended Approach: Gamma Markets API

After evaluating all available options, the Polymarket Gamma Markets API is the most reliable and straightforward method for retrieving volume data for the top 50 markets. Here's a detailed guide on best practices:

### 1. API Endpoint and Basic Usage

```
GET https://gamma-api.polymarket.com/markets
```

### 2. Retrieving Top 50 Markets by Volume

To get the top 50 markets sorted by volume:

```
GET https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50
```

Parameters explained:
- `order=volume`: Sort by trading volume
- `ascending=false`: Sort in descending order (highest volume first)
- `limit=50`: Return only the top 50 results

### 3. Filtering Active Markets Only

To exclude archived or inactive markets:

```
GET https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50&active=true
```

### 4. Additional Filtering Options

For more specific queries:

- **Time-based filtering**:
  ```
  &start_date_min=2025-01-01T00:00:00Z
  &end_date_max=2025-12-31T23:59:59Z
  ```

- **Liquidity thresholds**:
  ```
  &liquidity_num_min=10000
  ```

### 5. Pagination for Large Datasets

If you need to retrieve more than the API's maximum limit per request:

```
# First page
GET https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50&offset=0

# Second page
GET https://gamma-api.polymarket.com/markets?order=volume&ascending=false&limit=50&offset=50
```

### 6. Error Handling Best Practices

- Implement exponential backoff for rate limiting (HTTP 429 responses)
- Add timeout handling (recommended: 30 seconds)
- Validate response data before processing

### 7. Data Processing Recommendations

- Parse the JSON response and extract relevant fields
- Verify volume data is present and properly formatted
- Consider caching results if making frequent requests

### 8. API Limitations

- No authentication required for read-only operations, but be mindful of rate limits
- Some market details may require additional API calls
- Historical volume data may require different endpoints or approaches

### 9. Alternative Approaches

If the Gamma Markets API is unavailable:

1. **MCP Server**: Set up the Model Context Protocol server for standardized access
2. **Direct Web Access**: Visit polymarket.com and manually sort by volume (less efficient)
3. **Apify Scraper**: Use the Polymarket scraper for web-based extraction (requires Apify account)
