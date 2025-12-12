import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Email dan password tidak boleh kosong');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.data.access_token);
      navigate('/manage-books');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Menggunakan bg-bookit-bg (F7F7F7)
    <div className="min-h-screen bg-bookit-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 shadow-lg rounded-lg overflow-hidden">
        {/* Left Side (Logo) */}
        <div className="bg-bookit-white p-12 flex-col justify-center items-center md:items-start hidden md:flex">
          <h1 className="text-4xl font-bold text-bookit-dark">BookIT</h1>
          <p className="mt-2 text-lg text-bookit-text-medium">Buy, Add, Manage,<br />Just BookIT</p>
          <p className="mt-auto text-xs text-gray-400">© BookIT, 2025</p>
        </div>

        {/* Right Side (Form) */}
        <div className="bg-bookit-white p-12 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
            {error && (
              <div className="mb-4 text-center text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // Input style
                className="w-full px-4 py-3 border border-bookit-border rounded-md shadow-sm focus:ring-bookit-primary focus:border-bookit-primary"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-bookit-border rounded-md shadow-sm focus:ring-bookit-primary focus:border-bookit-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              // Button style
              className="w-full bg-bookit-primary text-bookit-white py-3 px-4 rounded-md font-medium hover:bg-bookit-dark disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Masuk'}
            </button>

            <hr className="my-6 border-bookit-divider" />
            
            <Link
              to="/register"
              // Button style
              className="w-full block text-center bg-bookit-white text-bookit-primary py-3 px-4 rounded-md font-medium border border-bookit-divider hover:bg-bookit-bg"
            >
              Buat Akun Baru
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;