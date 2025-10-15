"use client";

import { useEffect, useRef } from "react";
import { Game } from "./game/Game";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<Game | null>(null);

  const initGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy();
    }
    if (canvasRef.current) {
      const game = new Game(canvasRef.current);
      gameInstanceRef.current = game;
      return game;
    }
    return null;
  };

  const startGame = () => {
    let game = gameInstanceRef.current;
    if (!game || game.isGameOver()) {
      game = initGame();
    }
    if (game) {
      game.start();
    }
  };

  useEffect(() => {
    initGame();
    return () => {
      gameInstanceRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 font-body text-foreground">
      <header className="text-center mb-6">
        <h1 className="font-headline text-4xl sm:text-6xl font-bold tracking-tighter text-accent">
          Space Survivor
        </h1>
        <p className="text-muted-foreground mt-2">Defeat the triangle, then face the final boss!</p>
      </header>
      
      <div id="game-container" className="relative w-full max-w-4xl aspect-[4/3] bg-gray-900 rounded-xl shadow-2xl shadow-primary/30 overflow-hidden border-2 border-primary/50">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>

        <div id="game-overlay" className="absolute inset-0 bg-black/70 flex-col items-center justify-center hidden">
          <img id="game-message" src="" alt="Game Status" className="w-2/3 max-w-sm" />
          <Button onClick={startGame} className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">Play Again</Button>
        </div>

        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-accent font-headline text-lg sm:text-2xl pointer-events-none">
          <ul className="flex gap-8">
            <li id="scoreli">Score: 0</li>
            <li id="livesli">Lives: 3</li>
          </ul>
        </div>

        <div id="start-screen" className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl font-bold mb-4 text-accent">Welcome!</h2>
            <p className="mb-2 text-lg">Use Arrow Keys to Move.</p>
            <p className="mb-8 text-lg">Press Space to Shoot.</p>
            <Button onClick={startGame} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Start Game</Button>
        </div>
      </div>

       <footer className="mt-8 text-center text-muted-foreground">
        <p>Touchscreen controls: Drag to move, Tap to shoot.</p>
      </footer>
    </main>
  );
}
