'use client'
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Heart } from 'lucide-react';
import { Press_Start_2P } from 'next/font/google';
import VideoStream from '../components/VideoStream';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
});

const BattlebotController = () => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [lastCommand, setLastCommand] = useState('Ready!');
  const [isConnected, setIsConnected] = useState(false);
  const [health, setHealth] = useState(3);
  const [gameState, setGameState] = useState('startup');
  const [startupComplete, setStartupComplete] = useState(false);

  // Startup sequence simulation
  useEffect(() => {
    if (gameState === 'startup') {
      setTimeout(() => setStartupComplete(true), 3000);
      setTimeout(() => setGameState('disconnected'), 4000);
    }
  }, []);

  useEffect(() => {
    if (startupComplete && gameState === 'disconnected') {
      setTimeout(() => {
        setIsConnected(true);
        setGameState('connected');
        setTimeout(() => setGameState('playing'), 1000);
      }, 2000);
    }
  }, [startupComplete, gameState]);

  // Health and game state management
  const handleDamage = () => {
    if (gameState === 'playing') {
      const newHealth = health - 1;
      setHealth(newHealth);
      if (newHealth <= 0) {
        setGameState('dead');
        setTimeout(() => resetGame(), 5000);
      }
    }
  };

  const resetGame = () => {
    setHealth(3);
    setGameState('playing');
  };

  // Key handling
  const handleKeyAction = (key, isKeyDown) => {
    if (gameState !== 'playing') return;

    setActiveKeys(prev => {
      const newKeys = new Set(prev);
      if (isKeyDown) {
        newKeys.add(key);
      } else {
        newKeys.delete(key);
      }
      return newKeys;
    });

    const commands = {
      'w': 'FORWARD',
      'ArrowUp': 'FORWARD',
      's': 'BACKWARD',
      'ArrowDown': 'BACKWARD',
      'a': 'LEFT',
      'ArrowLeft': 'LEFT',
      'd': 'RIGHT',
      'ArrowRight': 'RIGHT',
      ' ': 'ATTACK'
    };

    if (isKeyDown && commands[key]) {
      setLastCommand(commands[key]);
      if (key === ' ') {
        handleDamage();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      handleKeyAction(e.key, true);
    };

    const handleKeyUp = (e) => {
      handleKeyAction(e.key, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, health]);

  const handleVideoConnectionChange = (connected) => {
    setIsConnected(connected);
    if (connected && gameState === 'disconnected') {
      setGameState('connected');
      setTimeout(() => setGameState('playing'), 1000);
    } else if (!connected && gameState === 'playing') {
      setGameState('disconnected');
    }
  };

  const buttonClass = (key) => {
    return `rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-150 
      ${pressStart2P.className}
      ${activeKeys.has(key) 
        ? 'bg-yellow-400 text-purple-900 transform scale-95 shadow-inner' 
        : 'bg-gradient-to-br from-purple-600 to-purple-700 text-yellow-300 hover:from-purple-500 hover:to-purple-600 shadow-lg'
      } border-2 border-purple-400 backdrop-blur-sm ${gameState !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  // State overlays
  const renderStateOverlay = () => {
    switch (gameState) {
      case 'startup':
        return (
          <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-yellow-300 animate-pulse">
                BATTLEBOT SYSTEM
              </h1>
              <div className="text-2xl text-purple-400">
                INITIALIZING...
              </div>
              <div className="w-64 h-2 bg-purple-900 rounded-full mx-auto">
                <div className="h-full bg-yellow-300 rounded-full animate-[width_3s_ease-in-out]"></div>
              </div>
            </div>
          </div>
        );
      case 'disconnected':
        return (
          <div className="absolute inset-0 bg-red-900/30 z-40 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-4 animate-bounce">
              <WifiOff size={64} className="text-red-400 mx-auto" />
              <div className="text-2xl text-red-400">NO ROBOT CONNECTED</div>
            </div>
          </div>
        );
      case 'connected':
        return (
          <div className="absolute inset-0 bg-green-900/30 z-40 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-4">
              <Wifi size={64} className="text-green-400 mx-auto animate-ping" />
              <div className="text-2xl text-green-400">ROBOT CONNECTED</div>
            </div>
          </div>
        );
      case 'dead':
        return (
          <div className="absolute inset-0 bg-red-900/50 z-40 flex items-center justify-center backdrop-blur-sm animate-[opacity_1s_ease-in]">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-bold text-red-500 animate-bounce">DESTROYED</h2>
              <p className="text-2xl text-yellow-300">Restarting in 5 seconds...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Video feed */}
      <div className="absolute inset-0 z-0">
        <VideoStream onConnectionChange={handleVideoConnectionChange} />
        {gameState === 'dead' && (
          <div className="absolute inset-0 bg-red-900/50 animate-pulse" />
        )}
      </div>

      {renderStateOverlay()}

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-4">
            <h1 className={`text-4xl font-bold text-yellow-300 ${pressStart2P.className}`}>
              BATTLEBOT
            </h1>
            <div className="flex items-center gap-2 bg-purple-900/60 px-4 py-2 rounded-lg">
              {isConnected ? (
                <Wifi className="text-green-400" size={20} />
              ) : (
                <WifiOff className="text-red-400" size={20} />
              )}
              <span className={`text-yellow-300 text-sm ${pressStart2P.className}`}>
                {lastCommand}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={32}
                className={`transition-all duration-300 ${
                  i < health 
                    ? 'text-red-500 animate-pulse' 
                    : 'text-gray-600'
                }`}
                fill={i < health ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
          <div className="container mx-auto">
            {/* WASD Controls */}
            <div className="flex justify-between items-end">
              <div className="grid grid-cols-3 gap-4 w-96">
                {/* Top row */}
                <div></div>
                <button className={`${buttonClass('w')} h-32 w-32`}>
                  <span className="text-4xl font-bold">W</span>
                </button>
                <div></div>

                {/* Middle row */}
                <button className={`${buttonClass('a')} h-32 w-32`}>
                  <span className="text-4xl font-bold">A</span>
                </button>
                <button className={`${buttonClass('s')} h-32 w-32`}>
                  <span className="text-4xl font-bold">S</span>
                </button>
                <button className={`${buttonClass('d')} h-32 w-32`}>
                  <span className="text-4xl font-bold">D</span>
                </button>
              </div>

              {/* Attack button */}
              <button 
                className={`${buttonClass(' ')} 
                  bg-gradient-to-br from-red-600 to-red-700 
                  hover:from-red-500 hover:to-red-600
                  w-96 h-40 text-7xl font-bold
                `}
              >
                ATTACK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlebotController;