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
          setBlogs(response.data);
        }
      } catch (err) {
        setError('Failed to load blogs.', err);
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
                <div className="bg-white shadow-lg rounded-lg p-4 transition hover:shadow-xl cursor-pointer">
                  <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                  <p className="text-gray-700 mb-2">Category: {blog.category}</p>
                  <div
                    className="text-gray-700 mb-6 line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: blog.description }}
                  ></div>
                  <p className="text-sm text-gray-400">
                    Posted on: {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                  <p className='text-sm text-gray-400'>Author: {blog.author}</p>
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
