import { useEffect, useState } from 'react';
import { Twitter, Youtube } from 'lucide-react';
import { SnakeGame } from './components/SnakeGame';
import iconA from 'figma:asset/5ce791300aec637bd1c9e37016995a8a50a99754.png';

export default function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showGame, setShowGame] = useState(false);

  // Set launch date to January 1st, 2026
  const launchDate = new Date('2026-01-01T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient"></div>
      
      {/* Brought to you by Ender */}
      <div className="absolute top-6 left-6 text-white/80 z-10">
        Brought to you by Ender
      </div>
      
      {/* Play Here Button */}
      <button
        onClick={() => setShowGame(true)}
        className="absolute top-6 right-6 px-6 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition-colors z-10"
      >
        Play Here
      </button>
      
      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <img src={iconA} alt="Logo" className="w-32 h-32 mx-auto" />
          <h1 className="text-white">Welcome, To Ariolu!</h1>
        </div>

        {/* Description */}
        <p className="text-white/90 text-lg max-w-md mx-auto">
          We're working hard to bring you something amazing. Stay tuned for the reveal!
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="text-white text-3xl">{timeLeft.days}</div>
            <div className="text-white/70 text-sm">Days</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="text-white text-3xl">{timeLeft.hours}</div>
            <div className="text-white/70 text-sm">Hours</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="text-white text-3xl">{timeLeft.minutes}</div>
            <div className="text-white/70 text-sm">Minutes</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <div className="text-white text-3xl">{timeLeft.seconds}</div>
            <div className="text-white/70 text-sm">Seconds</div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 pt-8">
          <a
            href="https://x.com/home"
            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://youtube.com"
            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-sm pt-8">
          © 2026 Ariolu. All rights reserved.
        </p>
      </div>

      {/* Snake Game */}
      {showGame && <SnakeGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
