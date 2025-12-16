"use client";

import { useRef, useEffect, useCallback } from "react";

interface PaintSplatProps {
  /** X position (px or %) */
  x?: number | string;
  /** Y position (px or %) */
  y?: number | string;
  /** Size of the splat in pixels */
  size?: number;
  /** Paint color (hex) */
  color?: string;
  /** Rotation in degrees */
  rotation?: number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Custom className */
  className?: string;
  /** Z-index for layering */
  zIndex?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  stopped: boolean;
  isSatellite: boolean;
  history: Point[];
}

interface CrackData {
  points: Point[];
  angle: number;
  length: number;
  growth: number;
  width: number;
}

interface ProjectileData {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  scaleX: number;
  scaleY: number;
}

type SimState = "idle" | "flying" | "splatting" | "drying" | "done";

export function PaintSplat({
  x = 0,
  y = 0,
  size = 200,
  color = "#0020b0",
  rotation = 0,
  opacity = 1,
  className = "",
  zIndex = 1,
  delay = 0,
  onComplete,
}: PaintSplatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const cracksRef = useRef<CrackData[]>([]);
  const projectileRef = useRef<ProjectileData | null>(null);
  const simStateRef = useRef<SimState>("idle");
  const animationFrameRef = useRef<number>(0);

  const gravity = 0.5;
  const viscosity = 0.94;
  const splatCount = 800;

  // Generate grunge texture
  const generateGrungeTexture = useCallback((width: number, height: number) => {
    if (!noiseCanvasRef.current) {
      noiseCanvasRef.current = document.createElement("canvas");
    }
    const noiseCanvas = noiseCanvasRef.current;
    const noiseCtx = noiseCanvas.getContext("2d");
    if (!noiseCtx) return;

    noiseCanvas.width = width;
    noiseCanvas.height = height;
    noiseCtx.clearRect(0, 0, width, height);

    noiseCtx.fillStyle = "black";
    for (let i = 0; i < 40000; i++) {
      noiseCtx.globalAlpha = Math.random() * 0.3;
      noiseCtx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    noiseCtx.strokeStyle = "black";
    noiseCtx.lineCap = "round";
    for (let i = 0; i < 80; i++) {
      noiseCtx.globalAlpha = Math.random() * 0.5;
      noiseCtx.lineWidth = Math.random() * 2 + 0.5;
      noiseCtx.beginPath();
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      noiseCtx.moveTo(sx, sy);
      noiseCtx.lineTo(sx + (Math.random() - 0.5) * 60, sy + (Math.random() - 0.5) * 60);
      noiseCtx.stroke();
    }
  }, []);

  // Create splat particles
  const createSplat = useCallback((cx: number, cy: number): ParticleData[] => {
    const particles: ParticleData[] = [];
    const freq1 = Math.random() * 3 + 3;
    const freq2 = Math.random() * 10 + 5;
    const phase = Math.random() * Math.PI;

    for (let i = 0; i < splatCount; i++) {
      const theta = (Math.PI * 2 * i) / splatCount;
      const wave = Math.sin(theta * freq1 + phase) + 0.5 * Math.sin(theta * freq2) + 0.2 * Math.random();
      const armStrength = Math.pow(Math.abs(wave + 1), 3);

      let speed = 4 + armStrength * 3 + Math.random() * 5;
      let pSize = 2 + Math.random() * 5 + armStrength * 1.5;

      const isSatellite = speed > 18 && Math.random() > 0.6;
      if (isSatellite) {
        speed *= 1.3;
        pSize *= 0.6;
      }

      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(theta) * speed,
        vy: Math.sin(theta) * speed,
        size: pSize,
        stopped: false,
        isSatellite,
        history: [],
      });
    }
    return particles;
  }, [splatCount]);

  // Main animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasSize = size * 8;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // Ensure canvas is truly transparent
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    generateGrungeTexture(canvasSize, canvasSize);

    // Initialize projectile
    const startAnimation = () => {
      projectileRef.current = {
        x: centerX,
        y: -30,
        radius: size * 0.12,
        vy: size * 0.15,
        vx: (Math.random() - 0.5) * 2,
        scaleX: 1,
        scaleY: 1,
      };
      simStateRef.current = "flying";
    };

    const timeoutId = setTimeout(startAnimation, delay);

    const loop = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // FLYING PHASE
      if (simStateRef.current === "flying" && projectileRef.current) {
        const p = projectileRef.current;
        p.vy += gravity;
        p.y += p.vy;
        p.x += p.vx;
        p.scaleY = 1 + p.vy * 0.015;
        p.scaleX = 1 - p.vy * 0.015;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scaleX, p.scaleY);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        if (p.y > centerY) {
          simStateRef.current = "splatting";
          particlesRef.current = createSplat(p.x, p.y);
          projectileRef.current = null;
        }
      }

      // SPLATTING & DRYING
      if (simStateRef.current === "splatting" || simStateRef.current === "drying") {
        let allStopped = true;

        // Center mass
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Particles
        particlesRef.current.forEach((p) => {
          if (!p.stopped) {
            const drag = p.isSatellite ? 0.96 : viscosity;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= drag;
            p.vy *= drag;

            if (Math.abs(p.vx) > 0.5 || Math.abs(p.vy) > 0.5) {
              p.history.unshift({ x: p.x, y: p.y });
              if (p.history.length > 80) p.history.pop();
            }

            if (Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
              p.stopped = true;
            } else {
              allStopped = false;
            }
          }

          // Draw tail
          if (p.history.length > 2 && !p.isSatellite) {
            ctx.beginPath();
            ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let i = 1; i < p.history.length; i++) {
              ctx.lineTo(p.history[i].x, p.history[i].y);
            }
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = p.size * 2;
            ctx.strokeStyle = color;
            ctx.stroke();
          }

          // Draw head
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.isSatellite ? p.size / 1.5 : p.size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        // Grunge texture - apply only to painted areas
        if (noiseCanvasRef.current) {
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.globalAlpha = 0.3;
          ctx.drawImage(noiseCanvasRef.current, 0, 0);
          ctx.restore();
        }

        // Start drying
        if (allStopped && simStateRef.current === "splatting") {
          simStateRef.current = "drying";
          for (let i = 0; i < 15; i++) {
            cracksRef.current.push({
              points: [{ x: centerX + (Math.random() - 0.5) * size * 0.3, y: centerY + (Math.random() - 0.5) * size * 0.3 }],
              angle: Math.random() * Math.PI * 2,
              length: 30 + Math.random() * 80,
              growth: 0,
              width: 1 + Math.random(),
            });
          }
        }
      }

      // DRYING PHASE
      if (simStateRef.current === "drying") {
        let allCracksDone = true;

        cracksRef.current.forEach((c) => {
          if (c.growth < c.length) {
            allCracksDone = false;
            const last = c.points[c.points.length - 1];
            c.angle += (Math.random() - 0.5) * 2.0;
            const speed = 4;
            c.points.push({
              x: last.x + Math.cos(c.angle) * speed,
              y: last.y + Math.sin(c.angle) * speed,
            });
            c.growth += speed;
          }

          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          ctx.lineWidth = c.width;
          ctx.lineCap = "square";
          ctx.moveTo(c.points[0].x, c.points[0].y);
          for (let i = 1; i < c.points.length; i++) {
            ctx.lineTo(c.points[i].x, c.points[i].y);
          }
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        });

        if (allCracksDone) {
          simStateRef.current = "done";
          onComplete?.();
        }
      }

      if (simStateRef.current !== "done") {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [size, color, delay, generateGrungeTexture, createSplat, onComplete]);

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: typeof x === "number" ? `${x}px` : x,
    top: typeof y === "number" ? `${y}px` : y,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    opacity,
    zIndex,
    pointerEvents: "none",
    overflow: "visible",
    width: 0,
    height: 0,
  };

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  };

  return (
    <div style={wrapperStyle} aria-hidden="true">
      <canvas ref={canvasRef} style={canvasStyle} className={className} />
    </div>
  );
}

export default PaintSplat;
