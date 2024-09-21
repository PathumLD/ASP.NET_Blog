import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState(''); // This will hold HTML content
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://localhost:7140/api/Blog/createBlog',
        {
          title,
          category,
          description, // Send HTML content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Blog created successfully:', response.data);
      navigate('/blogs'); // Redirect to the blog list after successful creation
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-12 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Write a New Blog</h1>

      <form onSubmit={handleCreateBlog} className="max-w-2xl mx-auto">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter the blog title"
          />
        </div>

        {/* Category Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter the blog category"
          />
        </div>

        {/* Description Input using ReactQuill */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <ReactQuill
            value={description}
            onChange={setDescription}
            theme="snow" // Theme can be customized as needed
            placeholder="Write the blog description"
            className="h-64" // Added custom height here
          />
        </div>

        {/* Submit Button */}
        <div className="text-center mt-16">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 text-white py-2 px-4 rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {loading ? 'Creating...' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
