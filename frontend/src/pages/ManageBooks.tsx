import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Book {
  id: string;
  title: string;
  writer: string;
  publisher: string;
  price: number;
  stock: number;
  isbn?: string;
  description?: string;
  publicationYear?: number;
  condition?: string;
  imageUrl?: string;
  genre: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Genre {
  id: string;
  name: string;
}

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(10);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, bookId: string, title: string}>({
    show: false,
    bookId: '',
    title: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await api.get('/genre');
      setGenres(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter(book => book.id !== bookId));
      setDeleteConfirm({show: false, bookId: '', title: ''});
      
      // Show success message
      setSuccessMessage('Buku berhasil dihapus');
      setError(null);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus buku');
      setSuccessMessage(null);
    }
  };

  // Filter and sort books
  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.writer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === '' || book.genre.id === selectedGenre;
      const matchesCondition = selectedCondition === '' || book.condition === selectedCondition;
      
      return matchesSearch && matchesGenre && matchesCondition;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'publicationYear') {
        comparison = (a.publicationYear || 0) - (b.publicationYear || 0);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredAndSortedBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bookit-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bookit-dark mb-2">Manajemen Buku</h1>
            <p className="text-bookit-text-medium">Kelola koleksi buku Anda</p>
          </div>
          <Link
            to="/books/add"
            className="bg-bookit-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
          >
            + Tambah Buku
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-green-800 font-medium">{successMessage}</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Buku
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau penulis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
              />
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
              >
                <option value="">Semua Genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kondisi
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
              >
                <option value="">Semua Kondisi</option>
                <option value="Baru">Baru</option>
                <option value="Bekas">Bekas</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutkan
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                >
                  <option value="title">Judul</option>
                  <option value="publicationYear">Tahun Terbit</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-bookit-text-medium">
            Menampilkan {filteredAndSortedBooks.length} buku
          </p>
        </div>

        {/* Books Table */}
        {currentBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Tidak ada buku yang ditemukan</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buku
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penulis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-9">
                            {book.imageUrl ? (
                              <img
                                className="h-12 w-9 object-cover rounded"
                                src={book.imageUrl}
                                alt={book.title}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `<div class="h-12 w-9 bg-bookit-bg border border-bookit-divider rounded flex items-center justify-center text-bookit-text-medium text-xs">📚</div>`;
                                }}
                              />
                            ) : (
                              <div className="h-12 w-9 bg-bookit-bg border border-bookit-divider rounded flex items-center justify-center text-bookit-text-medium text-xs">
                                📚
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {book.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {book.publisher}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {book.writer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-bookit-primary/10 text-bookit-primary rounded">
                          {book.genre.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        Rp {book.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          book.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : book.stock < 5 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {book.stock} unit
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <Link
                            to={`/manage-books/detail/${book.id}`}
                            className="text-bookit-primary hover:text-bookit-dark text-sm bg-gray-100 px-3 py-1 rounded"
                          >
                            Detail
                          </Link>
                          <Link
                            to={`/books/edit/${book.id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm bg-blue-100 px-3 py-1 rounded"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({show: true, bookId: book.id, title: book.title})}
                            className="text-red-600 hover:text-red-900 text-sm bg-red-100 px-3 py-1 rounded"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus buku "<strong>{deleteConfirm.title}</strong>"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({show: false, bookId: '', title: ''})}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteBook(deleteConfirm.bookId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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

export default ManageBooks;