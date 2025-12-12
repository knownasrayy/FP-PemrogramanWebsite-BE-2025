import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

const BooksCatalog = () => {
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
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
  const [booksPerPage] = useState(12);

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

  const handleAddToCart = (book: Book) => {
    if (!isAuthenticated) {
      setError('Silakan login terlebih dahulu untuk menambahkan buku ke keranjang');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if adding 1 more item exceeds stock
    const currentInCart = getItemQuantity(book.id);
    
    if (currentInCart >= book.stock) {
      setError(`Stok tidak mencukupi. Anda sudah memiliki ${currentInCart} item "${book.title}" di keranjang. Maksimal ${book.stock} tersedia.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Add to cart
    addToCart({
      id: book.id,
      title: book.title,
      writer: book.writer,
      price: book.price,
      imageUrl: book.imageUrl,
      stock: book.stock,
    });

    setSuccessMessage(`"${book.title}" berhasil ditambahkan ke keranjang`);
    setError(null);
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bookit-dark mb-2">Katalog Buku</h1>
          <p className="text-bookit-text-medium">Temukan buku favorit Anda</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
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

        {/* Books Grid */}
        {currentBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada buku yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-64 bg-bookit-bg border border-bookit-divider flex flex-col items-center justify-center text-bookit-text-medium"><div class="text-4xl mb-2">📚</div><div class="text-sm text-center px-4 font-medium">${book.title}</div></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-bookit-bg border border-bookit-divider flex flex-col items-center justify-center text-bookit-text-medium">
                      <div className="text-4xl mb-2">📚</div>
                      <div className="text-sm text-center px-4 font-medium">{book.title}</div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium text-bookit-primary bg-bookit-primary/10 rounded">
                      {book.genre.name}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-bookit-dark mb-1 book-title-fixed">
                    {book.title}
                  </h3>
                  
                  <p className="text-sm text-bookit-text-medium mb-2">
                    by {book.writer}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-bookit-primary">
                      Rp {book.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stok: {book.stock}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/books/${book.id}`}
                      className="flex-1 bg-bookit-primary text-white text-center py-2 px-4 rounded text-sm font-medium hover:bg-bookit-dark transition-colors"
                    >
                      Detail
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(book)}
                      className="flex-1 bg-gray-100 text-bookit-dark text-center py-2 px-4 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={book.stock === 0}
                    >
                      {book.stock === 0 ? 'Habis' : 'Tambah'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

export default BooksCatalog;