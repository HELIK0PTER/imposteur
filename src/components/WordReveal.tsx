"use client";

/**
 * Overlay plein écran pour la révélation secrète du mot d'un joueur.
 * S'affiche au-dessus de tout avec un fond flouté.
 * Le joueur voit son mot puis clique pour le cacher.
 */

import { ShieldAlert, ShieldCheck, Ghost, X } from "lucide-react";
import { useEffect } from "react";
import { useMemeSounds } from "@/hooks/useMemeSounds";
import type { Role } from "@/store/gameStore";

interface WordRevealProps {
  /** Nom du joueur */
  playerName: string;
  /** Mot secret à afficher */
  word: string;
  /** Rôle du joueur (pour adapter le style) */
  role: Role;
  /** Callback pour fermer l'overlay */
  onClose: () => void;
}

export default function WordReveal({
  playerName,
  word,
  role,
  onClose,
}: WordRevealProps) {
  const { playVineBoom, playPop } = useMemeSounds();

  useEffect(() => {
    if (role === "impostor") {
      playVineBoom();
    }
  }, [role, playVineBoom]);
  /** Configuration du style selon le rôle */
  const getRoleConfig = () => {
    switch (role) {
      case "impostor":
        return {
          icon: <ShieldAlert className="w-16 h-16 text-red-500" />,
          label: "Imposteur",
          labelColor: "text-red-500",
          borderColor: "brutal-border-red",
          glowColor: "brutal-shadow-red",
          bgGlow: "bg-red-500/10",
        };
      case "mrwhite":
        return {
          icon: <Ghost className="w-16 h-16 text-white" />,
          label: "Mr. White",
          labelColor: "text-white",
          borderColor: "brutal-border",
          glowColor: "brutal-shadow",
          bgGlow: "bg-white/5",
        };
      default:
        return {
          icon: <ShieldCheck className="w-16 h-16 text-violet-400" />,
          label: "Civil",
          labelColor: "text-violet-400",
          borderColor: "brutal-border-violet",
          glowColor: "brutal-shadow-violet",
          bgGlow: "bg-violet-500/10",
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fond flouté */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Contenu de la révélation */}
      <div
        className={`
          relative z-10 mx-4 w-full max-w-md p-8 brutal-border
          bg-zinc-950 ${config.borderColor} ${config.glowColor}
          animate-in fade-in zoom-in-95 duration-300 animate-shake-brutal
        `}
      >
        {/* Bouton fermer */}
        <button
          onClick={() => { playPop(); onClose(); }}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors brutal-active"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icône du rôle */}
          {config.icon}

          {/* Nom du joueur */}
          <div>
            <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">
              Tour de
            </p>
            <p className="text-2xl font-black text-white mt-1">{playerName}</p>
          </div>

          {/* Badge du rôle — visible seulement pour le joueur */}
          <div
            className={`px-4 py-1.5 rounded-full border ${config.borderColor} ${config.bgGlow}`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider ${config.labelColor}`}
            >
              {config.label}
            </span>
          </div>

          {/* Le mot secret */}
          <div className="w-full p-6 brutal-border brutal-border-zinc bg-zinc-900 border border-zinc-800 brutal-shadow-zinc relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <p className="text-xs text-zinc-500 font-mono mb-2 uppercase tracking-widest relative z-10">
              Ton mot secret
            </p>
            <p className="text-3xl font-black text-neon-yellow tracking-tight">
              {word}
            </p>
          </div>

          {/* Avertissement */}
          <p className="text-xs text-zinc-600 font-mono">
            ⚠️ Mémorise ton mot, puis ferme cet écran
          </p>

          {/* Bouton de confirmation */}
          <button
            onClick={() => { playPop(); onClose(); }}
            className="w-full py-4 px-6 brutal-border brutal-shadow-violet brutal-active font-bold text-lg uppercase tracking-wider
              bg-violet-600 hover:bg-violet-500 text-white
              transition-all duration-200"
          >
            J&apos;ai vu mon mot 👀
          </button>
        </div>
      </div>
    </div>
  );
}
