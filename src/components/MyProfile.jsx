import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Import AuthContext

const MyProfile = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [userName, setUserName] = useState(''); // New state for user name
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // New state for error messages
  const [showChangePassword, setShowChangePassword] = useState(false); // New state for showing the change password section
  const { userEmail } = useContext(AuthContext); // Get userEmail from AuthContext

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return; // Prevents unnecessary API calls
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userEmail}`);
        setUserName(response.data.name); // Ensure the backend sends { name: userName }
        setBalance(response.data.balance); // Ensure the backend sends { balance: X }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userEmail]);
  
  const handleAddMoney = async (e) => {
    e.preventDefault();
    const newBalance = parseFloat(balance) + parseFloat(amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    
    setBalance(newBalance); // Optimistic UI update
    setAmount('');
    console.log("User Email:", userEmail);

    try {
      const response = await axios.post('http://localhost:5000/api/users/update-balance', {
        email: userEmail,
        amount: parseFloat(amount),
      });
      setBalance(response.data.balance);
      alert(`Successfully added $${amount} to your balance! New balance: $${response.data.balance}`);
    } catch (error) {
      alert('Failed to update balance. Please try again.');
      console.error('Error updating balance:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset message before the request
    setError(''); // Reset error before the request

    try {
      const response = await axios.post('http://localhost:5000/api/users/change-password', {
          email: userEmail,
          currentPassword,
          newPassword,
      });

      console.log('Response:', response.data); // Debugging log
      if (response.data.message === 'Password updated successfully') {
          setMessage('Password updated successfully.');
          setCurrentPassword(''); // Clear current password field
          setNewPassword(''); // Clear new password field
          setShowChangePassword(false); // Hide the form after successful change
      } else {
          setError('Failed to update password. Please check your current password.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Error changing password. Please try again.');
    }
  };

  return (
    <div className='text-white'>
      <div className='flex flex-col md:flex-row max-w-[1200px] mx-auto my-10 p-6 bg-gray-800 rounded-lg'>
        
        {/* Your Profile Section */}
        <div className='flex-1 p-4'>
          <h1 className='text-4xl font-bold mb-4'>Your Profile</h1>
          <p className='text-xl mb-2'>Name: {userName}</p> {/* Display User Name */}
          <p className='text-xl mb-2'>Current Balance: ${balance.toFixed(2)}</p>
          <p className='text-xl mb-2'>Email: {userEmail}</p>
          <p className='text-gray-500 mb-4'>Manage your investments and track your portfolio effectively.</p>
          
          {/* Edit Password Button */}
          <button 
            onClick={() => setShowChangePassword(!showChangePassword)}
            className='bg-[#00df9a] rounded-md font-medium py-2 text-black mb-4'>
            {showChangePassword ? 'Cancel' : 'Edit Password'}
          </button>

          {/* Change Password Section */}
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
                {message && <p className='mt-4 text-green-500'>{message}</p>} {/* Success Message */}
                {error && <p className='mt-4 text-red-500'>{error}</p>} {/* Error Message */}
              </form>
            </>
          )}
        </div>
        
        {/* Add Money Section */}
        <div className='flex-1 p-4 bg-gray-700 rounded-lg'>
          <h2 className='text-3xl font-bold mb-4'>Add Money</h2>
          <form onSubmit={handleAddMoney} className='flex flex-col'>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='Enter amount to add'
              className='p-2 rounded-md mb-4 text-black'
              required
            />
            <button 
              type='submit'
              className='bg-[#00df9a] rounded-md font-medium py-3 text-black'>
              Add Money
            </button>
          </form>
          <p className='mt-4 text-gray-500'>Once funds are added, you can start investing in stocks.</p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
