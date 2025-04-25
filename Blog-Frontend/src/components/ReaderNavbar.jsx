import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiUser, FiSettings, FiBook, FiPlus, FiLogOut } from 'react-icons/fi';
import { FaMedium } from 'react-icons/fa';

const ReaderNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: <FiHome className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/blogs', icon: <FiBook className="w-5 h-5" />, label: 'My Blogs' },
        { path: '/profile', icon: <FiUser className="w-5 h-5" />, label: 'Profile' },
        // { path: '/settings', icon: <FiSettings className="w-5 h-5" />, label: 'Settings' },
    ];

    return (
        <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 bg-white shadow-md"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center"
                    >
                        <Link 
                            to="/dashboard" 
                            className="flex items-center text-2xl font-bold text-gray-800"
                        >
                            <FaMedium className="text-indigo-600 mr-2" size={28} />
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                BlogMe
                            </span>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <motion.button
                                key={item.path}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(item.path)}
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                {item.icon}
                                <span className="ml-2">{item.label}</span>
                            </motion.button>
                        ))}

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to="/blogs/create" 
                                className="ml-2 flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm"
                            >
                                <FiPlus className="mr-2" />
                                New Blog
                            </Link>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="ml-2 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FiLogOut className="mr-2" />
                            Logout
                        </motion.button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none">
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white shadow-lg">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                        </button>
                    ))}
                    <Link 
                        to="/blogs/create" 
                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                        <FiPlus className="mr-2" />
                        New Blog
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                    >
                        <FiLogOut className="mr-2" />
                        Logout
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default ReaderNavbar;