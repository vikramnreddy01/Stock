import React, { useState, useContext, useEffect } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = () => {
    setNav((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home
  };

  const handleLinkClick = () => {
    setNav(false); // Close the navigation
  };

  // Automatically log out if the user navigates to the login page
  useEffect(() => {
    if (location.pathname === '/login' && isLoggedIn) {
      logout();
    }
  }, [location, isLoggedIn, logout]);

  const navLinkClasses = 'flex items-center justify-center h-full px-4 py-2 text-lg font-semibold rounded-lg transition duration-300 hover:bg-[#00df9a] hover:text-black';

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white'>
      <h1 className='text-3xl font-bold text-[#00df9a]'>STOCKS.</h1>

      {/* Desktop Navigation */}
      <ul className='hidden md:flex'>
        {isLoggedIn ? (
          <>
            <li className={location.pathname === "/landing" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/landing">Home</Link>
            </li>
            <li className={location.pathname === "/buy-stocks" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/buy-stocks">Equity</Link>
            </li>
            <li className={location.pathname === "/my-portfolio" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/my-portfolio">Portfolio</Link>
            </li>
            <li className={location.pathname === "/my-profile" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/my-profile">My Profile</Link>
            </li>
            <li className={`${navLinkClasses} cursor-pointer`} onClick={handleLogout}>Logout</li>
          </>
        ) : (
          <>
            <li className={location.pathname === "/" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/">Home</Link>
            </li>
            <li className={location.pathname === "/about" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/about">About</Link>
            </li>
            <li className={location.pathname === "/contact" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/contact">Contact</Link>
            </li>
            <li className={location.pathname === "/login" ? `${navLinkClasses} text-[#00df9a]` : navLinkClasses}>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>

      {/* Mobile Menu Icon */}
      <div onClick={handleNav} className='block md:hidden'>
        {nav ? <AiOutlineClose size={30} className="text-[#00df9a]" aria-label="Close menu" /> : <AiOutlineMenu size={30} className="text-[#00df9a]" aria-label="Open menu" />}
      </div>

      {/* Mobile Navigation */}
      <ul className={nav ? 'fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 z-10' : 'ease-in-out duration-500 fixed left-[-100%]'}>
        {isLoggedIn ? (
          <>
            <h1 className='w-full text-3xl font-bold text-[#00df9a] m-4'>STOCKS.</h1>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/landing" onClick={handleLinkClick}>Home</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/buy-stocks" onClick={handleLinkClick}>Buy Stocks</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/my-portfolio" onClick={handleLinkClick}>My Portfolio</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/my-profile" onClick={handleLinkClick}>My Profile</Link>
            </li>
            <li className={`p-4 border-b border-gray-600 cursor-pointer`} onClick={() => { handleLogout(); handleLinkClick(); }}>Logout</li>
          </>
        ) : (
          <>
            <h1 className='w-full text-3xl font-bold text-[#00df9a] m-4'>STOCKS.</h1>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/" onClick={handleLinkClick}>Home</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/about" onClick={handleLinkClick}>About</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/contact" onClick={handleLinkClick}>Contact</Link>
            </li>
            <li className={`p-4 border-b border-gray-600`}>
              <Link to="/login" onClick={handleLinkClick}>Login</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
