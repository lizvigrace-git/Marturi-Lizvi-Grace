import { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 120;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    foodRef.current = generateFood();
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    lastRenderTimeRef.current = performance.now();
  }, [generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas - harsh black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid - jarring cyan lines
    ctx.strokeStyle = '#003333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food - harsh magenta square
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );

    // Draw snake - harsh cyan squares
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });
  }, []);

  const updateGame = useCallback(() => {
    if (gameOver || isPaused || !hasStarted) return;

    directionRef.current = nextDirectionRef.current;
    const head = { ...snakeRef.current[0] };

    switch (directionRef.current) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    if (snakeRef.current.some((segment) => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [head, ...snakeRef.current];

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => {
        const newScore = s + 10;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      foodRef.current = generateFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  }, [gameOver, isPaused, hasStarted, highScore, generateFood]);

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);

      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      const currentSpeed = Math.max(40, INITIAL_SPEED - Math.floor(score / 50) * 10);
      
      if (secondsSinceLastRender >= currentSpeed / 1000) {
        updateGame();
        drawGame();
        lastRenderTimeRef.current = currentTime;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [updateGame, drawGame, score]
  );

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      if (!hasStarted || gameOver || isPaused) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (currentDir !== 'DOWN') nextDirectionRef.current = 'UP'; break;
        case 'ArrowDown': case 's': case 'S': if (currentDir !== 'UP') nextDirectionRef.current = 'DOWN'; break;
        case 'ArrowLeft': case 'a': case 'A': if (currentDir !== 'RIGHT') nextDirectionRef.current = 'LEFT'; break;
        case 'ArrowRight': case 'd': case 'D': if (currentDir !== 'LEFT') nextDirectionRef.current = 'RIGHT'; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, gameOver, isPaused]);

  useEffect(() => { drawGame(); }, [drawGame]);

  return (
    <div className="flex flex-col items-center gap-6 font-pixel">
      <div className="flex justify-between w-full max-w-[400px] px-4 py-3 brutal-border bg-black">
        <div className="flex flex-col">
          <span className="text-[#00FFFF] text-[10px] uppercase tracking-widest mb-2">SCORE_</span>
          <span className="text-white text-xl">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#FF00FF] text-[10px] uppercase tracking-widest mb-2">HI_SCORE_</span>
          <span className="text-white text-xl">
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div className="relative group">
        <div className="relative bg-black brutal-border overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block"
          />

          {!hasStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-2xl text-[#00FFFF] mb-8 glitch-text" data-text="SNAKE.EXE">
                SNAKE.EXE
              </h3>
              <button
                onClick={resetGame}
                className="px-6 py-4 bg-[#FF00FF] text-black text-sm hover:bg-[#00FFFF] transition-colors uppercase brutal-border"
              >
                [ EXECUTE ]
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-3xl text-[#FF00FF] mb-4 glitch-text" data-text="FATAL_ERR">
                FATAL_ERR
              </h3>
              <p className="text-[#00FFFF] text-sm mb-8">MEM_DUMP: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-4 bg-[#00FFFF] text-black text-sm hover:bg-[#FF00FF] transition-colors uppercase brutal-border"
              >
                [ REBOOT ]
              </button>
            </div>
          )}

          {isPaused && hasStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <h3 className="text-2xl text-white glitch-text" data-text="HALTED">
                HALTED
              </h3>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-[#FF00FF] text-[10px] uppercase tracking-widest bg-black px-2 py-1 border border-[#FF00FF]">
        INPUT: [W,A,S,D] | INTERRUPT: [SPACE]
      </div>
    </div>
  );
}
