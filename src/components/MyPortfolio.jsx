import React, { useState } from 'react';

const MyPortfolio = () => {
  // Sample investment data
  const [investments, setInvestments] = useState([
    { id: 1, name: 'Apple Inc.', quantity: 5, purchasePrice: 150, currentPrice: 175 },
    { id: 2, name: 'Google LLC', quantity: 3, purchasePrice: 1200, currentPrice: 1350 },
    { id: 3, name: 'Tesla Inc.', quantity: 2, purchasePrice: 700, currentPrice: 800 },
  ]);

  const handleSell = (id) => {
    // Remove the investment from the state
    const updatedInvestments = investments.filter(investment => investment.id !== id);
    setInvestments(updatedInvestments);
    alert('Investment sold successfully!');
  };

  return (
    <div className="text-white max-w-[1200px] mx-auto my-10 p-6">
      <h1 className="text-4xl font-bold mb-6">My Portfolio</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        {investments.length === 0 ? (
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
                <tr key={investment.id} className="border-b border-gray-600 hover:bg-gray-600">
                  <td className="py-3 px-4">{investment.name}</td>
                  <td className="py-3 px-4">{investment.quantity}</td>
                  <td className="py-3 px-4">${investment.purchasePrice.toFixed(2)}</td>
                  <td className="py-3 px-4">${investment.currentPrice.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleSell(investment.id)} 
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
