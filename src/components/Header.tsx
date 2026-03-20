"use client";

/**
 * Header du jeu "La France à l'Imposteur".
 * Affiche le titre avec un style mème/brutaliste et des effets néon.
 */

import { Skull } from "lucide-react";

interface HeaderProps {
  size?: "small" | "large";
}

export default function Header({ size = "large" }: HeaderProps) {
  const isSmall = size === "small";

  return (
    <header className={`relative w-full ${isSmall ? "py-3" : "py-6"} px-4 text-center transition-all duration-300`}>
      {/* Glow effect derrière le titre */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`${isSmall ? "w-32 h-32 opacity-10" : "w-64 h-64 bg-violet-500/20"} rounded-full blur-[80px]`} />
      </div>

      <div className={`relative flex flex-col items-center ${isSmall ? "gap-0" : "gap-2"}`}>
        <div className="flex items-center gap-3">
          <Skull className={`${isSmall ? "w-5 h-5" : "w-8 h-8"} text-neon-yellow animate-pulse`} />
          <h1 className={`${isSmall ? "text-xl md:text-2xl" : "text-3xl md:text-5xl"} font-black uppercase tracking-tighter transition-all duration-300`}>
            <span className="text-neon-yellow">La France</span>{" "}
            <span className="text-white">à</span>{" "}
            <span className="text-violet-400">l&apos;Imposteur</span>
          </h1>
          <Skull className={`${isSmall ? "w-5 h-5" : "w-8 h-8"} text-neon-yellow animate-pulse`} />
        </div>
        {!isSmall && (
          <p className="text-sm md:text-base text-zinc-500 font-mono tracking-widest uppercase">
            Le jeu le plus crousty de France 🇫🇷
          </p>
        )}
      </div>
    </header>
  );
}
