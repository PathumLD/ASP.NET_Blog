/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderNavbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    };

    const handleNavigation = (path) => {
        navigate(path);
    }

    return (
        <nav className="flex justify-between items-center h-16 p-4 bg-blue-600 text-white">
            <button 
                onClick={() => handleNavigation('/dashboard')}
                className="text-xl font-bold"
            >
                BlogMe {/* Replace with your logo component or image */}
            </button>

            <div className="flex space-x-4">
                <button 
                    className="hover:underline"
                    onClick={() => handleNavigation('/dashboard')}
                >
                    Dashboard
                </button>
                <button 
                    className="hover:underline"
                    onClick={() => handleNavigation('/profile')}
                >
                    Profile
                </button>
                <button 
                    className="hover:underline"
                    onClick={() => handleNavigation('/settings')}
                >
                    Settings
                </button>
                <button 
                    className="hover:underline"
                    onClick={() => handleNavigation('/blogs')}
                >
                    My Blogs
                </button>
                <button 
                    className="hover:underline" 
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default ReaderNavbar;