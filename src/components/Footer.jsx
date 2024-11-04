import React from 'react';
import { FaGithubSquare, FaLinkedin } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';

const Footer = () => {
  return (
    <div className='max-w-[1240px] mx-auto py-16 px-4 grid lg:grid-cols-3 gap-8 text-gray-300'>
      <div>
        <h1 className='w-full text-3xl font-bold text-[#00df9a]'>STOCKS.</h1>
        <p className='py-4'>
          Manage and grow your stock portfolio with real time insights and analytics tailored to your investment goals.
        </p>
        <div className='flex justify-between md:w-[50%] my-6'>
          <a href="https://github.com/vikramnreddy01" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithubSquare size={30} />
          </a>
          <a href="https://www.linkedin.com/in/vikram-n-reddy-187762229/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={30} />
          </a>
          <a href="mailto:vikram.n1999@gmail.com" aria-label="Email">
            <HiOutlineMail size={30} />
          </a>
        </div>
      </div>
      <div className='lg:col-span-2 flex justify-between mt-6'>
        <div>
          <h6 className='font-medium text-gray-400'>Solutions</h6>
          <ul>
            <li className='py-2 text-sm'>Analytics</li>
            <li className='py-2 text-sm'>Portfolio Management</li>
            <li className='py-2 text-sm'>Investment Insights</li>
          </ul>
        </div>
        <div>
          <h6 className='font-medium text-gray-400'>Company</h6>
          <ul>
            <li className='py-2 text-sm'>About Us</li>
            <li className='py-2 text-sm'>Blog</li>
            <li className='py-2 text-sm'>Careers</li>
          </ul>
        </div>
        <div>
          <h6 className='font-medium text-gray-400'>Legal</h6>
          <ul>
            <li className='py-2 text-sm'>Privacy Policy</li>
            <li className='py-2 text-sm'>Terms of Service</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
