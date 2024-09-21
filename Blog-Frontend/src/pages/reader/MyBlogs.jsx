import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7140/api/Blog/myBlogs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(response.data);
      } catch (err) {
        setError('Failed to load blogs.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">My Blogs</h1>


      {/* Blog Count */}
      <div className="flex justify-center gap-4 text-xl font-semibold mb-6">
        <div>You have written <span className='text-blue-700'>{blogs.length} {blogs.length === 1 ? 'blog' : 'blogs'}.</span></div>
        <div className="text-center mb-6">
        <Link to="/blogs/create" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
          New Blog
        </Link>
      </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog.blogId} className="bg-white shadow-lg rounded-lg p-4 transition hover:shadow-xl">
            <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
            <p className="text-gray-700 mb-2">Category: {blog.category}</p>
            <div
              className="text-gray-700 mb-6 line-clamp-1"
              dangerouslySetInnerHTML={{ __html: blog.description }}
            ></div>
            <p className="text-sm text-gray-400">Posted on: {new Date(blog.createdAt).toLocaleDateString()}</p>

            <div className="flex justify-end mt-4">
              {/* Edit Button */}
              <Link to={`/blog/updateBlog/${blog.blogId}`} className="text-blue-500 hover:text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7.828 18.172a4 4 0 01-1.414 1.414L4 20l1.414-2.414a4 4 0 011.414-1.414L16.5 3.5z" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBlogs;
