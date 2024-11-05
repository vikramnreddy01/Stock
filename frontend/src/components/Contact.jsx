import React, { useState } from 'react';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/api/contact', formData); // Updated endpoint
        setSuccessMessage(response.data.message); // Use response.data.message
        setErrorMessage('');
        // Reset form after submission
        setFormData({ name: '', email: '', message: '' });
    } catch (error) {
        setErrorMessage('Error sending message. Please try again later.');
        setSuccessMessage('');
    }
};

  return (
    <div className="max-w-[1240px] mx-auto p-8">
      <h1 className="text-4xl font-bold text-[#00df9a] mb-4">Contact Me</h1>
      <p className="text-gray-300 mb-6">
        Have questions or want to get in touch? Fill out the form below, and I'll get back to you as soon as possible!
      </p>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 text-gray-900 rounded"
            required
            placeholder="Your Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 text-gray-900 rounded"
            required
            placeholder="Your Email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 text-gray-900 rounded"
            required
            placeholder="Your Message"
            rows="4"
          ></textarea>
        </div>
        <button 
          type="submit" 
          className="bg-[#00df9a] text-gray-900 font-bold py-2 px-4 rounded hover:bg-[#00df9a]/80 transition duration-300"
        >
          Send Message
        </button>
      </form>

      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Other Ways to Reach Me</h2>
        <div className="flex items-center mb-2">
          <FaEnvelope className="text-[#00df9a] mr-2" size={24} />
          <a href="mailto:vikram.n1999@gmail.com" className="text-gray-300">vikram.n1999@gmail.com</a>
        </div>
        <div className="flex items-center mb-2">
          <FaLinkedin className="text-[#00df9a] mr-2" size={24} />
          <a href="https://www.linkedin.com/in/vikram-n-reddy-187762229/" target="_blank" rel="noopener noreferrer" className="text-gray-300">LinkedIn Profile</a>
        </div>
        <div className="flex items-center">
          <FaGithub className="text-[#00df9a] mr-2" size={24} />
          <a href="https://github.com/vikramnreddy01" target="_blank" rel="noopener noreferrer" className="text-gray-300">GitHub Profile</a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
