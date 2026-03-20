"use client";

/**
 * Carte de joueur utilisée pendant la phase de révélation.
 * Affiche le nom du joueur, son état (pas vu / en cours / vu)
 * et permet de cliquer pour révéler le mot secret.
 */

import { Eye, EyeOff, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useMemeSounds } from "@/hooks/useMemeSounds";

interface PlayerCardProps {
  /** Nom du joueur */
  name: string;
  /** Indique si le joueur a déjà vu son mot */
  hasSeenWord: boolean;
  /** Indique si le joueur est actuellement en train de voir son mot */
  isRevealing: boolean;
  /** Callback au clic sur la carte */
  onClick: () => void;
}

export default function PlayerCard({
  name,
  hasSeenWord,
  isRevealing,
  onClick,
}: PlayerCardProps) {
  const { playPop } = useMemeSounds();
  /** Rendu de l'icône de statut en fonction de l'état du joueur */
  const getStatusIcon = () => {
    if (hasSeenWord) {
      return <Check className="w-5 h-5 text-green-400" />;
    }
    if (isRevealing) {
      return <Eye className="w-5 h-5 text-neon-yellow animate-pulse" />;
    }
    return <EyeOff className="w-5 h-5 text-zinc-500" />;
  };

  /** Texte de statut affiché sous le nom */
  const getStatusText = () => {
    if (hasSeenWord) return "Mot vu ✅";
    if (isRevealing) return "En train de voir...";
    return "Clique pour voir ton mot";
  };

  return (
    <motion.button
      whileHover={hasSeenWord ? {} : { scale: 1.02 }}
      whileTap={hasSeenWord ? {} : { scale: 0.95 }}
      onClick={() => {
        playPop();
        onClick();
      }}
      disabled={hasSeenWord}
      className={`
        group relative w-full p-4 brutal-border transition-all duration-300
        ${
          hasSeenWord
            ? "brutal-border-zinc bg-green-500/10 cursor-default opacity-60"
            : isRevealing
              ? "brutal-border-yellow bg-neon-yellow/10 brutal-shadow-yellow"
              : "brutal-border-zinc bg-zinc-900 brutal-shadow-zinc hover:brutal-border-violet hover:bg-violet-500/10 cursor-pointer brutal-active"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`text-lg font-bold tracking-tight ${
              hasSeenWord
                ? "text-green-400"
                : isRevealing
                  ? "text-neon-yellow"
                  : "text-white group-hover:text-violet-300"
            }`}
          >
            {name}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {getStatusText()}
          </span>
        </div>
        {getStatusIcon()}
      </div>
    </motion.button>
  );
}
