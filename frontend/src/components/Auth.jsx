import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';
  
    try {
      const response = await axios.post(url, formData);
      setMessage(response.data.message);
  
      if (isLogin) {
        const token = response.data.token; // Ensure token is returned
        const email = formData.email;
  
        // Store the token and email in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
  
        // Update context state and navigate
        login(token, email); // Pass email as well
        navigate('/landing');
      }
  
      // Reset form fields after successful submission
      setFormData({
        email: '',
        password: '',
        name: isLogin ? '' : '',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred. Please try again.';
      setMessage(errorMsg);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-[#00df9a] text-center mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-400 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 text-gray-900 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#00df9a]"
                required
                placeholder="Your Name"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 text-gray-900 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#00df9a]"
              required
              placeholder="Your Email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-400 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 text-gray-900 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-[#00df9a]"
              required
              placeholder="Your Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#00df9a] text-gray-900 font-bold py-2 rounded hover:bg-[#00df9a]/80 transition duration-300"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        {message && <p className="text-red-500 mt-4 text-center">{message}</p>}
        <div className="text-center mt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#00df9a] hover:underline">
            {isLogin ? 'Create an account' : 'Already have an account?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
