'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  //I want to retrieve this data from Supabase in the later future. I want to retrieve the names of the actual chatrooms available and it is then displayed in this hero section accordingly.
  const cards = [
    { bg: 'from-emerald-400 to-cyan-500', icon: '🌍', title: 'Global Pulse', desc: 'Real-time voices from every corner' },
    { bg: 'from-violet-400 to-purple-600', icon: '🔐', title: 'Your Space', desc: 'Unlock premium with an account' },
    { bg: 'from-rose-400 to-orange-500', icon: '💬', title: 'Zero Barriers', desc: 'Jump in anonymously, instantly' },
  ];

  const handleCardClick = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  // Calculate card position based on its relative position to active card
  const getCardStyle = (index: number) => {
    const total = cards.length;
    // How many positions behind the active card is this card?
    const offset = (index - activeIndex + total) % total;
    
    // Stack positions: 0 = front/top, 1 = middle, 2 = back
    const positions = [
      { rotate: 0, translateY: 0, z: 3 },      // Front (active)
      { rotate: 6, translateY: 8, z: 2 },      // Middle
      { rotate: -12, translateY: 0, z: 1 },    // Back
    ];
    
    return positions[offset];
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-black overflow-hidden">
      {/* Morphing blob background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 dark:from-cyan-500/20 dark:to-blue-700/20 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-fuchsia-400/30 to-purple-600/30 dark:from-fuchsia-500/20 dark:to-purple-700/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-transparent via-amber-200/20 to-transparent dark:via-amber-500/10 rounded-full blur-2xl animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* Floating geometric particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 opacity-60"
            style={{
              left: `${10 + (i * 7.5)}%`,
              top: `${20 + Math.sin(i) * 30}%`,
              transform: `rotate(${i * 30}deg)`,
              clipPath: i % 3 === 0 ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : i % 3 === 1 ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'circle(50%)',
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Asymmetric split layout */}
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 items-center">
            
            {/* Left content - text heavy */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200/50 dark:border-white/10 rounded-full mb-8 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Now</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-6">
                <span className="block text-slate-900 dark:text-white">Where Ideas</span>
                <span className="block mt-2 bg-[length:200%_auto] bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-500 animate-[gradient_3s_linear_infinite]">
                  Collide Freely
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Chuef.com — the uncharted territory of real-time discourse. No filters. No algorithms. Just raw, authentic human connection.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="group relative px-8 py-4 overflow-hidden rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative text-white flex items-center justify-center gap-2">
                    Dive In
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                <Link 
                  href="/login"
                  className="group px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-transparent hover:bg-white/50 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30"
                >
                  Create Identity
                </Link>
              </div>
            </div>

            {/* Right content - interactive card stack */}
            <div className="order-1 lg:order-2 relative h-[400px] sm:h-[450px] lg:h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Stacked rotating cards - click to cycle */}
                <div 
                  className="relative w-full max-w-sm aspect-[3/4] cursor-pointer"
                  onClick={handleCardClick}
                >
                  {cards.map((card, i) => {
                    const style = getCardStyle(i);
                    return (
                      <div
                        key={i}
                        className="absolute inset-0 p-6 sm:p-8 rounded-3xl shadow-2xl transition-all duration-500 ease-out hover:scale-105 group"
                        style={{
                          transform: `rotate(${style.rotate}deg) translateY(${style.translateY}px)`,
                          zIndex: style.z,
                        }}
                      >
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.bg} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                        <div className="absolute inset-0 rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-sm"></div>
                        <div className="relative h-full flex flex-col justify-end text-white">
                          <span className="text-5xl sm:text-6xl mb-4 drop-shadow-lg">{card.icon}</span>
                          <h3 className="text-2xl sm:text-3xl font-bold mb-2">{card.title}</h3>
                          <p className="text-white/80 text-sm sm:text-base">{card.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom ticker/stats bar */}
          <div className="mt-16 lg:mt-24 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            {[
              { value: '24/7', label: 'Always Live' },
              { value: '∞', label: 'Possibilities' },
              { value: '0', label: 'Sign-up Required' },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-900 dark:from-white dark:to-slate-400 group-hover:from-cyan-500 group-hover:to-purple-600 transition-all duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          to { transform: translateY(-20px) rotate(calc(var(--rotation, 0deg) + 180deg)); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </section>
  );
}
