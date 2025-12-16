const Footer = () => {
  return (
    <footer className="bg-gray-900/80 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
        </div>
        
        <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-800">
          <p>© {new Date().getFullYear()} Futuregames 2025</p>
          <p className="mt-2"></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;