import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const MyPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState({});
  const { userEmail } = useContext(AuthContext);
  const [sellQuantity, setSellQuantity] = useState(0);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/${userEmail}`);
        const buyInvestments = response.data.filter(investment => investment.type === "BUY");
        setInvestments(buyInvestments);
        await fetchAllStockData(buyInvestments);
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
          [investment.symbol]: response.data,
        }));
      } catch (error) {
        console.error(`Error fetching stock data for ${investment.symbol}:`, error);
      }
    });
    await Promise.all(stockPromises);
  };

  
  const handleSell = async () => {
    if (!selectedInvestment || sellQuantity <= 0 || sellQuantity > selectedInvestment.quantity) {
      alert('Please select a valid quantity to sell.');
      return;
    }

    try {
      const { _id, symbol } = selectedInvestment;
      const currentPrice = stockData[symbol] ? stockData[symbol].close : 0;
      const totalSaleAmount = currentPrice * sellQuantity;

      await axios.post(`http://localhost:5000/api/users/update-balance`, {
        email: userEmail,
        amount: totalSaleAmount,
      });

      await axios.post(`http://localhost:5000/api/transactions/sell`, {
        userEmail,
        symbol,
        quantity: sellQuantity,
        currentPrice,
        transactionId: _id,
      });

      const updatedInvestments = await axios.get(`http://localhost:5000/api/transactions/${userEmail}`);
      const buyInvestments = updatedInvestments.data.filter(investment => investment.type === "BUY");
      setInvestments(buyInvestments);
      setSellQuantity(0);
      setSelectedInvestment(null);
    } catch (error) {
      console.error('Error selling investment:', error);
      alert('Failed to sell investment. Please try again later.');
    }
  };

  return (
    <div className="text-white max-w-[1200px] mx-auto my-6 p-4 sm:my-10 sm:p-6">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center sm:text-left">My Portfolio</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        {loading ? (
          <p className="text-lg sm:text-xl text-gray-300">Loading investments...</p>
        ) : error ? (
          <p className="text-lg sm:text-xl text-red-500">{error}</p>
        ) : investments.length === 0 ? (
          <p className="text-lg sm:text-xl text-gray-300">You have no investments in your portfolio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-600">
                  <th className="py-2 px-3 sm:py-3 sm:px-4 text-left text-gray-200 text-sm sm:text-base">Stock</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-4 text-left text-gray-200 text-sm sm:text-base">Quantity</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-4 text-left text-gray-200 text-sm sm:text-base">Purchase Price</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-4 text-left text-gray-200 text-sm sm:text-base">Current Price</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-4 text-left text-gray-200 text-sm sm:text-base"></th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => (
                  <tr key={investment._id} className="border-b border-gray-600 hover:bg-gray-600">
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base">{investment.symbol}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base">{investment.quantity}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base">${investment.price.toFixed(2)}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base">
                      ${stockData[investment.symbol] ? stockData[investment.symbol].close.toFixed(2) : "N/A"}
                    </td>
                    <td className="py-2 px-3 sm:py-3 sm:px-4">
                      <button
                        onClick={() => {
                          setSelectedInvestment(investment);
                          setSellQuantity(1);
                        }}
                        className="bg-[#00df9a] rounded-md px-2 py-1 sm:px-4 sm:py-2 text-white hover:bg-[#00df9a] transition duration-200 text-sm sm:text-base">
                        Select to Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedInvestment && (
          <div className="mt-4 bg-gray-700 p-4 rounded-lg text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Sell {selectedInvestment.symbol}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="number"
                value={sellQuantity}
                min="1"
                max={selectedInvestment.quantity}
                onChange={(e) => setSellQuantity(Number(e.target.value))}
                className="p-2 rounded text-gray-900 w-full sm:w-24 text-center"
                placeholder="Quantity"
              />
              <span className="text-gray-300 text-sm sm:text-base">/ {selectedInvestment.quantity} available</span>
            </div>
            <button
              onClick={handleSell}
              disabled={sellQuantity <= 0 || sellQuantity > selectedInvestment.quantity}
              className={`bg-red-600 rounded-md px-3 py-2 sm:px-4 sm:py-2 text-white mt-4 transition duration-200 text-sm sm:text-base ${
                sellQuantity > 0 && sellQuantity <= selectedInvestment.quantity
                  ? 'hover:bg-red-500'
                  : 'opacity-50 cursor-not-allowed'
              }`}>
              Confirm Sell
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPortfolio;
