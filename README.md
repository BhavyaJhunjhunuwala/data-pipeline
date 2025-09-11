## API Aggregator

A Node.js Express server that fetches and aggregates data from GitHub, NewsAPI, and OpenWeather APIs for a given query.

Features

- Fetch the top GitHub repository for a query.
- Fetch the top 3 news articles related to the query.
- Fetch weather for the repository owner’s location (default: London).
- Uses Axios, Promises, async/await, and exponential backoff for retries.
- Handles request timeouts.

Endpoints

1. Root
```
GET /
```
2. Promise-based endpoint
```
GET /aggregate-promise/:query
```

3. Async/await-based endpoint
```
GET /aggregate-async/:query
```

4. Example:
```
/aggregate-promise/javascript
/aggregate-async/python
```

Setup

1. Clone the repository.

2. Install dependencies:
```
npm install
```

3. Create a .env file with your API keys:

```
PORT=3000

GITHUB_API_KEY=your_github_api_key

NEWS_API_KEY=your_newsapi_api_key

OPENWEATHER_API_KEY=your_openweather_api_key
```

4. Run the server:
```
node app.js
```
