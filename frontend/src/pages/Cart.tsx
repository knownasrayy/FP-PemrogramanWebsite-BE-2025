import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../services/api';

const Cart = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bookit-bg flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-bookit-dark mb-4">Login Diperlukan</h2>
          <p className="text-bookit-text-medium mb-6">
            Silakan login terlebih dahulu untuk melihat keranjang belanja Anda.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block bg-bookit-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
            >
              Login
            </Link>
            <Link
              to="/"
              className="block bg-gray-100 text-bookit-dark py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      setSuccessMessage('Item berhasil dihapus dari keranjang');
    } else {
      updateQuantity(id, newQuantity);
      setSuccessMessage('Jumlah item berhasil diperbarui');
    }
    
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleRemoveItem = (id: string, title: string) => {
    removeFromCart(id);
    setSuccessMessage(`"${title}" berhasil dihapus dari keranjang`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setSuccessMessage('Keranjang berhasil dikosongkan');
    setShowClearModal(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      setCheckoutError('Keranjang kosong. Tambahkan item terlebih dahulu.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Format cart items for backend API
      const items = state.items.map(item => ({
        bookId: item.id,
        quantity: item.quantity
      }));

      // Call checkout API
      const response = await api.post('/transactions', {
        items: items
      });

      if (response.data.success) {
        // Checkout berhasil
        const transactionId = response.data.data.id;
        
        // Clear cart after successful transaction
        clearCart();
        
        // Show success message
        setSuccessMessage('Transaksi berhasil! Redirecting...');
        
        // Redirect to transaction detail
        setTimeout(() => {
          navigate(`/transactions/${transactionId}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat memproses transaksi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Data transaksi tidak valid. Periksa kembali item di keranjang.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi login telah berakhir. Silakan login kembali.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Beberapa item tidak ditemukan. Periksa kembali keranjang Anda.';
      }
      
      setCheckoutError(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-bookit-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bookit-dark">Keranjang Belanja</h1>
            <p className="text-bookit-text-medium mt-2">
              {state.totalItems} item dalam keranjang
            </p>
          </div>
          
          {state.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Checkout Error Message */}
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{checkoutError}</p>
          </div>
        )}

        {state.items.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-bookit-dark mb-4">Keranjang Kosong</h2>
            <p className="text-bookit-text-medium mb-6">
              Belum ada buku dalam keranjang belanja Anda.
            </p>
            <Link
              to="/catalog"
              className="inline-block bg-bookit-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          // Cart Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    {/* Book Image */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-bookit-bg border border-bookit-divider rounded flex items-center justify-center text-bookit-text-medium text-xs">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-bookit-dark">{item.title}</h3>
                      <p className="text-sm text-bookit-text-medium">oleh {item.writer}</p>
                      <p className="text-lg font-bold text-bookit-primary mt-1">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-bookit-dark font-bold"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center text-bookit-dark font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Hapus dari keranjang"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Stock Warning */}
                  {item.quantity >= item.stock && (
                    <div className="mt-3 text-sm text-orange-600 bg-orange-50 rounded p-2">
                      ⚠️ Stok terbatas ({item.stock} tersedia)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-bold text-bookit-dark mb-4">Ringkasan Pesanan</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-bookit-text-medium">Total Item:</span>
                    <span className="font-medium">{state.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-bookit-text-medium">Subtotal:</span>
                    <span className="font-medium">Rp {state.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-bookit-divider pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-bookit-dark">Total:</span>
                      <span className="text-lg font-bold text-bookit-primary">
                        Rp {state.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || state.items.length === 0}
                    className="w-full bg-bookit-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-bookit-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memproses Checkout...</span>
                      </span>
                    ) : (
                      `Checkout (${state.totalItems} item)`
                    )}
                  </button>
                  <Link
                    to="/catalog"
                    className="block text-center text-bookit-primary hover:text-bookit-dark font-medium py-2"
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin mengosongkan keranjang? Semua item akan dihapus.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;