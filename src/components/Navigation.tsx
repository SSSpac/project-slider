import { Topic } from './Slideshow';

interface NavigationProps {
  topics: Topic[];
  currentTopicIndex: number;
  setCurrentTopicIndex: (index: number) => void;
}

const Navigation = ({ topics, currentTopicIndex, setCurrentTopicIndex }: NavigationProps) => {
  return (
    <nav className="mb-8">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {topics.map((topic, index) => (
          <button
            key={topic.id}
            onClick={() => setCurrentTopicIndex(index)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              currentTopicIndex === index
                ? 'bg-cyan-800 shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {topic.name}
            <span className="ml-2 text-sm opacity-75">
              ({topic.slides?.length || 0})
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;