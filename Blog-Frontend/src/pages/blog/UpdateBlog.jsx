import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';

const UpdateBlog = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [blog, setBlog] = useState({
        title: '',
        category: '',
        description: '',
        blogStatus: 1,
        image: null,
        imageUrl: null // To store the existing image URL
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Categories for the dropdown
    const categories = [
        'Technology', 'Travel', 'Food', 'Lifestyle', 
        'Health', 'Business', 'Education', 'Fashion',
        'Sports', 'Entertainment', 'Science', 'Arts'
    ];

    // Quill editor modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    // Fetch the blog details when the component loads
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
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
                    image: null,
                    imageUrl: blogData.imageUrl ? `https://localhost:7140${blogData.imageUrl}` : null
                });

                // Set image preview if there's an existing image
                if (blogData.imageUrl) {
                    setImagePreview(`https://localhost:7140${blogData.imageUrl}`);
                }
            } catch (err) {
                console.error('Error fetching blog:', err.response?.data || err.message);
                setError('Error fetching blog data. Please try again later.');
            } finally {
                setLoading(false);
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
        const file = e.target.files[0];
        if (file) {
            setBlog((prevBlog) => ({ ...prevBlog, image: file }));
            
            // Create a preview URL for the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle drag events for image upload
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setBlog((prevBlog) => ({ ...prevBlog, image: file }));
            
            // Create a preview URL for the dropped image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSaving(true);

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
            
            // Show success notification before navigating
            setTimeout(() => {
                navigate(`/blogs`); // Redirect after successful update
            }, 1500);
        } catch (err) {
            console.error('Failed to update the blog:', err.response?.data || err.message);
            // Log the validation errors
            if (err.response && err.response.data && err.response.data.errors) {
                console.error('Validation errors:', err.response.data.errors);
            }
            setError('Failed to update the blog. Please check your inputs and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle cancel button click
    const handleCancel = () => {
        navigate('/blogs');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading your blog...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-gray-50 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                {/* Header */}
                <motion.div 
                    className="mb-10 text-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Update Your Blog</h1>
                    <p className="mt-2 text-gray-600">Polish your content and make it shine</p>
                </motion.div>

                {/* Notification area */}
                {error && (
                    <motion.div 
                        className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex">
                            <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{error}</p>
                        </div>
                    </motion.div>
                )}
                
                {success && (
                    <motion.div 
                        className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex">
                            <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p>Blog updated successfully! Redirecting...</p>
                        </div>
                    </motion.div>
                )}

                {/* Main form */}
                <motion.div 
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="md:flex">
                        {/* Left side - Image upload */}
                        <div className="md:w-1/3 bg-gray-50 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Blog Cover Image</h2>
                            
                            {/* Image drop zone */}
                            <div
                                className={`mt-2 relative border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {imagePreview ? (
                                    <div className="w-full h-full relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Blog cover preview" 
                                            className="w-full h-full object-cover rounded"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                                Replace Image
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-center">Drag and drop an image here, or click to select</p>
                                        <p className="text-gray-400 text-sm mt-1 text-center">PNG, JPG, GIF up to 10MB</p>
                                    </>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            
                            {/* Tips */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Tips for a great blog post:</h3>
                                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                                    <li>Use a high-quality, relevant cover image</li>
                                    <li>Choose a clear, compelling title</li>
                                    <li>Organize content with headings and lists</li>
                                    <li>Include references and examples</li>
                                    <li>Check spelling and grammar before publishing</li>
                                </ul>
                            </div>
                        </div>
                        
                        {/* Right side - Form fields */}
                        <div className="md:w-2/3 p-6">
                            <form onSubmit={handleSubmit}>
                                {/* Title field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                                        Blog Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={blog.title}
                                        onChange={handleChange}
                                        placeholder="Enter a captivating title..."
                                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        required
                                    />
                                </div>

                                {/* Category field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={blog.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                        {/* Add custom category option if the current category isn't in the list */}
                                        {blog.category && !categories.includes(blog.category) && (
                                            <option value={blog.category}>{blog.category}</option>
                                        )}
                                    </select>
                                </div>

                                {/* Description field (ReactQuill editor) */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <div className="bg-white border rounded-lg">
                                        <ReactQuill
                                            value={blog.description}
                                            onChange={handleDescriptionChange}
                                            modules={modules}
                                            theme="snow"
                                            className="h-64"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Use the toolbar to format your content and add media.
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-end space-x-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                                            isSaving ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : 'Update Blog'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
                
                {/* Inspiration section */}
                <motion.div 
                    className="mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Need inspiration?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Craft a compelling story",
                                desc: "Engage readers with a narrative that resonates",
                                img: "https://images.unsplash.com/photo-1512045482940-f37f5216f639?q=80&w=500"
                            },
                            {
                                title: "Use engaging visuals",
                                desc: "Enhance your content with relevant images",
                                img: "https://images.unsplash.com/photo-1554290712-e640351074bd?q=80&w=500"
                            },
                            {
                                title: "Share authentic insights",
                                desc: "Connect with readers through genuine perspective",
                                img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=500"
                            }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img src={item.img} alt={item.title} className="w-full h-32 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default UpdateBlog;