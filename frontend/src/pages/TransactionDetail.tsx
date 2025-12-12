import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TransactionItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    writer: string;
    publisher: string;
    imageUrl?: string;
    price: number;
  };
}

interface TransactionDetail {
  id: string;
  totalPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  items: TransactionItem[];
}

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bookit-bg flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-bookit-dark mb-4">Login Diperlukan</h2>
          <p className="text-bookit-text-medium mb-6">
            Silakan login terlebih dahulu untuk melihat detail transaksi.
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

  useEffect(() => {
    if (id) {
      fetchTransactionDetail(id);
    }
  }, [id]);

  const fetchTransactionDetail = async (transactionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      setTransaction(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Transaksi tidak ditemukan.');
      } else if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat transaksi ini.');
      } else {
        setError('Gagal memuat detail transaksi. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    // All transactions are completed in our system
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bookit-bg flex items-center justify-center">
        <div className="text-lg text-bookit-text-medium">Memuat detail transaksi...</div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-bookit-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-bookit-dark mb-4">Terjadi Kesalahan</h2>
            <p className="text-bookit-text-medium mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                to="/transactions"
                className="inline-block bg-bookit-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
              >
                Kembali ke Riwayat Transaksi
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bookit-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-bookit-text-medium hover:text-bookit-primary">
                  Beranda
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-bookit-text-medium">/</span>
                  <Link to="/transactions" className="text-bookit-text-medium hover:text-bookit-primary">
                    Riwayat Transaksi
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-bookit-text-medium">/</span>
                  <span className="text-bookit-dark font-medium">Detail Transaksi</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-bookit-dark mb-2">
                Detail Transaksi
              </h1>
              <p className="text-bookit-text-medium">ID: #{transaction.id}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor()}`}>
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-bookit-dark mb-4">Ringkasan Transaksi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-bookit-bg rounded-lg">
              <div className="text-2xl font-bold text-bookit-primary">
                {transaction.totalAmount}
              </div>
              <div className="text-sm text-bookit-text-medium">Total Item</div>
            </div>
            <div className="text-center p-4 bg-bookit-bg rounded-lg">
              <div className="text-2xl font-bold text-bookit-primary">
                Rp {transaction.totalPrice.toLocaleString()}
              </div>
              <div className="text-sm text-bookit-text-medium">Total Pembayaran</div>
            </div>
            <div className="text-center p-4 bg-bookit-bg rounded-lg">
              <div className="text-lg font-bold text-bookit-dark">
                {formatDate(transaction.createdAt)}
              </div>
              <div className="text-sm text-bookit-text-medium">Tanggal Transaksi</div>
            </div>
          </div>
        </div>

        {/* Transaction Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-bookit-dark mb-4">Item yang Dibeli</h2>
          <div className="space-y-4">
            {transaction.items && transaction.items.length > 0 ? (
              transaction.items.map((item) => (
                <div key={item.id} className="border border-bookit-divider rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    {/* Book Image */}
                    <div className="flex-shrink-0">
                      {item.book.imageUrl ? (
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
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
                      <h3 className="font-semibold text-bookit-dark">{item.book.title}</h3>
                      <p className="text-sm text-bookit-text-medium">oleh {item.book.writer}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-bookit-text-medium">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm text-bookit-text-medium">
                          @ Rp {item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-bookit-primary">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-bookit-text-medium">Tidak ada item dalam transaksi ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="font-medium text-bookit-dark">Butuh bantuan?</h3>
              <p className="text-sm text-bookit-text-medium">
                Hubungi customer service kami jika ada pertanyaan tentang transaksi ini.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/transactions"
                className="bg-gray-100 text-bookit-dark py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Kembali ke Riwayat
              </Link>
              <button
                onClick={() => window.print()}
                className="bg-bookit-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
              >
                Cetak Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;