"use client";
import React, { useState } from 'react';
import { Topic, Slide } from './Slideshow';

export interface SlideContentProps {
  currentTopic: Topic;
  currentSlide: Slide | undefined;
  currentSlideIndex: number;
  totalSlides: number;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  onAddSlide: () => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
}

const SlideContent: React.FC<SlideContentProps> = ({
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

  if (!currentSlide) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="bg-gray-900/80 rounded-2xl p-6 md:p-8 h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-300 mb-4">
                No Slides Available
              </h2>
              <p className="text-gray-400 mb-6">
                This topic has no slides. Add your first slide to get started.
              </p>
              <button
                onClick={onAddSlide}
                className="px-6 py-3 bg-gray-500 hover:from-cyan-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
              >
                + Add First Slide
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <div className="relative h-[500px] rounded-2xl overflow-hidden bg-black-600 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-5xl opacity-30 mb-4"></div>
              <p className="text-gray-400">No image available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/2">
        <div className="bg-gray-900/80 rounded-2xl p-6 md:p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gray-200">
                {currentSlide.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {currentTopic.name}  Slide {currentSlideIndex + 1} of {totalSlides}
              </p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 min-h-0">
            <ul className="space-y-4 pr-2">
              {currentSlide.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start group animate-fade-in">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-800 mt-2 mr-4 group-hover:scale-125 transition-transform"></div>
                  <p className="text-lg md:text-xl text-gray-200 group-hover:text-white transition-colors">
                    {bullet}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-shrink-0 mt-8">
            <div className="flex gap-2 mb-4">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index === currentSlideIndex
                      ? 'bg-cyan-500'
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
                Previous
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
                    : 'bg-gray-700'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:w-1/2">
        <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black">
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
            className="absolute top-4 right-4 bg-gray-800 hover:from-cyan-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">+</span>
            <span>Add Slide</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideContent;