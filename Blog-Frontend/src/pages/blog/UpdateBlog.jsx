import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor

const UpdateBlog = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState({ title: '', category: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://localhost:7140/api/Blog/viewBlog/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlog(response.data);
      } catch (err) {
        setError('Failed to load blog details.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setBlog((prevBlog) => ({ ...prevBlog, description: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://localhost:7140/api/Blog/updateBlog/${blogId}`, blog, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      navigate(`/blogs`);
    } catch (err) {
      setError('Failed to update the blog.', err);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://localhost:7140/api/Blog/deleteBlog/${blogId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(true);
      alert("Blog deleted successfully!");
      navigate('/blogs'); // Redirect to the list of blogs
    } catch (err) {
      setError('Failed to delete the blog.', err);
    }
  };

  const openModal = (e) => {
    e.preventDefault(); // Prevent form submission
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md mt-12 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Update Blog</h1>
      {success && <div className="text-green-500">Blog updated successfully!</div>}
      <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500 mt-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={blog.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={blog.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <ReactQuill
            value={blog.description}
            onChange={handleQuillChange}
            theme="snow"
            className="h-64"
            required
          />
        </div>
        <div className='flex justify-between'>
          <button onClick={openModal} className="bg-red-500 text-white py-2 px-4 mt-16 rounded hover:bg-red-600">
            Delete Blog
          </button>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 mt-16 rounded hover:bg-blue-600">
            Update Blog
          </button>
        </div>
      </form>
      
      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this blog?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  closeModal();
                }}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateBlog;
