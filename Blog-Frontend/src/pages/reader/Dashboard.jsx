/* eslint-disable react/no-unescaped-entities */
// src/components/Dashboard.js

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]); // State to store categories for dropdown
  const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
  const [authors, setAuthors] = useState([]); // State to store authors for dropdown
  const [selectedAuthor, setSelectedAuthor] = useState(''); // State for selected author
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs and categories on component mount
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

          const filteredBlogs = response.data.filter(blog => blog.blogStatus === 1);
          setBlogs(filteredBlogs);

          // Fetch unique categories from the blogs for the dropdown
          const uniqueCategories = [...new Set(response.data.map(blog => blog.category))];
          setCategories(uniqueCategories);

          const uniqueAuthors = [...new Set(response.data.map(blog => blog.author))];
          setAuthors(uniqueAuthors);
        }
      } catch (err) {
        setError('Failed to load blogs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Handle search and filtering
const handleSearch = () => {
  // Filter blogs based on search term, selected category, and selected author
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearchTerm =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true;

    // Only apply the author filter if a selected author is chosen
    const matchesAuthor = selectedAuthor ? blog.author === selectedAuthor : true;

    return matchesSearchTerm && matchesCategory && matchesAuthor;
  });

  return filteredBlogs;
};


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Let's Blogging</h1>

      {/* Filter Bars */}
      <div className="flex justify-center  mb-6">
        {/* Category Dropdown */}
        <select
          className="border border-gray-300 w-80 rounded px-4 py-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded mx-4 w-80 px-4 py-2"
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)} // Ensure this is working correctly
        >
          <option value="">All Authors</option>
          {authors.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>


        {/* Search Bar */}
        <input
          type="text"
          className="border border-gray-300 w-80 rounded px-4 py-2"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Blog Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {handleSearch().map((blog) => (
              <Link to={`/blog/${blog.blogId}`} key={blog.blogId}>
                <div className="bg-white shadow-lg rounded-lg transition h-[22rem] hover:shadow-xl cursor-pointer">
                  {/* Display cover image if available */}
                  {blog.imageUrl && (
                    <img
                      src={`https://localhost:7140${blog.imageUrl}`}
                      alt={blog.title}
                      className="w-full h-32 object-cover rounded-t-lg"
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
