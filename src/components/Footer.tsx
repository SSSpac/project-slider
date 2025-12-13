const Footer = () => {
  return (
    <footer className="bg-gray-900/80 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Presentation App
            </h3>
            <p className="text-gray-400 mt-2">Interactive slideshow with dynamic content</p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-800">
          <p>© {new Date().getFullYear()} Presentation App. All rights reserved.</p>
          <p className="mt-2">Built with Next.js, TypeScrpt, and Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;