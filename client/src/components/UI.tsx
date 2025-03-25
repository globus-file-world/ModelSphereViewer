import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface UIProps {
  isExploring: boolean;
  onExplore: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const UI = ({ isExploring, onExplore, isMuted, onToggleMute }: UIProps) => {
  const [showIntro, setShowIntro] = useState(true);
  
  // Hide intro after exploring or a timeout
  useEffect(() => {
    if (isExploring) {
      setShowIntro(false);
    }
    
    // Auto-hide intro after 10 seconds even if user doesn't click
    const timeout = setTimeout(() => {
      setShowIntro(false);
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [isExploring]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* Sound toggle button (always visible) */}
      <button 
        className="absolute top-4 right-4 z-50 p-3 bg-black bg-opacity-50 text-white rounded-full pointer-events-auto"
        onClick={onToggleMute}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      {/* Info text (always visible) */}
      <div className="absolute bottom-6 left-6 z-40 text-white text-sm p-2 bg-black bg-opacity-50 rounded-md">
        <p>Click on models to interact</p>
        <p>Drag to orbit • Scroll to zoom</p>
      </div>
      
      {/* Intro screen */}
      {showIntro && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black bg-opacity-70 pointer-events-auto transition-opacity duration-700">
          <div className="text-center px-6 py-8 rounded-xl max-w-lg flex flex-col items-center bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-md">
            <h1 className="text-4xl font-bold text-white mb-4">
              3D Floating Gallery
            </h1>
            <p className="text-zinc-200 mb-8 text-lg">
              Explore an interactive sphere of floating 3D objects. Drag to rotate, 
              scroll to zoom, and click on objects to interact with them.
            </p>
            <button
              className="bg-white text-purple-900 px-8 py-3 rounded-full text-lg font-semibold
                hover:bg-purple-100 transition-colors shadow-lg hover:shadow-xl"
              onClick={onExplore}
            >
              Explore Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;
