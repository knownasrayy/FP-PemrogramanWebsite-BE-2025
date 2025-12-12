// src/components/Footer.tsx

// Import aset lokal
import facebookIcon from '../assets/fe-facebook.png';
import twitterIcon from '../assets/mdi-twitter.png';
import instagramIcon from '../assets/mdi-instagram.png';
import youtubeIcon from '../assets/mdi-youtube.png';

const Footer = () => {
  return (
    <footer className="bg-bookit-primary text-bookit-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">BookIT</h2>
          <p className="mt-2 text-gray-300">Buy, Add, Manage,<br />Just BookIT</p>
          <p className="mt-4 text-xs text-gray-400">© BookIT, 2025</p>
        </div>
        <div className="flex space-x-6">
          {/* Ganti ke aset lokal */}
          <a href="#" className="text-gray-400 hover:text-white">
            <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <img src={twitterIcon} alt="Twitter" className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <img src={youtubeIcon} alt="YouTube" className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;