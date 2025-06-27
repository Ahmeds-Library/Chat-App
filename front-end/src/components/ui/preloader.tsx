
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, Sparkles } from 'lucide-react';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    });

    // Initial setup
    gsap.set([logoRef.current, textRef.current, progressRef.current], {
      opacity: 0,
      y: 30
    });

    // Logo animation
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    // Sparkles animation
    .to(sparkleRefs.current, {
      opacity: 1,
      scale: 1,
      rotation: 360,
      duration: 0.6,
      stagger: 0.1,
      ease: "elastic.out(1, 0.3)"
    }, "-=0.4")
    // Text animation
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
    // Progress bar animation
    .to(progressRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.2");

    // Progress animation
    const progressTl = gsap.timeline({ delay: 1 });
    progressTl.to({}, {
      duration: 2,
      ease: "power2.out",
      onUpdate: function() {
        const prog = Math.round(this.progress() * 100);
        setProgress(prog);
      }
    });

    // Fade out animation
    progressTl.to(preloaderRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in",
      delay: 0.5
    });

    return () => {
      tl.kill();
      progressTl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900/20 dark:via-gray-900 dark:to-blue-900/20 flex items-center justify-center"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      {/* Floating Sparkles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          ref={(el) => sparkleRefs.current[i] = el}
          className="absolute opacity-0"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${25 + (i % 3) * 20}%`,
            transform: 'scale(0)'
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>
      ))}

      <div className="text-center space-y-8">
        {/* Logo Section */}
        <div ref={logoRef} className="flex flex-col items-center space-y-4">
          {/* Main Logo */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-3xl bg-green-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-2xl bg-green-400/20 animate-pulse" />
          </div>

          {/* App Name */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-blue-600 bg-clip-text text-transparent">
              ChatApp
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              Enhanced Messaging Experience
            </p>
          </div>
        </div>

        {/* Attribution */}
        <div ref={textRef} className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              Made by Mirza Ahmad Hassan
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600" />
          </div>
        </div>

        {/* Progress Section */}
        <div ref={progressRef} className="space-y-3 w-64 mx-auto">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
          </div>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
