import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect, useRef } from 'react';

// Import aset lokal
import cartIcon from '../assets/shoping-cart.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { state } = useCart();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  const handleProtectedRoute = (route: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(route);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-bookit-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-bookit-dark">BookIT</span>
            </Link>
            
            {/* Nav Links - Moved inside the left section */}
            <div className="hidden sm:flex sm:space-x-8">
              <button
                onClick={() => handleProtectedRoute('/catalog')}
                className="text-bookit-text-medium hover:text-bookit-dark inline-flex items-center text-sm font-medium"
              >
                Katalog
              </button>
              <button
                onClick={() => handleProtectedRoute('/manage-books')}
                className="text-bookit-text-medium hover:text-bookit-dark inline-flex items-center text-sm font-medium"
              >
                Manajemen Buku
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Logged-in state
              <div className="flex items-center space-x-4">
                <Link to="/transactions" className="p-1">
                  <svg className="h-6 w-6 text-bookit-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Link>
                <Link to="/cart" className="relative p-1">
                  <img src={cartIcon} alt="Shopping Cart" className="h-6 w-6" />
                  {state.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {state.totalItems > 99 ? '99+' : state.totalItems}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-bookit-white border border-bookit-border hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-bookit-primary whitespace-nowrap">
                      {user?.email || 'user@email.com'}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-bookit-dark flex items-center justify-center">
                      <span className="text-xs text-white">
                        {(user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{user?.username || 'User'}</div>
                          <div className="text-gray-500">{user?.email}</div>
                        </div>
                        <Link
                          to="/transactions"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          📄 Transaksi
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Logged-out state
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-bookit-dark bg-bookit-white hover:bg-gray-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-bookit-dark hover:bg-bookit-dark/90 rounded"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;