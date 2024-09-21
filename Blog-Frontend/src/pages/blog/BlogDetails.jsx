// src/pages/BlogDetail.js

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
        setError('Failed to load blog details.', err);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center font-bold mb-6">{blog.title}</h1>
      <div className="text-gray-500 mb-4">
        <p>Category: {blog.category}</p>
        <p>Posted on: {new Date(blog.createdAt).toLocaleDateString()}</p>
        {/* Display author's name */}
        <p>Author: {blog.author}</p>
      </div>
      <div className="text-gray-700 mb-6">{blog.description}</div>
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        
        <p className="text-lg">{blog.content}</p>
      </div> */}
    </div>
  );
};

export default BlogDetail;
