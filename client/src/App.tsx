import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Environment, Preload } from "@react-three/drei";
import Scene from "./components/Scene";
import UI from "./components/UI";
import { useAudio } from "./lib/stores/useAudio";

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const { setBackgroundMusic, toggleMute, isMuted } = useAudio();

  // Load background music
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    setBackgroundMusic(bgMusic);

    // Show the canvas once everything is loaded
    setShowCanvas(true);
  }, [setBackgroundMusic]);

  const handleExplore = () => {
    setIsExploring(true);
    
    // Unmute audio when user starts exploring
    if (isMuted) {
      toggleMute();
    }
  };

  return (
    <div className="w-full h-full relative">
      {showCanvas && (
        <>
          <Canvas
            shadows
            camera={{
              position: [0, 0, 15],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#050510"]} />
            
            <Suspense fallback={null}>
              <Scene isActive={isExploring} />
              <Environment preset="sunset" />
              <Preload all />
            </Suspense>
          </Canvas>
          
          <UI 
            isExploring={isExploring} 
            onExplore={handleExplore}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        </>
      )}
    </div>
  );
}

export default App;
