import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Mouse {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  emoji: string;
}

const Index = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mice, setMice] = useState<Mouse[]>([]);
  const [catPos, setCatPos] = useState({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [caughtAnimation, setCaughtAnimation] = useState<{ x: number; y: number } | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  const micePerLevel = 5;
  const progressToNextLevel = (score % micePerLevel) / micePerLevel * 100;
  const mouseEmojis = ['🐭', '🐁', '🐀'];

  const createMouse = (id: number): Mouse => {
    const gameArea = gameAreaRef.current;
    const maxX = gameArea ? gameArea.clientWidth - 40 : 800;
    const maxY = gameArea ? gameArea.clientHeight - 40 : 600;
    
    return {
      id,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      speedX: (Math.random() - 0.5) * level * 2,
      speedY: (Math.random() - 0.5) * level * 2,
      emoji: mouseEmojis[Math.floor(Math.random() * mouseEmojis.length)]
    };
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLevel(1);
    const initialMice = Array.from({ length: 3 }, (_, i) => createMouse(i));
    setMice(initialMice);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMice(prevMice => {
        const gameArea = gameAreaRef.current;
        if (!gameArea) return prevMice;
        
        const maxX = gameArea.clientWidth - 40;
        const maxY = gameArea.clientHeight - 40;

        return prevMice.map(mouse => {
          let newX = mouse.x + mouse.speedX;
          let newY = mouse.y + mouse.speedY;
          let newSpeedX = mouse.speedX;
          let newSpeedY = mouse.speedY;

          if (newX <= 0 || newX >= maxX) {
            newSpeedX = -newSpeedX;
            newX = Math.max(0, Math.min(maxX, newX));
          }
          if (newY <= 0 || newY >= maxY) {
            newSpeedY = -newSpeedY;
            newY = Math.max(0, Math.min(maxY, newY));
          }

          return { ...mouse, x: newX, y: newY, speedX: newSpeedX, speedY: newSpeedY };
        });
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || !isPlaying) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    setCatPos({
      x: e.clientX - rect.left - 30,
      y: e.clientY - rect.top - 30
    });
  };

  const catchMouse = (mouseId: number, mouseX: number, mouseY: number) => {
    setCaughtAnimation({ x: mouseX, y: mouseY });
    setTimeout(() => setCaughtAnimation(null), 500);

    setMice(prevMice => {
      const filtered = prevMice.filter(m => m.id !== mouseId);
      if (filtered.length === 0) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        return Array.from({ length: Math.min(3 + Math.floor(nextLevel / 2), 8) }, (_, i) => 
          createMouse(Date.now() + i)
        );
      }
      return filtered;
    });
    
    setScore(s => s + 1);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const checkCollisions = () => {
      mice.forEach(mouse => {
        const distance = Math.sqrt(
          Math.pow(catPos.x - mouse.x, 2) + Math.pow(catPos.y - mouse.y, 2)
        );
        if (distance < 50) {
          catchMouse(mouse.id, mouse.x, mouse.y);
        }
      });
    };

    const interval = setInterval(checkCollisions, 50);
    return () => clearInterval(interval);
  }, [catPos, mice, isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF7CD] via-[#FFDEE2] to-[#D3E4FD] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A1F2C] mb-2" style={{ fontFamily: 'Rubik, sans-serif' }}>
            🐱 Кот-ловец мышей
          </h1>
          <p className="text-lg text-[#403E43]">Помоги коту поймать всех мышей!</p>
        </div>

        {!isPlaying ? (
          <Card className="p-12 text-center animate-scale-in bg-white/90 backdrop-blur-sm">
            <div className="mb-6 text-8xl">🐱💼</div>
            <h2 className="text-3xl font-bold mb-4 text-[#1A1F2C]" style={{ fontFamily: 'Rubik, sans-serif' }}>
              Готов начать охоту?
            </h2>
            <p className="text-[#8E9196] mb-6 max-w-md mx-auto">
              Двигай мышкой, чтобы кот ловил мышей в свой мешок. С каждым уровнем мыши становятся быстрее!
            </p>
            <Button 
              onClick={startGame}
              size="lg"
              className="bg-[#F97316] hover:bg-[#F97316]/90 text-white font-bold px-8 py-6 text-xl hover-scale"
            >
              Начать игру
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="p-4 bg-white/90 backdrop-blur-sm">
                <div className="text-sm text-[#8E9196] mb-1">Поймано мышей</div>
                <div className="text-3xl font-bold text-[#8B5CF6]">{score}</div>
              </Card>
              <Card className="p-4 bg-white/90 backdrop-blur-sm">
                <div className="text-sm text-[#8E9196] mb-1">Уровень</div>
                <div className="text-3xl font-bold text-[#F97316]">{level}</div>
              </Card>
              <Card className="p-4 bg-white/90 backdrop-blur-sm">
                <div className="text-sm text-[#8E9196] mb-1">Прогресс</div>
                <Progress value={progressToNextLevel} className="h-2 mt-2" />
              </Card>
            </div>

            <Card 
              ref={gameAreaRef}
              className="relative overflow-hidden bg-gradient-to-br from-[#E5DEFF] to-[#F1F0FB] border-4 border-[#9b87f5] cursor-none"
              style={{ height: '600px' }}
              onMouseMove={handleMouseMove}
            >
              {mice.map(mouse => (
                <div
                  key={mouse.id}
                  className="absolute text-4xl transition-all duration-100 animate-bounce"
                  style={{
                    left: `${mouse.x}px`,
                    top: `${mouse.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {mouse.emoji}
                </div>
              ))}

              <div
                className="absolute text-6xl transition-all duration-100 pointer-events-none"
                style={{
                  left: `${catPos.x}px`,
                  top: `${catPos.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                🐱💼
              </div>

              {caughtAnimation && (
                <div
                  className="absolute text-4xl font-bold text-[#8B5CF6] animate-scale-in"
                  style={{
                    left: `${caughtAnimation.x}px`,
                    top: `${caughtAnimation.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  +1 ✨
                </div>
              )}

              {mice.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm animate-fade-in">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <div className="text-2xl font-bold text-[#1A1F2C]">Новый уровень!</div>
                  </div>
                </div>
              )}
            </Card>

            <div className="text-center mt-4">
              <Button 
                onClick={() => setIsPlaying(false)}
                variant="outline"
                className="border-[#8E9196] text-[#403E43] hover:bg-white/50"
              >
                Завершить игру
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
