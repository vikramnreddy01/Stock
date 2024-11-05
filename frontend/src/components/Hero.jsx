import React from 'react';
import { ReactTyped as Typed } from 'react-typed';
import { useNavigate } from 'react-router-dom';


const Hero = () => {
  const navigate = useNavigate(); // Initialize useNavigate

const handleGetStarted = () => {
    navigate('/login'); // Navigate to the login page
  };
  
  return (
    <div className='text-white'>
      <div className='max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
        <p className='text-[#00df9a] font-bold p-2 mb-4'>
          MANAGE YOUR STOCK PORTFOLIO
        </p>
        <h1 className='md:text-7xl sm:text-6xl text-4xl font-bold md:py-6 mb-6'>
          Take Control of Your Investments.
        </h1>
        <div className='flex justify-center items-center mb-6'>
          <p className='md:text-5xl sm:text-4xl text-xl font-bold py-4 mr-4'>
            {/* Placeholder if you want to add text here */}
          </p>
          <Typed
            className='md:text-5xl sm:text-4xl text-xl font-bold md:pl-4 pl-2 text-[#00df9a]'
            strings={['Stocks', 'ETFs', 'Mutual Funds']}
            typeSpeed={120}
            backSpeed={140}
            loop
          />
        </div>
        <p className='md:text-2xl text-xl font-bold text-gray-500 mb-8'>
          Track, analyze, and optimize your portfolio to maximize gains and minimize risks.
        </p>
        <button 
            className='bg-[#00df9a] w-[200px] rounded-md font-medium my-6 mx-auto py-3 text-black' 
            onClick={handleGetStarted} // Attach the click handler
        >
            Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero
