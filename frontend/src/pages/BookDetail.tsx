import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, getItemQuantity } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }
  }, [id]);

  const fetchBook = async (bookId: string) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      setBook(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setError('Silakan login terlebih dahulu untuk menambahkan buku ke keranjang');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!book) return;

    // Check if quantity doesn't exceed stock
    const currentInCart = getItemQuantity(book.id);
    const totalQuantity = currentInCart + quantity;
    
    if (totalQuantity > book.stock) {
      setError(`Stok tidak mencukupi. Anda sudah memiliki ${currentInCart} item di keranjang. Maksimal ${book.stock} tersedia.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Add to cart
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: book.id,
        title: book.title,
        writer: book.writer,
        price: book.price,
        imageUrl: book.imageUrl,
        stock: book.stock,
      });
    }

    setSuccessMessage(`Berhasil menambahkan ${quantity} buku "${book.title}" ke keranjang`);
    setError(null);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    // Reset quantity to 1
    setQuantity(1);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Book not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="text-bookit-primary hover:text-bookit-dark"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bookit-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-bookit-primary hover:text-bookit-dark">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/catalog" className="text-bookit-primary hover:text-bookit-dark">
              Katalog
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate max-w-xs">
              {book.title}
            </span>
          </div>
        </nav>

        {/* Success Notification */}
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Book Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-96 bg-bookit-bg border border-bookit-divider rounded-lg flex flex-col items-center justify-center text-bookit-text-medium"><div class="text-6xl mb-4">📚</div><div class="text-lg text-center px-4 font-medium">${book.title}</div></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-96 bg-bookit-bg border border-bookit-divider rounded-lg flex flex-col items-center justify-center text-bookit-text-medium">
                    <div className="text-6xl mb-4">📚</div>
                    <div className="text-lg text-center px-4 font-medium">{book.title}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-6">
              {/* Genre Badge */}
              <div>
                <span className="inline-block px-3 py-1 text-sm font-medium text-bookit-primary bg-bookit-primary/10 rounded-full">
                  {book.genre.name}
                </span>
              </div>

              {/* Title and Author */}
              <div>
                <h1 className="text-3xl font-bold text-bookit-dark mb-2">
                  {book.title}
                </h1>
                <p className="text-lg text-bookit-text-medium">
                  oleh <span className="font-medium">{book.writer}</span>
                </p>
              </div>

              {/* Price */}
              <div>
                <span className="text-3xl font-bold text-bookit-primary">
                  Rp {book.price.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Stock and Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 block">Stok</span>
                  <span className={`text-lg font-medium ${
                    book.stock === 0 ? 'text-red-600' : 
                    book.stock < 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {book.stock === 0 ? 'Habis' : `${book.stock} unit`}
                  </span>
                </div>
                {book.condition && (
                  <div>
                    <span className="text-sm text-gray-600 block">Kondisi</span>
                    <span className="text-lg font-medium text-gray-900">
                      {book.condition}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector and Buttons */}
              {book.stock > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-bookit-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
                    >
                      Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              )}

              {book.stock === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    Maaf, buku ini sedang tidak tersedia.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Book Information */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-bookit-dark mb-6">
              Informasi Buku
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detail
                </h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="w-32 text-gray-600">Penulis</span>
                    <span className="text-gray-900">{book.writer}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Penerbit</span>
                    <span className="text-gray-900">{book.publisher}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Genre</span>
                    <span className="text-gray-900">{book.genre.name}</span>
                  </div>
                  {book.isbn && (
                    <div className="flex">
                      <span className="w-32 text-gray-600">ISBN</span>
                      <span className="text-gray-900">{book.isbn}</span>
                    </div>
                  )}
                  {book.publicationYear && (
                    <div className="flex">
                      <span className="w-32 text-gray-600">Tahun Terbit</span>
                      <span className="text-gray-900">{book.publicationYear}</span>
                    </div>
                  )}
                  {book.condition && (
                    <div className="flex">
                      <span className="w-32 text-gray-600">Kondisi</span>
                      <span className="text-gray-900">{book.condition}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Deskripsi
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-bookit-primary hover:text-bookit-dark font-medium"
          >
            ← Kembali ke Daftar Buku
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;