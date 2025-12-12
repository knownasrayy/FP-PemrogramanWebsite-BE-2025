import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !email || !password) {
      setError('Semua field tidak boleh kosong');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { username, email, password });
      
      // Show success message
      setSuccessMessage('Registrasi berhasil! Silakan login.');
      setError(null);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi.');
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
            
            {successMessage && (
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-green-800 text-sm font-medium">{successMessage}</div>
                  </div>
                  <div className="text-green-700 text-xs text-center mt-1">Mengalihkan ke halaman login...</div>
                </div>
              </div>
            )}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-bookit-border rounded-md shadow-sm focus:ring-bookit-primary focus:border-bookit-primary"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-bookit-border rounded-md shadow-sm focus:ring-bookit-primary focus:border-bookit-primary"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-bookit-border rounded-md shadow-sm focus:ring-bookit-primary focus:border-bookit-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full bg-bookit-primary text-bookit-white py-3 px-4 rounded-md font-medium hover:bg-bookit-dark disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : successMessage ? 'Berhasil!' : 'Daftar'}
            </button>
            
            <p className="mt-4 text-center text-sm text-bookit-text-medium">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium text-bookit-dark hover:text-bookit-primary">
                Masuk
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;