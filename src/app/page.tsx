import SlideShow from '../components/Slideshow';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Interactive Presentation
          </h1>
          <p className="text-xl text-gray-300">Navigate through different topics with visual slides</p>
        </header>
        
        <SlideShow />
      </div>
      
      <Footer />
    </main>
  );
}