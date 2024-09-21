import { Navigate, Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Register from '../pages/Register';
import Login from '../pages/Login';
import ReaderNavbar from '../components/ReaderNavbar';
import Dashboard from '../pages/reader/Dashboard';
import BlogDetails from '../pages/blog/BlogDetails';
import MyBlogs from '../pages/reader/MyBlogs';
import UpdateBlog from '../pages/blog/UpdateBlog';
import Profile from '../pages/reader/Profile';
import Settings from '../pages/reader/Settings';

// Layout component to apply the navbar and authentication check
const Layout = () => {
  const client = localStorage.getItem('token'); // Check for the token

  if (!client) {
    return <Navigate to="/login" replace />; // Redirect to login if no token found
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-24px)] bg-slate-100">
        {/* Navbar */}
        <div className="fixed top-0 z-10  w-full  bg-white shadow-md">
          <ReaderNavbar />
        </div>

        {/* Main content area */}
        <div className="h-full mt-16  overflow-auto">
          <div className="container mx-auto w-full">
            <Outlet /> {/* Render child routes here */}
          </div>
        </div>
        {/* <Footer /> Add footer if necessary */}
      </div>
    </>
  );
};

const Routing = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/blogs" element={<MyBlogs />} />
        <Route path="/blog/:blogId" element={<BlogDetails />} />
        <Route path='/blog/updateBlog/:blogId' element= {<UpdateBlog />} />
      </Route>
    </Routes>
  );
};

export default Routing;
