import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { blogId } = useParams(); // Get blogId from the URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://localhost:7140/api/Blog/viewBlog/${blogId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlog(response.data); // Make sure author name is part of response.data
      } catch (err) {
        setError('Failed to load blog details.'); // Fixed error handling
        console.error(err); // Log the error for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center text-gray-500">Blog not found.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md mt-8 container mx-auto ">
      {/* Render the cover image if available */}
      {blog.imageUrl && (
        <img
          src={`https://localhost:7140${blog.imageUrl}`} // Ensure this URL is correct
          alt={blog.title}
          className="w-full h-80 object-cover rounded-t-lg mb-4"
        />
      )}
      <div className='px-12 py-6'>
        {/* Blog Title */}
          <h1 className="text-4xl text-center font-bold mb-6">{blog.title}</h1>

        {/* Blog Metadata */}
        <div className="text-gray-500 mb-4 text-center">
          <p >Category: <span className='text-stone-700 font-bold'>{blog.category}</span></p>
          <p >Posted on: <span className='text-stone-700 font-bold'>{new Date(blog.createdAt).toLocaleDateString()}</span></p>
          {/* Display author's name */}
          <p>Written by <span className='text-stone-700 font-bold'>{blog.author}</span></p>
        </div>

        {/* Blog Description */}
        <div
          className="max-w-3xl mx-auto text-gray-700 mb-6 text-justify"
          dangerouslySetInnerHTML={{ __html: blog.description }}
        ></div>
      </div>
    </div>
  );
};

export default BlogDetail;
