// Import aset lokal
import heroImage from '../assets/img.png'; // Nama filenya 'img.png'
import userIcon from '../assets/icon-user.png';

// Komponen Testimonial Card (internal)
const TestimonialCard = ({ quote, author, year }: { quote: string, author: string, year: string }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-bookit-primary/65">
         {/* Ganti ke aset lokal */}
         <img src={userIcon} alt="User" className="h-12 w-12 opacity-50" />
      </span>
    </div>
    <div>
      <p className="text-lg text-bookit-dark">"{quote}"</p>
      <p className="mt-2 text-sm font-medium text-bookit-dark">{author}</p>
      <p className="text-sm text-bookit-text-medium">Pengguna BookIT sejak {year}</p>
    </div>
  </div>
);

const Home = () => {
  const testimonials = [
    { quote: "BookIT membantu saya dalam manajemen perpustakaan pribadi saya, mulai dari cek koleksi hingga pembelian buku baru untuk koleksi saya", author: "Rayhan", year: "2024" },
    { quote: "BookIT merupakan salah satu aplikasi manajemen buku terbaik yang pernah saya gunakan", author: "Rayka", year: "2022" },
    { quote: "Semudah mengingat namanya, BookIT mudah digunakan oleh saya sebagai orang yang awam dalam manajemen buku", author: "Daffan", year: "2023" }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="bg-bookit-bg">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-bookit-dark sm:text-5xl">
              Solusi Manajemen dan Pembelian Buku Terintegrasi
            </h1>
            <p className="mt-4 text-xl text-bookit-text-medium">
              Dari wishlist jadi koleksi. Temukan, kelola, dan beli buku favorit
              seamlessly dalam satu platform
            </p>
          </div>
          <div className="w-full">
            {/* Ganti ke aset lokal */}
            <img 
              src={heroImage} 
              alt="Book collage" 
              className="rounded-lg" 
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-bookit-white max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center text-bookit-dark mb-12">
          Apa Kata Mereka Soal BookIT?
        </h2>
        <div className="space-y-12 max-w-3xl mx-auto">
          {testimonials.map((testi) => (
            <TestimonialCard key={testi.author} {...testi} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;