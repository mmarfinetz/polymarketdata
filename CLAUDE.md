# CLAUDE.md - Polymarket Data Fetcher Guidelines

## Commands
- Run script: `python polymarket.py`
- Run tests: No tests currently defined in the repository
- Linting: No linting tools currently defined in the repository

## Code Style Guidelines

### Imports
- Standard library imports first
- Third-party imports second
- Local/module imports last
- Sort alphabetically within each group
- Use explicit imports (avoid `from x import *`)

### Formatting
- Follow PEP 8 standards
- Use 4 spaces for indentation
- Maximum line length of 100 characters
- Use docstrings for classes and functions

### Types
- Use type hints from the `typing` module
- Include return type annotations
- Document parameter types in docstrings

### Naming Conventions
- Classes: PascalCase (e.g., `PolymarketFetcher`)
- Functions/methods: snake_case (e.g., `fetch_top_markets_by_volume`)
- Variables: snake_case (e.g., `parsed_markets`)
- Constants: UPPER_CASE

### Error Handling
- Use try/except blocks for API requests and data parsing
- Handle specific exceptions when possible
- Provide informative error messages
- Graceful degradation (return empty list rather than crashing)

### Documentation
- Include docstrings for all functions and classes
- Document parameters, return values, and exceptions
- Use markdown in documentation files