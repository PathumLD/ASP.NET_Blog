import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PlusCircle, Image as ImageIcon, Bookmark, X } from 'lucide-react';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(
        'https://localhost:7140/api/Blog/createBlog',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Blog created successfully:', response.data);
      navigate('/blogs');
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Failed to create blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-indigo-900 mb-3">Create Your Story</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your thoughts, ideas and experiences with the world through your blog post
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Banner Image Section */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-500 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Blog Writing"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-2xl font-bold">Write, Read and Express Yourself</h2>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleCreateBlog} className="p-8" encType="multipart/form-data">
            {error && (
              <motion.div 
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Title Input */}
            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Blog Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter an engaging title for your blog"
              />
            </motion.div>

            {/* Category Input with Styling */}
            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Category</label>
              <div className="relative">
                <Bookmark className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="Technology, Travel, Food, etc."
                />
              </div>
            </motion.div>

            {/* Image Upload with Preview */}
            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">Featured Image</label>
              
              {!previewUrl ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-sm text-gray-500">
                      Drag and drop an image here, or
                    </p>
                    <label className="mt-2 cursor-pointer">
                      <span className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden h-64">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Description Input using ReactQuill */}
            <motion.div variants={itemVariants} className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">Blog Content</label>
              <div className="border rounded-lg">
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  theme="snow"
                  placeholder="Write your blog content here..."
                  className="h-64 bg-white"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              variants={itemVariants}
              className="text-center mt-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center mx-auto px-6 py-3 text-lg font-medium rounded-full 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} 
                text-white shadow-md transition-all duration-300`}
              >
                {loading ? (
                  'Publishing...'
                ) : (
                  <>
                    <PlusCircle className="mr-2" size={20} />
                    Publish Blog
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Tips Section */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 bg-white p-6 rounded-2xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Tips for a Great Blog Post</h3>
          <ul className="grid gap-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              Start with a compelling headline that grabs attention
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              Use high-quality images that enhance your content
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              Break up your text with subheadings for easier reading
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              End with a call-to-action to engage your readers
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateBlog;