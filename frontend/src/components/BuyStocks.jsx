import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Import AuthContext to access userEmail

const BuyStocks = () => {
  const [symbol, setSymbol] = useState('AAPL'); // Default to first stock
  const [stockData, setStockData] = useState(null);
  const [quantity, setQuantity] = useState(1); // State to hold the quantity
  const [message, setMessage] = useState('');
  const { userEmail } = useContext(AuthContext); // Get userEmail from context

  const stockOptions = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN','TSLA', 'NVDA', 'BRK.B', 'JPM', 'JNJ', 'V', 'PG',
    'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX', 'KO', 'VZ',
    'PFE', 'MRK', 'ABT'
  ];

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/stock/${symbol}`);
      setStockData(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching stock data. Please try again.');
    }
  };

  const handleBuyStock = async () => {
    if (!stockData) {
      setMessage('No stock data available.');
      return;
    }

    const transaction = {
      userEmail: userEmail,
      symbol: stockData.symbol,
      price: stockData.close,
      quantity: quantity,
      date: new Date().toISOString(),
      type: 'BUY',
    };

    try {
      await axios.post('http://localhost:5000/api/transactions/buy', transaction);
      setMessage(`You have successfully purchased ${quantity} share(s) of ${stockData.symbol} at $${stockData.close}.`);
      
      // Reset stock data after successful purchase
      setStockData(null);
    } catch (error) {
      setMessage('Please Check Balance');
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto p-8">
      <h1 className="text-4xl font-bold text-[#00df9a] mb-6 text-center">Equity</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full p-3 text-gray-900 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#00df9a] mb-4"
        >
          {stockOptions.map((stock) => (
            <option key={stock} value={stock}>
              {stock}
            </option>
          ))}
        </select>
        <button
          onClick={fetchStockData}
          className="w-full bg-[#00df9a] text-gray-900 font-bold py-2 rounded hover:bg-[#00df9a]/80 transition duration-300 mb-4"
        >
          Fetch Stock Data
        </button>

        {stockData && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-[#00df9a] text-center">{stockData.symbol}</h2>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-300">Open: ${stockData.open}</p>
              <p className="text-gray-300">High: ${stockData.high}</p>
              <p className="text-gray-300">Low: ${stockData.low}</p>
              <p className="text-gray-300">Close: ${stockData.close}</p>
              <p className="text-gray-300">Volume: {stockData.volume}</p>
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-3 text-gray-900 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#00df9a] mb-4"
              min="1"
              placeholder="Enter Quantity"
            />
            <button
              onClick={handleBuyStock}
              className="w-full bg-[#00df9a] text-gray-900 font-bold py-2 rounded hover:bg-[#00df9a]/80 transition duration-300 mb-4"
            >
              Buy Stock
            </button>
          </div>
        )}

        {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default BuyStocks;
