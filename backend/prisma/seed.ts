import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Data genre yang ringkas dan sesuai
const genreData = [
  { name: 'Fiksi' },
  { name: 'Non-Fiksi' },
  { name: 'Komputer' },
  { name: 'Desain' },
  { name: 'Sains' },
  { name: 'Sejarah' },
];

// Data user untuk uji coba login
const userData = [
  { 
    email: 'user@test.com', 
    username: 'p19', 
    password: 'password123' 
  }
];

async function main() {
  console.log('Start seeding...');

  // --- 1. Seed Genres ---
  const genres = [];
  for (const genre of genreData) {
    const createdGenre = await prisma.genre.upsert({
      where: { name: genre.name },
      update: {},
      create: genre,
    });
    genres.push(createdGenre);
  }
  console.log(`Seeded ${genres.length} genres.`);

  // --- 2. Seed Users ---
  for (const user of userData) {
    // Pastikan library 'bcrypt' sudah terinstal
    const hashedPassword = await bcrypt.hash(user.password, 10); 
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword },
      create: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
      },
    });
  }
  console.log(`Seeded ${userData.length} users.`);


  // --- 3. Seed Books ---
  const fiksiGenre = genres.find(g => g.name === 'Fiksi');
  const nonfiksiGenre = genres.find(g => g.name === 'Non-Fiksi'); // Menggunakan Non-Fiksi yang baru
  const komputerGenre = genres.find(g => g.name === 'Komputer');

  if (fiksiGenre && nonfiksiGenre && komputerGenre) {
    const bookData = [
      {
        title: 'Filosofi Teras',
        writer: 'Henry Manampiring',
        publisher: 'Kompas Gramedia',
        price: 95000.00,
        stock: 45,
        publicationYear: 2018,
        condition: 'Baru',
        imageUrl: 'https://cdn.gramedia.com/uploads/items/9786024248866_Filosofi-Teras-New.jpg',
        genreId: nonfiksiGenre.id,
      },
      {
        title: 'Deep Work', // Judul ringkas
        writer: 'Cal Newport',
        publisher: 'Grand Central Publishing',
        price: 130000.00,
        stock: 30,
        publicationYear: 2016,
        condition: 'Baru',
        imageUrl: 'https://m.media-amazon.com/images/I/41KxPqLh34L.jpg',
        genreId: nonfiksiGenre.id,
      },
      {
        title: 'Clean Code', // Judul ringkas
        writer: 'Robert C. Martin',
        publisher: 'Pearson Education',
        price: 250000.00,
        stock: 20,
        publicationYear: 2008,
        condition: 'Bekas',
        imageUrl: 'https://m.media-amazon.com/images/I/51E2055ZGUL._SL1500_.jpg',
        genreId: komputerGenre.id,
      },
      {
        title: 'Atomic Habits',
        writer: 'James Clear',
        publisher: 'Penguin',
        price: 110000.00,
        stock: 55,
        publicationYear: 2018,
        condition: 'Baru',
        imageUrl: 'https://m.media-amazon.com/images/I/51-uspgjGBL.jpg',
        genreId: nonfiksiGenre.id,
      },
      {
        title: 'Dilan 1990',
        writer: 'Pidi Baiq',
        publisher: 'Pastel Books',
        price: 85000.00,
        stock: 60,
        publicationYear: 2014,
        condition: 'Bekas',
        imageUrl: 'https://cdn.gramedia.com/uploads/items/9786027870413_DILAN-1990-ORIGINAL.jpg',
        genreId: fiksiGenre.id,
      },
    ];

    for (const book of bookData) {
      await prisma.book.upsert({
        where: { title: book.title }, 
        update: {},
        create: book,
      });
    }
    console.log(`Seeded ${bookData.length} books.`);
  } else {
    console.warn('Gagal menemukan Genre ID yang diperlukan. Pastikan genre "Fiksi", "Non-Fiksi", dan "Komputer" berhasil dibuat.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });