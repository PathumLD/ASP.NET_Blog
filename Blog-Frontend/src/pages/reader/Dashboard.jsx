/* eslint-disable react/no-unescaped-entities */
// src/components/Dashboard.js

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token to proceed");
        } else {
          const response = await axios.get('https://localhost:7140/api/Blog/allBlogs', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Log the entire response to check the data format
          // console.log("API Response: ", response.data);

          // Ensure blogStatus exists in the response and filter blogs with BlogStatus == 1
          const filteredBlogs = response.data.filter(blog => blog.blogStatus === 1);

          // console.log("Filtered Blogs: ", filteredBlogs);  // Log filtered blogs
          setBlogs(filteredBlogs);
        }
      } catch (err) {
        setError('Failed to load blogs.'); // Fixed error handling
        console.error(err); // Log error for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Let's Blogging</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Blog Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <Link to={`/blog/${blog.blogId}`} key={blog.blogId}>
                <div className="bg-white shadow-lg rounded-lg  transition hover:shadow-xl cursor-pointer">
                  {/* Display cover image if available */}
                  {blog.imageUrl && (
                    <img
                      src={`https://localhost:7140${blog.imageUrl}`} // Ensure this URL is correct
                      alt={blog.title}
                      className="w-full h-32 object-cover rounded-t-lg "
                    />
                  )}

                  <div className='p-4'>
                    <h2 className="text-xl font-bold mb-1">{blog.title}</h2>
                    <p className="text-gray-700 mb-1">Category: {blog.category}</p>
                    <div
                      className="text-gray-700 mb-6 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    ></div>
                    <p className="text-sm text-gray-400">
                      Posted on: {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400">Author: {blog.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
