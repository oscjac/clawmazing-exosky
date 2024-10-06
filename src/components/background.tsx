import React, { useRef, useState } from 'react';

interface BackgroundMusicProps {
  src: string;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = (): void => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <audio ref={audioRef} src={src} loop />
      <button
        onClick={togglePlay}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isPlaying ? 'Pause Music' : 'Play Music'}
      </button>
    </div>
  );
};

export default BackgroundMusic;