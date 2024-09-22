import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UpdateBlog = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState({
        title: '',
        category: '',
        description: '',
        blogStatus: 1,
        image: null, // Image state
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch the blog details when the component loads
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://localhost:7140/api/Blog/viewBlog/${blogId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const blogData = response.data;
                setBlog({
                    title: blogData.title,
                    category: blogData.category,
                    description: blogData.description,
                    blogStatus: blogData.blogStatus,
                    image: null, // Keep image initially empty
                });
            } catch (err) {
                console.error('Error fetching blog:', err.response?.data || err.message);
                setError('Error fetching blog data.');
            }
        };

        fetchBlog();
    }, [blogId]);

    // Handle text field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
    };

    // Handle ReactQuill change (for description)
    const handleDescriptionChange = (value) => {
        setBlog((prevBlog) => ({ ...prevBlog, description: value }));
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        setBlog((prevBlog) => ({ ...prevBlog, image: e.target.files[0] }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);
  
      try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('title', blog.title);
          formData.append('category', blog.category);
          formData.append('description', blog.description);
          formData.append('blogStatus', blog.blogStatus);
  
          // Only append the image if a new one is selected
          if (blog.image) {
              formData.append('image', blog.image);
          }
  
          // Send PUT request to update the blog
          await axios.put(`https://localhost:7140/api/Blog/updateBlog/${blogId}`, formData, {
              headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
              },
          });
  
          setSuccess(true);
          navigate(`/blogs`); // Redirect after successful update
      } catch (err) {
          console.error('Failed to update the blog:', err.response?.data || err.message);
          // Log the validation errors
          if (err.response && err.response.data && err.response.data.errors) {
              console.error('Validation errors:', err.response.data.errors);
          }
          setError('Failed to update the blog.');
      }
  };
  
  

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Update Blog</h1>

            {error && <div className="text-red-600 mb-4">{error}</div>}
            {success && <div className="text-green-600 mb-4">Blog updated successfully!</div>}

            <form onSubmit={handleSubmit}>
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
                        onChange={handleDescriptionChange}
                        theme="snow"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Image (optional)</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Update Blog
                </button>
            </form>
        </div>
    );
};

export default UpdateBlog;
