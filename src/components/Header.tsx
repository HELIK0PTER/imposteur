"use client";

/**
 * Header du jeu "La France à l'Imposteur".
 * Affiche le titre avec un style mème/brutaliste et des effets néon.
 */

import { Skull } from "lucide-react";

export default function Header() {
  return (
    <header className="relative w-full py-6 px-4 text-center">
      {/* Glow effect derrière le titre */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-violet-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Skull className="w-8 h-8 text-neon-yellow animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-neon-yellow">La France</span>{" "}
            <span className="text-white">à</span>{" "}
            <span className="text-violet-400">l&apos;Imposteur</span>
          </h1>
          <Skull className="w-8 h-8 text-neon-yellow animate-pulse" />
        </div>
        <p className="text-sm md:text-base text-zinc-500 font-mono tracking-widest uppercase">
          Le jeu le plus crousty de France 🇫🇷
        </p>
      </div>
    </header>
  );
}
