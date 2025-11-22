import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface SnakeGameProps {
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const SNAKE_COLORS = [
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
];

const BOARD_SIZES = [
  { name: 'Small', value: 15 },
  { name: 'Medium', value: 20 },
  { name: 'Large', value: 25 },
];

const SPEED_OPTIONS = [
  { name: 'Slow', value: 200 },
  { name: 'Normal', value: 150 },
  { name: 'Fast', value: 100 },
  { name: 'Extreme', value: 50 },
];

export function SnakeGame({ onClose }: SnakeGameProps) {
  const [showSetup, setShowSetup] = useState(true);
  const [snakeColor, setSnakeColor] = useState(SNAKE_COLORS[0].value);
  const [boardSize, setBoardSize] = useState(20);
  const [gameSpeed, setGameSpeed] = useState(150);
  const [cellSize, setCellSize] = useState(20);
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Adjust cell size based on board size
  useEffect(() => {
    if (boardSize === 15) {
      setCellSize(26);
    } else if (boardSize === 20) {
      setCellSize(20);
    } else {
      setCellSize(16);
    }
  }, [boardSize]);

  const playEatSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, []);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
    return newFood;
  }, [boardSize]);

  const startGame = () => {
    const initialX = Math.floor(boardSize / 2);
    const initialY = Math.floor(boardSize / 2);
    setSnake([{ x: initialX, y: initialY }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(false);
    setShowSetup(false);
  };

  const changeDirection = useCallback((newDirection: Direction) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    setNextDirection((currentNext) => {
      const current = direction;
      // Prevent reversing
      if (
        (newDirection === 'UP' && current !== 'DOWN') ||
        (newDirection === 'DOWN' && current !== 'UP') ||
        (newDirection === 'LEFT' && current !== 'RIGHT') ||
        (newDirection === 'RIGHT' && current !== 'LEFT')
      ) {
        return newDirection;
      }
      return currentNext;
    });
  }, [direction, gameStarted]);

  useEffect(() => {
    if (showSetup) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameStarted) {
            setIsPaused((p) => !p);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, changeDirection, showSetup, gameStarted]);

  useEffect(() => {
    if (gameOver || isPaused || showSetup || !gameStarted) return;

    const gameLoop = setInterval(() => {
      setDirection(nextDirection);
      
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        let newHead: Position;

        switch (nextDirection) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= boardSize ||
          newHead.y < 0 ||
          newHead.y >= boardSize
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood());
          playEatSound();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [nextDirection, food, gameOver, isPaused, generateFood, showSetup, gameStarted, gameSpeed, boardSize, playEatSound]);

  const resetGame = () => {
    setShowSetup(true);
  };

  if (showSetup) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-white mb-6 text-center">Snake Game Setup</h2>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="text-white block mb-3">Snake Color</label>
            <div className="flex justify-center gap-2 flex-wrap">
              {SNAKE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSnakeColor(color.value)}
                  className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: snakeColor === color.value ? 'white' : 'transparent',
                  }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>

          {/* Board Size */}
          <div className="mb-6">
            <label className="text-white block mb-3">Board Size</label>
            <div className="flex gap-2">
              {BOARD_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setBoardSize(size.value)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    boardSize === size.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="mb-8">
            <label className="text-white block mb-3">Speed</label>
            <div className="grid grid-cols-2 gap-2">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed.value}
                  onClick={() => setGameSpeed(speed.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    gameSpeed === speed.value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {speed.name}
                </button>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={startGame}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          aria-label="Close game"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-4">
          <h2 className="text-white mb-2">Snake Game</h2>
          <div className="flex justify-center items-center gap-6 mb-2">
            <p className="text-white">Score: {score}</p>
            {!isMobile && !gameStarted && (
              <p className="text-yellow-400 text-sm">
                Press any arrow key or WASD to start!
              </p>
            )}
            {!isMobile && gameStarted && (
              <p className="text-gray-400 text-sm">
                Controls: Arrow Keys or WASD | Space to Pause
              </p>
            )}
            {isMobile && !gameStarted && (
              <p className="text-yellow-400 text-sm">
                Tap any direction to start!
              </p>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-4">
          <div
            className="relative bg-gray-800 rounded-lg border border-gray-700"
            style={{
              width: boardSize * cellSize,
              height: boardSize * cellSize,
            }}
          >
            {/* Food */}
            <div
              className="absolute bg-red-500 rounded-sm"
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                left: food.x * cellSize + 1,
                top: food.y * cellSize + 1,
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className="absolute rounded-sm"
                style={{
                  width: cellSize - 2,
                  height: cellSize - 2,
                  left: segment.x * cellSize + 1,
                  top: segment.y * cellSize + 1,
                  backgroundColor: snakeColor,
                  opacity: index === 0 ? 1 : 0.8,
                }}
              />
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <p className="text-white text-xl mb-4">Game Over!</p>
                  <p className="text-white mb-4">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <p className="text-white text-xl">Paused</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        {isMobile && (
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div></div>
            <button
              onClick={() => changeDirection('UP')}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center transition-colors active:bg-gray-500"
              aria-label="Move up"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div></div>
            
            <button
              onClick={() => changeDirection('LEFT')}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center transition-colors active:bg-gray-500"
              aria-label="Move left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => {
                if (gameStarted) {
                  setIsPaused((p) => !p);
                }
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center transition-colors text-sm"
              aria-label="Pause/Resume"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button
              onClick={() => changeDirection('RIGHT')}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center transition-colors active:bg-gray-500"
              aria-label="Move right"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            
            <div></div>
            <button
              onClick={() => changeDirection('DOWN')}
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-center transition-colors active:bg-gray-500"
              aria-label="Move down"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
}
