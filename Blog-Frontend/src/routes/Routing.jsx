/* eslint-disable no-unused-vars */
import React from 'react'
import {Navigate, Routes, Route} from 'react-router-dom';
import LandingPage from '../pages/LandingPage'
import Register from '../pages/Register'
import Login from '../pages/Login';
import ReaderNavbar from '../components/ReaderNavbar';
import Dashboard from '../pages/reader/Dashboard';

const Routing = () => {

  const Layout = ({ children }) => {
    const client = localStorage.getItem('token');
  
    if (!client) {
      return <Navigate to="/login" replace />;
    }
  
    return (
      <>
        <div className="flex flex-col h-screen bg-slate-100">
          <div className="fixed top-0 z-10 w-full h-16 bg-white">
            <ReaderNavbar />
          </div>
          <div className="h-full pt-20 overflow-auto">
            <div className="container w-full mx-auto">{children}</div>
          </div>
          {/* <Footer /> */}
        </div>
      </>
    );
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<h1>Profile</h1>} />
            <Route path="/settings" element={<h1>Settings</h1>} />
            <Route path="/blogs" element={<h1>Blogs</h1>} />
          </Route>
        </>

      </Routes>
    </>
  )
}

export default Routing