import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Genre {
  id: string;
  name: string;
}

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
}

interface BookFormData {
  title: string;
  writer: string;
  publisher: string;
  price: number;
  stock: number;
  genreId: string;
  isbn?: string;
  description?: string;
  publicationYear?: number;
  condition?: string;
  imageUrl?: string;
}

const EditBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    writer: '',
    publisher: '',
    price: 0,
    stock: 0,
    genreId: '',
    isbn: '',
    description: '',
    publicationYear: undefined,
    condition: '',
    imageUrl: '',
  });

  const conditionOptions = [
    'Baru',
    'Bekas'
  ];

  useEffect(() => {
    fetchGenres();
    if (id) {
      fetchBook(id);
    }
  }, [id]);

  const fetchBook = async (bookId: string) => {
    try {
      const response = await api.get(`/books/${bookId}`);
      const book: Book = response.data.data;
      
      setFormData({
        title: book.title,
        writer: book.writer,
        publisher: book.publisher,
        price: book.price,
        stock: book.stock,
        genreId: book.genre.id,
        isbn: book.isbn || '',
        description: book.description || '',
        publicationYear: book.publicationYear,
        condition: book.condition || '',
        imageUrl: book.imageUrl || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch book details');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      console.log('Fetching genres...');
      const response = await api.get('/genre');
      console.log('Genre response:', response.data);
      setGenres(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'publicationYear' 
        ? value === '' ? (name === 'publicationYear' ? undefined : 0) : Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.title || !formData.writer || !formData.publisher || !formData.genreId) {
      setError('Title, Writer, Publisher, dan Genre wajib diisi');
      setLoading(false);
      return;
    }

    if (formData.price <= 0) {
      setError('Harga harus lebih dari 0');
      setLoading(false);
      return;
    }

    if (formData.stock < 0) {
      setError('Stok tidak boleh negatif');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for submission - kirim semua field yang diperlukan
      const submitData: any = {
        title: formData.title,
        writer: formData.writer,
        publisher: formData.publisher,
        genreId: formData.genreId,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      // Tambahkan field optional hanya jika ada nilai
      if (formData.publicationYear && formData.publicationYear > 0) {
        submitData.publicationYear = Number(formData.publicationYear);
      }
      if (formData.isbn && formData.isbn.trim()) {
        submitData.isbn = formData.isbn.trim();
      }
      if (formData.description && formData.description.trim()) {
        submitData.description = formData.description.trim();
      }
      if (formData.condition && formData.condition.trim()) {
        submitData.condition = formData.condition.trim();
      }
      if (formData.imageUrl && formData.imageUrl.trim()) {
        submitData.imageUrl = formData.imageUrl.trim();
      }

      console.log('=== FRONTEND UPDATE REQUEST ===');
      console.log('Book ID:', id);
      console.log('Submit data:', JSON.stringify(submitData, null, 2));
      console.log('================================');

      await api.put(`/books/${id}`, submitData);
      
      // Show success message
      setSuccessMessage('Buku berhasil diupdate!');
      setError(null);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/manage-books');
      }, 2000);
    } catch (err: any) {
      console.error('=== UPDATE ERROR ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('====================');
      
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengupdate buku';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/manage-books');
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading book data...</div>
      </div>
    );
  }

  if (error && fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bookit-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bookit-dark mb-2">Edit Buku</h1>
          <p className="text-bookit-text-medium">Update informasi buku</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="text-green-800 font-medium">{successMessage}</div>
                </div>
                <div className="text-green-700 text-sm mt-1">Mengalihkan ke halaman manajemen buku...</div>
              </div>
            )}

            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Buku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="Masukkan judul buku"
                  required
                />
              </div>

              {/* Writer */}
              <div>
                <label htmlFor="writer" className="block text-sm font-medium text-gray-700 mb-2">
                  Penulis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="writer"
                  name="writer"
                  value={formData.writer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="Masukkan nama penulis"
                  required
                />
              </div>

              {/* Publisher */}
              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                  Penerbit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="Masukkan nama penerbit"
                  required
                />
              </div>

              {/* Genre */}
              <div>
                <label htmlFor="genreId" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="genreId"
                  name="genreId"
                  value={formData.genreId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  required
                >
                  <option value="">Pilih Genre</option>
                  {genres.length === 0 ? (
                    <option disabled>Loading genres...</option>
                  ) : (
                    genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))
                  )}
                </select>
                {genres.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Memuat data genre...
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informasi Tambahan (Opsional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ISBN */}
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                    placeholder="978-0-123456-78-9"
                  />
                </div>

                {/* Publication Year */}
                <div>
                  <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    id="publicationYear"
                    name="publicationYear"
                    value={formData.publicationYear || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                    placeholder="2024"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Condition */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Kondisi
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  >
                    <option value="">Pilih Kondisi</option>
                    {conditionOptions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-bookit-primary focus:border-bookit-primary"
                  placeholder="Masukkan deskripsi buku..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !!successMessage}
                  className="px-6 py-2 text-sm font-medium text-white bg-bookit-primary hover:bg-bookit-dark rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menyimpan...' : successMessage ? 'Berhasil!' : 'Update Buku'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBook;