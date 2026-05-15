import { useState, useEffect, useMemo, type FC } from "react";

const Stars: FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    let animationFrame: number;
    const animate = () => {
      setTime((t) => t + 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMove);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  const starsData = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      leftPercent: (100 / 30) * i + Math.random() * 2,
      stringHeight: 40 + Math.random() * 100,
      size: 8 + Math.random() * 10,
      sensitivity: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none z-20 overflow-hidden opacity-80">
      {starsData.map((star) => {
        const starX = (star.leftPercent / 100) * screenWidth;
        const starY = star.stringHeight;
        const dx = mousePos.x - starX;
        const dy = mousePos.y - starY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const radius = 250;
        let mouseTilt = 0;

        if (distance < radius) {
          const force = (radius - distance) / radius;
          mouseTilt = -(dx / radius) * force * 15 * star.sensitivity;
        }

        const idleSwing = Math.sin(time * 0.02) * 5;
        const isHovered = distance < 120;

        return (
          <div
            key={star.id}
            className="absolute top-[-10px] flex flex-col items-center"
            style={{
              left: `${star.leftPercent}%`,
              transform: `rotate(${idleSwing + mouseTilt}deg)`,
              transformOrigin: "top center",
              transition: "transform 0.4s ease-out",
            }}
          >
            <div
              className="w-[0.5px] bg-gradient-to-b from-white/40 via-white/10 to-transparent"
              style={{ height: `${star.stringHeight}px` }}
            />

            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              className={`transition-all duration-700 ${
                isHovered
                  ? "fill-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,1)] scale-150"
                  : "fill-white/60 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] scale-100"
              }`}
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export { Stars };
