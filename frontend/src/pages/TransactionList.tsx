import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TransactionItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    imageUrl?: string;
  };
}

interface Transaction {
  id: string;
  totalPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: TransactionItem[];
}

interface TransactionMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const TransactionsList = () => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TransactionMeta>({
    page: 1,
    limit: 5,
    totalItems: 0,
    totalPages: 0
  });
  
  // Search and Filter States
  const [searchId, setSearchId] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'amount' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bookit-bg flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-bookit-dark mb-4">Login Diperlukan</h2>
          <p className="text-bookit-text-medium mb-6">
            Silakan login terlebih dahulu untuk melihat riwayat transaksi Anda.
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
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });
        
        // Add search parameter if searching by ID
        if (searchId.trim()) {
          params.append('search', searchId.trim());
        }
        
        // Add sort parameters
        if (sortBy === 'id') {
          params.append('sortById', sortOrder);
        } else if (sortBy === 'amount') {
          params.append('sortByAmount', sortOrder);
        } else if (sortBy === 'price') {
          params.append('sortByPrice', sortOrder);
        }
        // Default sorting by date is handled in backend
        
        const response = await api.get(`/transactions?${params.toString()}`);
        setTransactions(response.data.data || []);
        
        // Update meta information from backend response
        if (response.data.meta) {
          setMeta(response.data.meta);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setTransactions([]); // No transactions found
        } else {
          setError('Gagal memuat riwayat transaksi. Silakan coba lagi.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [currentPage, searchId, sortBy, sortOrder]);

  // Filter transactions based on search
  // Note: Search is now handled by backend, so we don't need client-side filtering
  const displayedTransactions = transactions;

  // Sort transactions 
  // Note: Sorting is now handled by backend, so we don't need client-side sorting
  const sortedTransactions = displayedTransactions;

  // Pagination
  // Note: Pagination is now handled by backend
  const totalPages = meta.totalPages;
  const currentTransactions = sortedTransactions;

  const handleSearchChange = (value: string) => {
    setSearchId(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as any);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  const handleSortOrderChange = (newSortOrder: string) => {
    setSortOrder(newSortOrder as any);
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bookit-bg flex items-center justify-center">
        <div className="text-lg text-bookit-text-medium">Memuat riwayat transaksi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bookit-bg py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bookit-dark mb-2">Riwayat Transaksi</h1>
          <p className="text-bookit-text-medium">
            Kelola dan lihat semua transaksi pembelian buku Anda
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari berdasarkan ID Transaksi
              </label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Masukkan ID transaksi..."
                className="w-full px-3 py-2 border border-bookit-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bookit-primary focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutkan berdasarkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-bookit-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bookit-primary focus:border-transparent"
              >
                <option value="date">Tanggal</option>
                <option value="id">ID Transaksi</option>
                <option value="amount">Jumlah Item</option>
                <option value="price">Total Harga</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutan
              </label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="w-full px-3 py-2 border border-bookit-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bookit-primary focus:border-transparent"
              >
                <option value="desc">Terbaru ke Terlama</option>
                <option value="asc">Terlama ke Terbaru</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-bookit-text-medium">
            Menampilkan {currentTransactions.length} dari {meta.totalItems} transaksi
            {searchId && ` untuk pencarian "${searchId}"`}
            {` (Halaman ${meta.page} dari ${meta.totalPages})`}
          </p>
        </div>

        {/* Transactions List */}
        {currentTransactions.length > 0 ? (
          <div className="space-y-4 mb-8">
            {currentTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-bookit-dark">#{transaction.id.substring(0, 8)}...</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Completed
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-bookit-text-medium">Total Harga:</span>
                        <p className="font-semibold text-bookit-primary">
                          Rp {transaction.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-bookit-text-medium">Jumlah Item:</span>
                        <p className="font-medium">{transaction.totalAmount}</p>
                      </div>
                      <div>
                        <span className="text-bookit-text-medium">Tanggal:</span>
                        <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6">
                    <Link
                      to={`/transactions/${transaction.id}`}
                      className="inline-block bg-bookit-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bookit-dark transition-colors"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-bookit-dark mb-4">
              {searchId ? 'Transaksi Tidak Ditemukan' : 'Belum Ada Transaksi'}
            </h2>
            <p className="text-bookit-text-medium mb-6">
              {searchId 
                ? `Tidak ada transaksi dengan ID "${searchId}"`
                : 'Anda belum melakukan transaksi pembelian buku.'
              }
            </p>
            {searchId ? (
              <button
                onClick={() => handleSearchChange('')}
                className="bg-gray-100 text-bookit-dark py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Reset Pencarian
              </button>
            ) : (
              <Link
                to="/catalog"
                className="inline-block bg-bookit-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
              >
                Mulai Belanja
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-bookit-primary text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;