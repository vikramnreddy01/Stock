const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 5001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/StockDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: String,
  date: String,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
});

const Stock = mongoose.model('Stock', stockSchema);

// Array of top 25 stock symbols
const topStocks = [
  'GOOGL', 'AMZN', 'FB', 
  'TSLA', 'NVDA', 'BRK.B', 'JPM', 'JNJ',
  'V', 'PG', 'UNH', 'HD', 'MA',
  'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX',
  'KO', 'VZ', 'PFE', 'MRK', 'ABT'
];

// Function to fetch and store historical data for a specific stock
const fetchAndStoreHistoricData = async (symbol) => {
  const options = {
    method: 'GET',
    url: 'https://alpha-vantage.p.rapidapi.com/query',
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      outputsize: 'full',
      datatype: 'json',
    },
    headers: {
      'x-rapidapi-key': '49be92de5cmshd0510fef9d5aaf5p1a61e4jsnb38322988390',
      'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    console.log(`Received data for ${symbol}:`, response.data);

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      console.log(`No data found for ${symbol}`);
      return;
    }

    // Store each day’s data in the database
    for (const date in timeSeries) {
      const dailyData = timeSeries[date];
      const existingData = await Stock.findOne({ symbol, date });
      if (!existingData) {
        const stockEntry = new Stock({
          symbol,
          date,
          open: parseFloat(dailyData['1. open']),
          high: parseFloat(dailyData['2. high']),
          low: parseFloat(dailyData['3. low']),
          close: parseFloat(dailyData['4. close']),
          volume: parseInt(dailyData['5. volume']),
        });
        await stockEntry.save();
        console.log(`Stored data for ${symbol} on ${date}`);
      } else {
        console.log(`Data for ${symbol} on ${date} already exists.`);
      }
    }

    console.log(`Historic data for ${symbol} has been stored successfully.`);
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.response ? error.response.data : error.message);
  }
};

// Route to load data for the top 25 stocks
app.get('/api/load-top-stocks', async (req, res) => {
  console.log('Fetching stock data for top 25 stocks...');
  for (const symbol of topStocks) {
    await fetchAndStoreHistoricData(symbol);
  }
  res.send({ message: 'Stock data for top 25 stocks has been loaded into the database.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});