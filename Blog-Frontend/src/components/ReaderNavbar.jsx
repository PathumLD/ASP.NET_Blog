/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderNavbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    };

    const handleLogoAction = () => {
        navigate ('/dashboard')
    }

    return (
        <nav className="flex justify-between items-center h-16 p-4 bg-blue-600 text-white">
            <button 
                onClick={handleLogoAction} 
                className="text-xl font-bold"
            >
                BlogMe {/* Replace with your logo component or image */}
            </button>

            <div className="flex space-x-4">
                <button 
                    className="hover:underline"
                >
                    Dashboard
                </button>
                <button 
                    className="hover:underline"
                >
                    Profile

                </button>
                <button 
                    className="hover:underline"
                >
                    Settings

                </button>
                <button 
                    className="hover:underline"
                >
                    Blogs

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