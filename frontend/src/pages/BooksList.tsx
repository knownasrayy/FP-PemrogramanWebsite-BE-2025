// src/pages/BooksList.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

// Definisikan Tipe data Book
interface Book {
  id: string;
  title: string;
  writer: string;
  price: number;
  stock: number;
  genre: { name: string };
  // tambahin field lain
}

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // TODO: Implement state untuk:
  // const [search, setSearch] = useState('');
  // const [filterCondition, setFilterCondition] = useState('');
  // const [sort, setSort] = useState('');
  // const [page, setPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Ganti ini dengan params dinamis dari state (search, filter, sort, page)
        const response = await api.get('/books', {
          params: { page: 1, limit: 10 },
        });
        setBooks(response.data.data);
        // setTotalPages(response.data.meta.totalPages);
      } catch (err) {
        setError('Gagal memuat data buku.'); //
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []); // TODO: Tambahkan dependency (search, filter, etc.)

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-bookit-dark">Manajemen Buku</h1>
      {/* TODO: Tambahkan UI untuk Search, Filter, Sort */}
      
      {/* TODO: Tambahkan Tombol AddBook */}
      <Link to="/add-book" className="mb-4 inline-block bg-bookit-primary text-white px-4 py-2 rounded hover:bg-bookit-dark">
        Tambah Buku
      </Link>

      {/* Tampilkan data buku */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="border border-bookit-border rounded-lg p-4 shadow-sm bg-bookit-white">
              {/* TODO: Buat komponen BookCard */}
              <h2 className="text-lg font-bold text-bookit-dark">{book.title}</h2>
              <p className="text-sm text-bookit-text-medium">{book.writer}</p>
              <p className="text-sm text-gray-500">{book.genre?.name || 'No Genre'}</p>
              <p className="mt-2 font-semibold text-bookit-primary">Rp {book.price.toLocaleString()}</p>
              <p className="text-xs text-bookit-text-medium">Stok: {book.stock}</p>
              <Link to={`/books/${book.id}`} className="text-sm text-bookit-dark hover:underline mt-2 inline-block">
                Lihat Detail
              </Link>
              {/* TODO: Tambahkan tombol Hapus Buku */}
            </div>
          ))
        ) : (
          <p className="text-bookit-text-medium">Tidak ada buku ditemukan.</p> // Empty state
        )}
      </div>

      {/* TODO: Tambahkan UI Pagination */}
    </div>
  );
};

export default BooksList;