import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailUpdate, setEmailUpdate] = useState({
    currentEmail: '',
    newEmail: '',
    confirmNewEmail: '',
    currentPassword: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7140/api/Reader/getCurrentReader', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });
      } catch (err) {
        setError('Failed to load profile data.', err);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleEmailUpdateChange = (e) => {
    const { name, value } = e.target;
    setEmailUpdate((prevEmailUpdate) => ({
      ...prevEmailUpdate,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const updateData = {};
    if (profile.firstName) updateData.firstName = profile.firstName;
    if (profile.lastName) updateData.lastName = profile.lastName;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://localhost:7140/api/Reader/updateProfile',
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.', err);
    }
  };

  const handleEmailUpdateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (emailUpdate.newEmail !== emailUpdate.confirmNewEmail) {
      setError('New email and confirm new email do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://localhost:7140/api/Reader/updateEmail',
        emailUpdate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Email updated successfully!');
      
      // Show confirmation modal
      setShowConfirmModal(true);
      setShowEmailModal(false); // Close email update modal
    } catch (err) {
      setError('Failed to update email.', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Profile</h1>
      {success && <div className="text-green-500 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleProfileSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleProfileChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            className="w-full p-2 border border-gray-300 rounded"
            disabled
          />
        </div>

        <button
          type="button"
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => setShowEmailModal(true)}
        >
          Update Email
        </button>

        <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded ml-4">
          Save Changes
        </button>
      </form>

      {/* Modal for email update */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Update Email</h2>
            <form onSubmit={handleEmailUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Current Email</label>
                <input
                  type="email"
                  name="currentEmail"
                  value={emailUpdate.currentEmail}
                  onChange={handleEmailUpdateChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">New Email</label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailUpdate.newEmail}
                  onChange={handleEmailUpdateChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Confirm New Email</label>
                <input
                  type="email"
                  name="confirmNewEmail"
                  value={emailUpdate.confirmNewEmail}
                  onChange={handleEmailUpdateChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={emailUpdate.currentPassword}
                  onChange={handleEmailUpdateChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                  Update Email
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white py-2 px-4 rounded"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Email Changed</h2>
            <p>Your email has been changed. You are being redirected to the login page.</p>
            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
