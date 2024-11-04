import React from 'react';

const About = () => {
  return (
    <div className="max-w-[1240px] mx-auto p-8">
    
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Our Mission</h2>
          <p className="text-gray-400">
            At STOCKS., our mission is to empower investors with the tools and knowledge they need to succeed in the stock market. We believe that anyone can be a successful investor with the right resources and support.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Our Vision</h2>
          <p className="text-gray-400">
            We envision a world where investment opportunities are accessible to everyone, regardless of their experience level. Our goal is to create a transparent and user-friendly platform that fosters financial literacy and confidence.
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-gray-400">
          <li>Integrity: We uphold the highest standards of integrity in all our actions.</li>
          <li>Customer Focus: We prioritize the needs of our users above all else.</li>
          <li>Innovation: We embrace change and seek to innovate continually.</li>
          <li>Community: We are committed to giving back to the community and promoting financial literacy.</li>
        </ul>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-[#00df9a] mb-4">Join Us</h2>
        <p className="text-gray-400 mb-4">
          Whether you're a seasoned investor or just starting out, we invite you to join our community. Explore our platform, learn from our resources, and connect with other like-minded investors.
        </p>
        <a 
          href="/signup" 
          className="inline-block bg-[#00df9a] text-gray-900 font-bold py-2 px-4 rounded hover:bg-[#00df9a]/80 transition duration-300"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};

export default About;
