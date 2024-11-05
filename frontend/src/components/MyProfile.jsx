import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

const MyProfile = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [userName, setUserName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const { userEmail } = useContext(AuthContext);
  const chartRef = useRef(null);
  const [stockLogs, setStockLogs] = useState([]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userEmail}`);
        setUserName(response.data.name);
        setBalance(response.data.balance);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  
  useEffect(() => {
    const fetchStockLogData = async () => {
      if (!userEmail) return; // Ensure userEmail is available
      try {
        const response = await axios.get(`http://localhost:5000/api/stock-logs/${userEmail}`);
        setStockLogs(response.data);
        const stockLogData = response.data.map(log => ({
          date: new Date(log.date),
          totalCost: log.totalCost, // Use totalCost for the chart
          type: log.type // 'BUY' or 'SELL'
        }));
        renderChart(stockLogData);
      } catch (error) {
        console.error('Error fetching stock log data:', error);
      }
    };

    fetchStockLogData();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [userEmail]);

  const renderChart = (data) => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('myChart').getContext('2d');

    // Prepare data for the chart
    const buyData = [];
    const sellData = [];
    const labels = [];

    // Fill in the data arrays
    data.forEach(log => {
      const formattedDate = log.date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!labels.includes(formattedDate)) {
        labels.push(formattedDate);
      }

      // Set values for the datasets
      if (log.type === 'BUY') {
        buyData[labels.indexOf(formattedDate)] = (buyData[labels.indexOf(formattedDate)] || 0) + log.totalCost;
        sellData[labels.indexOf(formattedDate)] = sellData[labels.indexOf(formattedDate)] || 0; // Placeholder for SELL
      } else if (log.type === 'SELL') {
        sellData[labels.indexOf(formattedDate)] = (sellData[labels.indexOf(formattedDate)] || 0) + log.totalCost;
        buyData[labels.indexOf(formattedDate)] = buyData[labels.indexOf(formattedDate)] || 0; // Placeholder for BUY
      }
    });

    // Chart configuration
    const datasets = [
      {
        label: 'Buy Transactions',
        data: buyData,
        backgroundColor: '#00df9a',
        borderColor: '#00df9a',
        borderWidth: 1,
      },
      {
        label: 'Sell Transactions',
        data: sellData,
        backgroundColor: '#ff0000',
        borderColor: '#ff0000',
        borderWidth: 1,
      },
    ];

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                return `${tooltipItem.dataset.label}: $${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date and Time',
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Transaction Amount ($)',
            },
          },
        },
      },
    });
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const newBalance = parseFloat(balance) + parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setBalance(newBalance);
    setAmount('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/update-balance', {
        email: userEmail,
        amount: parseFloat(amount),
      });
      setBalance(response.data.balance);
    } catch (error) {
      alert('Failed to update balance. Please try again.');
      console.error('Error updating balance:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/change-password', {
        email: userEmail,
        currentPassword,
        newPassword,
      });

      if (response.data.message === 'Password updated successfully') {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setShowChangePassword(false);
      } else {
        setError('Failed to update password. Please check your current password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Error changing password. Please try again.');
    }
  };
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(stockLogs.length / itemsPerPage);

  // Get current transactions to display
  const currentTransactions = stockLogs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };


  const [totalProfit, setTotalProfit] = useState(0);

  // Calculate total profit from stock logs
  useEffect(() => {
    const calculateProfit = () => {
      let profit = 0;
  
      stockLogs.forEach(log => {
        if (log.type === 'SELL') {
          profit += log.totalCost; // Add the totalCost for sell transactions
        } else if (log.type === 'BUY') {
          profit -= log.totalCost; // Subtract the totalCost for buy transactions
        }
      });
  
      setTotalProfit(profit);
    };
  
    if (stockLogs.length > 0) {
      calculateProfit();
    }
  }, [stockLogs]);
  return (
    <div className='text-white'>
      <div className='flex flex-col md:flex-row max-w-[1200px] mx-auto my-10 p-6 bg-gray-800 rounded-lg'>
        <div className='flex-1 p-4'>
          <h1 className='text-4xl font-bold mb-4'>Your Profile</h1>
          <p className='text-xl mb-2'>Name: {userName}</p>
          <p className='text-xl mb-2'>Current Balance: ${balance.toFixed(2)}</p>
          <p className='text-xl mb-2'>Email: {userEmail}</p>
          <p className='text-gray-500 mb-4'>Manage your investments and track your portfolio effectively.</p>
<div className='flex gap-4 mb-4'>
  <button 
    onClick={() => setShowChangePassword(!showChangePassword)}
    className='bg-[#00df9a] rounded-lg font-semibold py-2 px-4 text-black shadow-md hover:bg-[#00b887] transition duration-200 transform hover:scale-105'>
    {showChangePassword ? 'Cancel' : 'Edit Password'}
  </button>

  <button 
    onClick={() => setShowAddMoney(!showAddMoney)}
    className='bg-[#00df9a] rounded-lg font-semibold py-2 px-4 text-black shadow-md hover:bg-[#00b887] transition duration-200 transform hover:scale-105'>
    {showAddMoney ? 'Hide Add Money' : 'Add Money'}
  </button>
</div>


          {showChangePassword && (
            <>
              <h2 className='text-3xl font-bold mb-4'>Change Password</h2>
              <form onSubmit={handleChangePassword} className='flex flex-col'>
                <input
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder='Current Password'
                  className='p-2 rounded-md mb-4 text-black'
                  required
                />
                <input
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='New Password'
                  className='p-2 rounded-md mb-4 text-black'
                  required
                />
                <button 
                  type='submit'
                  className='bg-[#00df9a] rounded-md font-medium py-3 text-black'>
                  Change Password
                </button>
                {message && <p className='mt-4 text-green-500'>{message}</p>}
                {error && <p className='mt-4 text-red-500'>{error}</p>}
              </form>
            </>
          )}

          {showAddMoney && (
            <div className='mt-4 p-4 bg-gray-700 rounded-md'>
              <h2 className='text-2xl font-bold mb-4'>Add Money</h2>
              <form onSubmit={handleAddMoney} className='flex flex-col'>
                <input
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='Amount to Add'
                  className='p-2 rounded-md mb-4 text-black'
                  required
                />
                <button 
                  type='submit'
                  className='bg-[#00df9a] rounded-md font-medium py-3 text-black'>
                  Add Money
                </button>
              </form>
            </div>
          )}
        </div>

        <div className='flex-1 p-4'>
          <h2 className='text-3xl font-bold mb-4'>Your Transactions</h2>
          <canvas id='myChart' className='w-full h-64'></canvas>
        </div>
      </div>
    

      <div className='flex flex-col lg:flex-row lg:space-x-6 my-10 max-w-5xl mx-auto'>
  {/* Transaction History Component */}
{/* Total Profit Component */}
<div className='lg:w-1/2 my-5 lg:my-0 p-6 border rounded-lg shadow-lg bg-gray-800 text-center'>
  <h2 className='text-3xl font-bold mb-4 text-white'>Total Profit</h2>
  {error ? (
    <p className='text-red-500'>{error}</p>
  ) : (
    <div className='text-[#00df9a]'>
      <p className='text-7xl font-extrabold text-[#00df9a] drop-shadow-lg'>
        ${totalProfit.toFixed(2)}
      </p>
      <p className='text-xl text-gray-400 mt-2'>Total profit earned so far</p>
    </div>
  )}
</div>


  <div className='lg:w-1/2 p-4 bg-gray-800 rounded-lg shadow-md'>
    <h2 className='text-3xl font-bold mb-4 text-white'>Transaction History</h2>
    {error && <p className='text-red-500 mb-4'>{error}</p>} {/* Display error message */}
    {currentTransactions.length > 0 ? (
      <ul className='space-y-2'>
        {currentTransactions.map((log) => (
          <li
            key={log._id}
            className='flex justify-between items-center bg-gray-700 p-3 rounded-lg transition duration-200 hover:bg-gray-600'
          >
            <div className='flex flex-col'>
              <span className='font-bold text-white'>{log.type}</span>
              <span className='text-gray-300 text-sm'>{new Date(log.date).toLocaleString()}</span>
            </div>
            <span className='text-lg font-semibold text-white'>${log.totalCost.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className='text-gray-400'>No transactions found.</p>
    )}

    {/* Pagination Controls */}
    <div className='flex justify-between mt-4'>
      <button
        onClick={handlePreviousPage}
        disabled={currentPage === 0}
        className={`bg-[#00df9a] rounded-lg font-semibold py-2 px-4 text-black shadow-md hover:bg-[#00b887] transition duration-200 transform hover:scale-105 ${
          currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Previous
      </button>
      <button
        onClick={handleNextPage}
        disabled={currentPage >= totalPages - 1}
        className={`bg-[#00df9a] rounded-lg font-semibold py-2 px-4 text-black shadow-md hover:bg-[#00b887] transition duration-200 transform hover:scale-105 ${
          currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Next
      </button>
    </div>
  </div>
</div>
    </div>
  );
};

export default MyProfile;
