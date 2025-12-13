import { Topic, Slide } from './Slideshow';
import { useState } from 'react';

interface SlideContentProps {
  currentTopic: Topic;
  currentSlide: Slide;
  currentSlideIndex: number;
  totalSlides: number;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  onAddSlide: () => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
}

const SlideContent = ({
  currentTopic,
  currentSlide,
  currentSlideIndex,
  totalSlides,
  nextSlide,
  prevSlide,
  goToSlide,
  onAddSlide,
  onImageUpload
}: SlideContentProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUploadClick = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(true);
        try {
          const imageUrl = await onImageUpload(file);
          if (imageUrl) {
            console.log('Image uploaded successfully:', imageUrl);
          }
        } catch (error) {
          console.error('Upload failed:', error);
        } finally {
          setUploading(false);
        }
      }
    };
    
    input.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/2">
        <div className="bg-gray-900/80 rounded-2xl p-6 md:p-8 h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                {currentSlide.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {currentTopic.name} • Slide {currentSlideIndex + 1} of {totalSlides}
              </p>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            {currentSlide.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start group animate-fade-in">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 mt-2 mr-4 group-hover:scale-125 transition-transform"></div>
                <p className="text-lg md:text-xl text-gray-200 group-hover:text-white transition-colors">
                  {bullet}
                </p>
              </li>
            ))}
          </ul>
          
          <div className="mt-8">
            <div className="flex gap-2 mb-4">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index === currentSlideIndex
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentSlideIndex === 0
                    ? 'opacity-50 cursor-not-allowed bg-gray-800'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                ← Previous
              </button>
              
              <div className="text-gray-400 text-sm">
                {currentSlideIndex + 1} / {totalSlides}
              </div>
              
              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentSlideIndex === totalSlides - 1
                    ? 'opacity-50 cursor-not-allowed bg-gray-800'
                    : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:w-1/2">
        <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${currentSlide.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold text-white">Slide Image</h3>
                <p className="text-gray-300">Click to upload new image</p>
              </div>
              <button
                onClick={handleImageUploadClick}
                disabled={uploading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all border border-white/30"
              >
                {uploading ? 'Uploading...' : 'Change Image'}
              </button>
            </div>
          </div>
          
          <button
            onClick={onAddSlide}
            className="absolute top-4 right-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">+</span>
            <span>Add Slide</span>
          </button>

          <button
            onClick={() => {
              const newTitle = prompt('Edit slide title:', currentSlide.title);
              if (newTitle && newTitle.trim() && newTitle !== currentSlide.title) {
                console.log('Update title to:', newTitle);
                alert('Update title functionality to be implemented');
              }
            }}
            className="absolute top-4 left-4 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all border border-gray-700"
          >
            Edit Title
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideContent;