'use client';
import Link from 'next/link';
import { PaintSplat } from "@/components/effects";

export default function Hero() {
  //I want to retrieve this data from Supabase in the later future. I want to retrieve the names of the actual chatrooms available and it is then displayed in this hero section accordingly.
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-visible">
      {/* Grungy background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero-background.png)' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Noise/grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Scratches overlay effect - using fixed values to prevent hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { w: 1.5, h: 80, l: 15, t: 20, r: -5 },
          { w: 2, h: 120, l: 35, t: 60, r: 8 },
          { w: 1.2, h: 95, l: 55, t: 10, r: -12 },
          { w: 2.5, h: 70, l: 75, t: 45, r: 3 },
          { w: 1.8, h: 110, l: 90, t: 75, r: -8 },
          { w: 1.3, h: 85, l: 25, t: 85, r: 10 },
          { w: 2.2, h: 65, l: 65, t: 30, r: -3 },
          { w: 1.6, h: 100, l: 85, t: 55, r: 6 },
        ].map((scratch, i) => (
          <div
            key={i}
            className="absolute bg-white/5"
            style={{
              width: `${scratch.w}px`,
              height: `${scratch.h}px`,
              left: `${scratch.l}%`,
              top: `${scratch.t}%`,
              transform: `rotate(${scratch.r}deg)`,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Graffiti-style logo */}
          <div className="mb-6 sm:mb-8">
            <h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight"
              style={{
                textShadow: '4px 4px 0px rgba(37, 99, 235, 0.8), -2px -2px 0px rgba(0,0,0,0.5)',
                fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              CHUEF.COM
            </h2>
            <p 
              className="text-lg sm:text-xl md:text-2xl text-blue-400 font-bold uppercase tracking-wider mt-1"
              style={{
                textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                fontStyle: 'italic',
              }}
            >
              Talk Yo Shit!
            </p>
          </div>

          {/* Main headline */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase mb-4 sm:mb-6 tracking-tight leading-tight"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
            }}
          >
            Unleash Your Voice.<br className="hidden sm:block" /> Talk Yo Shit.
          </h1>

          {/* Tagline */}
          <p 
            className="text-base sm:text-lg md:text-xl text-gray-200 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-12 font-medium"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
            }}
          >
            Raw. Real. Unfiltered. Join the Movement.
          </p>

          {/* CTA Button - Grungy style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/chatroom"
              className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg sm:text-xl uppercase tracking-wider transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
              style={{
                clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              <span className="relative z-10">Join The Revolution</span>
              {/* Distressed edge effect */}
              <div className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </Link>
            
            <Link
              href="/login"
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/50 hover:border-white text-white font-bold text-base sm:text-lg uppercase tracking-wider transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Create Identity
            </Link>
          </div>

          {/* Bottom stats - grunge style */}
          <div className="mt-12 sm:mt-16 lg:mt-20 flex flex-wrap justify-center gap-6 sm:gap-12 lg:gap-16">
            {[
              { value: '24/7', label: 'Always Live' },
              { value: '∞', label: 'No Limits' },
              { value: 'FREE', label: 'No Sign-up' },
            ].map((stat, i) => (
              <div key={i} className="group text-center">
                <div 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-blue-400 transition-colors duration-300"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-xs sm:text-sm text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1"
                  style={{
                    textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      ></div>

      {/* Paint splats */}
      {/* <PaintSplat x="10%" y="20%" size={150} delay={1000} zIndex={5} />
      <PaintSplat x="50%" y="20%" size={150} delay={1000} zIndex={5} />
      <PaintSplat x="90%" y="20%" size={150} delay={1000} zIndex={5} /> */}
    </section>
  );
}
