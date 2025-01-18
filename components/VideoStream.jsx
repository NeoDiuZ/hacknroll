import React, { useRef, useEffect, useState } from 'react';

const VideoStream = ({ onConnectionChange }) => {
  const imgRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let retryTimeout;
    
    const handleImageError = () => {
      setIsConnected(false);
      onConnectionChange?.(false);
      
      // Retry connection after 1 second
      retryTimeout = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = '/video_feed?' + new Date().getTime();
        }
      }, 1000);
    };

    const handleImageLoad = () => {
      setIsConnected(true);
      onConnectionChange?.(true);
    };

    if (imgRef.current) {
      imgRef.current.addEventListener('error', handleImageError);
      imgRef.current.addEventListener('load', handleImageLoad);
    }

    return () => {
      if (imgRef.current) {
        imgRef.current.removeEventListener('error', handleImageError);
        imgRef.current.removeEventListener('load', handleImageLoad);
      }
      clearTimeout(retryTimeout);
    };
  }, [onConnectionChange]);

  return (
    <div className="relative w-full h-full">
      <img
        ref={imgRef}
        src="/video_feed"
        alt="Robot Camera Feed"
        className="w-full h-full object-cover"
      />
      {!isConnected && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-2xl">Connecting to camera...</div>
        </div>
      )}
    </div>
  );
};

export default VideoStream;