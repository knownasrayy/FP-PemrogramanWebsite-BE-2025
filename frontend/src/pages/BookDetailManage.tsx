import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const BookDetailManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            onClick={() => navigate('/manage-books')}
            className="text-bookit-primary hover:text-bookit-dark"
          >
            ← Kembali ke Manajemen Buku
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
            <Link to="/manage-books" className="text-bookit-primary hover:text-bookit-dark">
              Manajemen Buku
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 truncate max-w-xs">
              {book.title}
            </span>
          </div>
        </nav>

        {/* Header with Edit Button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bookit-dark mb-2">Detail Buku</h1>
            <p className="text-bookit-text-medium">Informasi lengkap buku</p>
          </div>
          <Link
            to={`/books/edit/${book.id}`}
            className="bg-bookit-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-bookit-dark transition-colors"
          >
            ✏️ Edit Buku
          </Link>
        </div>

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

              {/* Management Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Aksi Manajemen</h3>
                <div className="flex space-x-3">
                  <Link
                    to={`/books/edit/${book.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Edit Buku
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
                        // Handle delete logic here
                        console.log('Delete book:', book.id);
                      }
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Hapus Buku
                  </button>
                </div>
              </div>
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
                  <div className="flex">
                    <span className="w-32 text-gray-600">Dibuat</span>
                    <span className="text-gray-900">
                      {new Date(book.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Diupdate</span>
                    <span className="text-gray-900">
                      {new Date(book.updatedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
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
            onClick={() => navigate('/manage-books')}
            className="text-bookit-primary hover:text-bookit-dark font-medium"
          >
            ← Kembali ke Manajemen Buku
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailManage;