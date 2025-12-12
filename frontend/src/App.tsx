import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BooksCatalog from './pages/BooksCatalog';
import ManageBooks from './pages/ManageBooks';
import BookDetail from './pages/BookDetail';
import BookDetailManage from './pages/BookDetailManage';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import Cart from './pages/Cart';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
      {/* Routes dengan Navbar & Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/catalog" element={<BooksCatalog />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/manage-books" element={<ManageBooks />} />
          <Route path="/manage-books/detail/:id" element={<BookDetailManage />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/books/edit/:id" element={<EditBook />} />
        </Route>
      </Route>

      {/* Routes tanpa Layout (misal: Login, Register) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
    </CartProvider>
  );
}

export default App;