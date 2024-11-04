import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const LandingPage = () => {
  const [stockData, setStockData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('AAPL'); // Default stock
  const [stocksList, setStocksList] = useState([]); // List of stocks
  const [dateRange, setDateRange] = useState('1m'); // Default date range

  // Define the top 25 stocks
  const topStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB',
    'TSLA', 'NVDA', 'BRK.B', 'JPM', 'JNJ',
    'V', 'PG', 'UNH', 'HD', 'MA',
    'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX',
    'KO', 'VZ', 'PFE', 'MRK', 'ABT'
  ];

  // Set the stocks list on component mount
  useEffect(() => {
    setStocksList(topStocks);
  }, []);

  // Fetch stock data based on selected stock and date range
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stocks?symbol=${selectedStock}&range=${dateRange}`);
        
        if (response.data.length === 0) {
          console.error('No data returned for the selected stock and date range.');
          return;
        }
    
        const formattedData = response.data.map(stock => ({
          date: stock.date, // Ensure this is a proper date string
          close: stock.close,
        }));
    
        console.log('Formatted Data:', formattedData); // Log the formatted data
        setStockData(formattedData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };
    

    fetchStockData();
  }, [selectedStock, dateRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded">
          <p className="text-[#00df9a]">{`Date: ${payload[0].payload.date}`}</p>
          <p className="text-white">{`Close: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1240px] mx-auto p-8">
      <h1 className="text-4xl font-bold text-[#00df9a] mb-4">Welcome to Your Landing Page!</h1>
      <p className="text-gray-300">This is where you can manage your stocks and portfolio.</p>
      
      <div className="mt-4">
        <label className="text-gray-300 mr-2">Select Stock:</label>
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="bg-gray-800 text-gray-300 p-2 rounded"
        >
          {stocksList.map((stock) => (
            <option key={stock} value={stock}>
              {stock}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-gray-300 mr-2">Select Date Range:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-gray-800 text-gray-300 p-2 rounded"
        >
          <option value="5d">Last 5 Days</option>
          <option value="1m">Last 1 Month</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
          <option value="max">Max</option>
        </select>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Stock Prices Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" />
            <XAxis dataKey="date" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="close" stroke="#00df9a" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LandingPage;
