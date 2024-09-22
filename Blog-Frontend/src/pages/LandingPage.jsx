/* eslint-disable no-unused-vars */
import React from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const navigate = useNavigate()

    const handleRegister = () => {
        navigate('/register')
    }

    const handleLogin = () => {
        navigate('/login')
    }
    


  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Welcome to BlogMe</h1>
      <div className="space-x-4">
        <button onClick={handleRegister} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Register
        </button>
        <button onClick={handleLogin} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Login
        </button>
      </div>
    </div>
  )
}

export default LandingPage