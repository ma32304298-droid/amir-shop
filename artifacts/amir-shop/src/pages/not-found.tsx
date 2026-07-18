import { Link } from 'wouter';
import { Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center w-full">
      <Gamepad2 className="w-24 h-24 text-primary opacity-20 mb-8" />
      <h1 className="text-6xl font-black text-white mb-4 text-glow">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Game Over. This page doesn't exist.</p>
      
      <Link 
        href="/"
        className="px-8 py-3 rounded-xl bg-primary text-white font-bold transition-all hover:bg-primary/90 glow-primary"
      >
        Return to Base
      </Link>
    </div>
  );
}
