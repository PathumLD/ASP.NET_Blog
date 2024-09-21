import { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    // const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError("New password and confirmation do not match.");
            setMessage('');
            return;
        }

        try {
            const response = await axios.put('https://localhost:7140/api/Reader/updatePassword', {
                currentPassword,
                newPassword,
                confirmNewPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage(response.data); // Set success message
            setError('');
            window.location.reload();

            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response ? err.response.data : "An error occurred. Please try again.");
            setMessage('');
            // Clear error message after 3 seconds
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit}>
            {message && <p className="text-green-600 my-4">{message}</p>}
            {error && <p className="text-red-600 my-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
