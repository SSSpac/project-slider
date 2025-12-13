'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import SlideContent from './Sidecontent';
import { slidesService } from './services/slidesService';

export type Slide = {
  id: number;
  title: string;
  bullets: string[];
  imageUrl: string;
};

export type Topic = {
  id: number;
  name: string;
  slides: Slide[];
};

const SlideShow = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await slidesService.testConnection();
        setSupabaseConnected(connected);
        console.log('Supabase connection test:', connected ? ' Connected' : ' Failed');
      } catch (err) {
        console.error('Connection test error:', err);
        setSupabaseConnected(false);
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        console.log('Loading topics from Supabase...');
        
        const dbTopics = await slidesService.fetchTopicsWithSlides();
        console.log('Topics loaded from Supabase:', dbTopics);
        
        if (dbTopics.length === 0) {
          setError('No topics found in database. Please add topics and slides in Supabase.');
          setTopics([]);
          return;
        }
        
        const transformedTopics: Topic[] = dbTopics.map(topic => {
          console.log('Processing topic:', topic.name, 'with', topic.slides?.length, 'slides');
          return {
            id: topic.id,
            name: topic.name,
            slides: topic.slides?.map(slide => ({
              id: slide.id,
              title: slide.title,
              bullets: slide.bullet_points
                ?.sort((a: any, b: any) => a.order_index - b.order_index)
                .map((bp: any) => bp.content) || [],
              imageUrl: slide.image_url || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&h=600&fit=crop`
            })) || []
          };
        });
        
        console.log('Transformed topics:', transformedTopics);
        setTopics(transformedTopics);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load topics:', err);
        const errorMsg = err.message || 'Failed to load presentation data. Please check your Supabase connection and database structure.';
        setError(errorMsg);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [currentTopicIndex]);

  const currentTopic = topics[currentTopicIndex] || { slides: [] };
  const currentSlide = currentTopic.slides[currentSlideIndex];

  const nextSlide = () => {
    if (currentTopic.slides.length === 0) return;
    
    if (currentSlideIndex < currentTopic.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      setCurrentSlideIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentTopic.slides.length === 0) return;
    
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else {
      setCurrentSlideIndex(currentTopic.slides.length - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < currentTopic.slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleAddSlide = async () => {
    try {
      if (!currentTopic || !currentTopic.id) {
        alert('Please select a topic first');
        return;
      }

      const title = prompt('Enter slide title:', `New Slide ${currentTopic.slides.length + 1}`);
      if (!title) {
        alert('Slide title is required');
        return;
      }

      if (!title.trim()) {
        alert('Slide title cannot be empty');
        return;
      }

      const bulletsInput = prompt('Enter bullet points (separate with semicolons):', 'First point;Second point;Third point');
      const bullets = bulletsInput 
        ? bulletsInput.split(';').map(b => b.trim()).filter(b => b)
        : ['Add your content here...'];

      setLoading(true);
      console.log('Adding slide with data:', {
        topicId: currentTopic.id,
        title,
        bullets
      });
      
      const newSlide = await slidesService.addSlide(currentTopic.id, title, undefined, bullets);
      
      if (!newSlide) {
        throw new Error('Failed to create slide - no data returned from Supabase');
      }

      console.log('New slide created:', newSlide);
      
      const dbTopics = await slidesService.fetchTopicsWithSlides();
      const transformedTopics: Topic[] = dbTopics.map(topic => ({
        id: topic.id,
        name: topic.name,
        slides: topic.slides?.map(slide => ({
          id: slide.id,
          title: slide.title,
          bullets: slide.bullet_points
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((bp: any) => bp.content) || [],
          imageUrl: slide.image_url || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&h=600&fit=crop`
        })) || []
      }));
      
      setTopics(transformedTopics);
      setLoading(false);
      
      const newSlideIndex = transformedTopics[currentTopicIndex].slides.length - 1;
      setCurrentSlideIndex(newSlideIndex);
      
      alert(' Slide added successfully!');
      
    } catch (error: any) {
      setLoading(false);
      console.error('Error adding slide:', error);
      
      let errorMessage = ' Failed to add slide. ';
      
      if (error.message) {
        errorMessage += `Error: ${error.message}`;
      }
      
      if (error.code === '23503') {
        errorMessage += '\n\nMake sure the topic exists in your database.';
      } else if (error.code === '42501') {
        errorMessage += '\n\nPermission denied. Check your Supabase RLS policies.';
      } else if (error.code === '42P01') {
        errorMessage += '\n\nTable does not exist. Please run the SQL setup in Supabase.';
      } else if (error.code === '23505') {
        errorMessage += '\n\nDuplicate entry. A slide with this title might already exist.';
      }
      
      alert(errorMessage);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (!currentSlide) {
        alert('Please select a slide first');
        return null;
      }

      console.log('Uploading image:', file.name, file.type, file.size);
      
      const imageUrl = await slidesService.uploadImage(file);
      
      const updated = await slidesService.updateSlide(currentSlide.id, { image_url: imageUrl });
      
      if (!updated) {
        throw new Error('Failed to update slide with new image URL');
      }

      const updatedTopics = [...topics];
      const slideToUpdate = updatedTopics[currentTopicIndex].slides[currentSlideIndex];
      slideToUpdate.imageUrl = imageUrl;
      setTopics(updatedTopics);
      
      alert(' Image uploaded successfully!');
      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      let errorMessage = ' Failed to upload image. ';
      if (error.message) errorMessage += error.message;
      
      if (error.message?.includes('storage')) {
        errorMessage += '\n\nMake sure the "slides-images" bucket exists in Supabase Storage.';
      }
      
      alert(errorMessage);
      return null;
    }
  };

  const handleAddTopic = async () => {
    try {
      const topicName = prompt('Enter new topic name:');
      if (!topicName) return;

      if (!topicName.trim()) {
        alert('Topic name cannot be empty');
        return;
      }

      setLoading(true);
      console.log('Adding topic:', topicName);
      
      const newTopic = await slidesService.addTopic(topicName);
      
      if (!newTopic) {
        throw new Error('Failed to create topic');
      }

      const dbTopics = await slidesService.fetchTopicsWithSlides();
      const transformedTopics: Topic[] = dbTopics.map(topic => ({
        id: topic.id,
        name: topic.name,
        slides: topic.slides?.map(slide => ({
          id: slide.id,
          title: slide.title,
          bullets: slide.bullet_points
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((bp: any) => bp.content) || [],
          imageUrl: slide.image_url || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&h=600&fit=crop`
        })) || []
      }));
      
      setTopics(transformedTopics);
      setCurrentTopicIndex(transformedTopics.length - 1); 
      setLoading(false);
      
      alert(' Topic added successfully!');
      
    } catch (error: any) {
      setLoading(false);
      console.error('Error adding topic:', error);
      alert(` Failed to add topic: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteSlide = async () => {
    if (!currentSlide || !window.confirm('Are you sure you want to delete this slide?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await slidesService.deleteSlide(currentSlide.id);
      
      if (success) {
        const dbTopics = await slidesService.fetchTopicsWithSlides();
        const transformedTopics: Topic[] = dbTopics.map(topic => ({
          id: topic.id,
          name: topic.name,
          slides: topic.slides?.map(slide => ({
            id: slide.id,
            title: slide.title,
            bullets: slide.bullet_points
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((bp: any) => bp.content) || [],
            imageUrl: slide.image_url || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&h=600&fit=crop`
          })) || []
        }));
        
        setTopics(transformedTopics);
        
        if (currentSlideIndex >= transformedTopics[currentTopicIndex].slides.length) {
          setCurrentSlideIndex(Math.max(0, transformedTopics[currentTopicIndex].slides.length - 1));
        }
        
        alert(' Slide deleted successfully!');
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      alert(` Failed to delete slide: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-300 font-medium">Loading presentation data...</p>
          <p className="text-gray-500 mt-2">Fetching from Supabase database</p>
          {supabaseConnected === false && (
            <p className="text-yellow-500 mt-4 text-sm"> Supabase connection issues detected</p>
          )}
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center border border-gray-700">
            <div className="text-6xl mb-6 opacity-50"></div>
            <h2 className="text-3xl font-bold text-gray-300 mb-4">No Topics Found</h2>
            <p className="text-gray-400 mb-6">
              {error || 'Your Supabase database is empty. Please add topics and slides.'}
            </p>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-left p-6 bg-gray-900/50 rounded-xl">
                <h3 className="font-semibold text-cyan-400 mb-3">Database Status:</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className={`flex items-center ${supabaseConnected ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="mr-2">{supabaseConnected ? '✓' : '✗'}</span>
                    <span>Supabase Connection: {supabaseConnected ? 'Connected' : 'Failed'}</span>
                  </li>
                  <li className="text-gray-400">
                    <span className="mr-2">•</span>
                    <span>Environment Variables: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={handleAddTopic}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02]"
              >
                + Create First Topic
              </button>
              
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors"
              >
                {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
              </button>
            </div>
            
            {debugMode && (
              <div className="mt-8 p-6 bg-gray-900/80 rounded-xl text-left">
                <h4 className="font-bold text-yellow-400 mb-3">Debug Information:</h4>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {JSON.stringify({
                    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
                    supabaseConnected,
                    error,
                    topicsCount: topics.length
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 border border-gray-700"
        >
          {debugMode ? 'Hide Debug' : 'Debug'}
        </button>
        <div className={`px-3 py-1 text-sm rounded-lg ${supabaseConnected ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
          {supabaseConnected ? 'yea DB' : 'nah DB'}
        </div>
      </div>

      {debugMode && (
        <div className="fixed top-16 right-4 z-40 p-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 max-w-xs">
          <h3 className="font-bold text-cyan-400 mb-2">Debug Info:</h3>
          <div className="text-xs space-y-1">
            <p className="text-gray-300">Topics: {topics.length}</p>
            <p className="text-gray-300">Current Topic: {currentTopic?.name || 'None'}</p>
            <p className="text-gray-300">Slides in Topic: {currentTopic?.slides?.length || 0}</p>
            <p className="text-gray-300">Current Slide: {currentSlideIndex + 1}</p>
            <p className="text-gray-300">Supabase: {supabaseConnected ? 'Connected' : 'Disconnected'}</p>
            {error && <p className="text-red-300">Error: {error}</p>}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-200">Presentation Slides</h2>
            <p className="text-gray-400">
              {topics.reduce((acc, topic) => acc + (topic.slides?.length || 0), 0)} total slides
              {supabaseConnected && ' • Connected to Supabase'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddTopic}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors"
            >
              + Add Topic
            </button>
            {currentTopic.slides.length > 0 && (
              <button
                onClick={handleDeleteSlide}
                className="px-4 py-2 bg-red-900/30 hover:bg-red-800/30 border border-red-800 text-red-300 rounded-lg font-medium transition-colors"
              >
                Delete Slide
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 mb-6">
            <p className="text-yellow-300">{error}</p>
          </div>
        )}
        
        <Navigation 
          topics={topics}
          currentTopicIndex={currentTopicIndex}
          setCurrentTopicIndex={setCurrentTopicIndex}
        />
        
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-700">
          {currentTopic.slides.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6 opacity-30"></div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-4">No Slides in This Topic</h3>
              <p className="text-gray-400 mb-6">Add your first slide to start the presentation</p>
              <button
                onClick={handleAddSlide}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
              >
                + Add First Slide
              </button>
            </div>
          ) : (
            <SlideContent 
              currentTopic={currentTopic}
              currentSlide={currentSlide}
              currentSlideIndex={currentSlideIndex}
              totalSlides={currentTopic.slides.length}
              nextSlide={nextSlide}
              prevSlide={prevSlide}
              goToSlide={goToSlide}
              onAddSlide={handleAddSlide}
              onImageUpload={handleImageUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SlideShow;