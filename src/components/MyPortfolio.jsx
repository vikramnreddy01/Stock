import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const MyPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState({}); // Store stock data for each symbol
  const { userEmail } = useContext(AuthContext);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/${userEmail}`);
        setInvestments(response.data);
        await fetchAllStockData(response.data);
      } catch (error) {
        setError('Failed to fetch investments. Please try again later.');
        console.error('Error fetching investments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [userEmail]);

  const fetchAllStockData = async (investments) => {
    const stockPromises = investments.map(async (investment) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stock/${investment.symbol}`);
        setStockData((prev) => ({
          ...prev,
          [investment.symbol]: response.data, // Store stock data by symbol
        }));
      } catch (error) {
        console.error(`Error fetching stock data for ${investment.symbol}:`, error);
      }
    });

    await Promise.all(stockPromises); // Wait for all stock data to be fetched
  };

  const handleSell = async (id, symbol, quantity) => {
    try {
      // Get the current price before deleting the investment
      const currentPrice = stockData[symbol] ? stockData[symbol].close : 0;

      // Calculate the total amount from selling the stocks
      const totalSaleAmount = currentPrice * quantity;

      // Update the user's balance in the backend
      await axios.post(`http://localhost:5000/api/users/update-balance`, {
        email: userEmail,
        amount: totalSaleAmount,
      });

      // Delete the investment
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      const updatedInvestments = investments.filter(investment => investment._id !== id);
      setInvestments(updatedInvestments);
      alert('Investment sold successfully! Balance updated.');
    } catch (error) {
      console.error('Error selling investment:', error);
      alert('Failed to sell investment. Please try again later.');
    }
  };

  return (
    <div className="text-white max-w-[1200px] mx-auto my-10 p-6">
      <h1 className="text-4xl font-bold mb-6">My Portfolio</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        {loading ? (
          <p className="text-xl text-gray-300">Loading investments...</p>
        ) : error ? (
          <p className="text-xl text-red-500">{error}</p>
        ) : investments.length === 0 ? (
          <p className="text-xl text-gray-300">You have no investments in your portfolio.</p>
        ) : (
          <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-600">
                <th className="py-3 px-4 text-left text-gray-200">Stock</th>
                <th className="py-3 px-4 text-left text-gray-200">Quantity</th>
                <th className="py-3 px-4 text-left text-gray-200">Purchase Price</th>
                <th className="py-3 px-4 text-left text-gray-200">Current Price</th>
                <th className="py-3 px-4 text-left text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => (
                <tr key={investment._id} className="border-b border-gray-600 hover:bg-gray-600">
                  <td className="py-3 px-4">{investment.symbol}</td>
                  <td className="py-3 px-4">{investment.quantity}</td>
                  <td className="py-3 px-4">${investment.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    ${stockData[investment.symbol] ? stockData[investment.symbol].close.toFixed(2) : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleSell(investment._id, investment.symbol, investment.quantity)} 
                      className="bg-red-600 rounded-md px-4 py-2 text-white hover:bg-red-500 transition duration-200">
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyPortfolio;
