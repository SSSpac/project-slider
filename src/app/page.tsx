import SlideShow from '../components/Slideshow';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-gray-500">
            Welcome
          </h1>
          <p className="text-xl text-gray-300">The differences between frontend and backend technologies and the importance of their coexistence</p>
        </header>
        
        <SlideShow />
      </div>
      
      <Footer />
    </main>
  );
}