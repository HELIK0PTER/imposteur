"use client";

/**
 * Page de discussion / vote.
 *
 * Affiche un écran de transition pour la phase de discussion
 * où les joueurs débattent et tentent de trouver l'imposteur.
 * Permet de relancer une nouvelle partie.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  RotateCcw,
  Users,
  Swords,
  Skull,
  X,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useMemeSounds } from "@/hooks/useMemeSounds";
import Header from "@/components/Header";

export default function DiscussionPage() {
  const router = useRouter();
  const { players, gamePhase, resetGame } = useGameStore();
  const { playBuzzer, playPop } = useMemeSounds();
  const [eliminatedPlayer, setEliminatedPlayer] = useState<string | null>(null);

  // Redirection si pas en phase de discussion
  useEffect(() => {
    if (gamePhase !== "discussion") {
      router.replace("/");
    }
  }, [gamePhase, router]);

  if (gamePhase !== "discussion") return null;

  /** Retour au lobby avec réinitialisation */
  const handleNewGame = () => {
    playPop();
    resetGame();
    router.push("/local");
  };

  /** Éliminer un joueur */
  const handleEliminate = (name: string) => {
    playBuzzer();
    setEliminatedPlayer(name);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-dark">
      <Header size="small" />

      <main className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-8">
        {/* Animation d'entrée */}
        <div className="relative w-full text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Glow background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-8">
            <div className="w-48 h-48 bg-violet-500/20 rounded-full blur-[80px]" />
          </div>

          <div className="relative">
            <Swords className="w-16 h-16 text-neon-yellow mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
              La discussion <br />
              <span className="text-violet-400">commence</span> 🔥
            </h2>
            <p className="text-sm text-zinc-500 font-mono mt-3 max-w-xs mx-auto">
              Débattez, argumentez, mentez... Trouvez l&apos;imposteur parmi vous !
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="p-4 brutal-border brutal-border-zinc bg-zinc-900 brutal-shadow-zinc">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-6 h-6 text-violet-400 shrink-0" />
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  Chacun décrit son mot
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-1 font-bold">
                  Sans le dire directement ! L&apos;imposteur doit bluffer avec un mot différent 🎭
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 brutal-border brutal-border-zinc bg-zinc-900 brutal-shadow-zinc">
            <div className="flex items-start gap-4">
              <Users className="w-6 h-6 text-neon-yellow shrink-0" />
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  Votez pour éliminer
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-1 font-bold">
                  Après la discussion, votez pour celui que vous pensez être l&apos;imposteur 🗳️
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center gap-2 text-zinc-400 mb-4">
            <Users className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
              Cliquez pour éliminer
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => (
              <button
                key={player.name}
                onClick={() => handleEliminate(player.name)}
                className="p-4 brutal-border brutal-border-zinc bg-zinc-900 brutal-shadow-zinc 
                  hover:bg-red-600 hover:brutal-border-red hover:brutal-shadow-red hover:text-white
                  text-center text-white font-black text-sm uppercase tracking-wider
                  transition-all duration-200 brutal-active group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Skull className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  {player.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bouton nouvelle partie */}
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <button
            onClick={handleNewGame}
            className="w-full py-4 brutal-border brutal-shadow-violet bg-violet-600 text-white
              font-black text-lg uppercase tracking-wider brutal-active transition-all duration-300 hover:bg-violet-500"
          >
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Nouvelle Partie
            </span>
          </button>

          <button
            onClick={() => {
              playPop();
              resetGame();
              router.push("/local");
            }}
            className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-red-400 font-mono uppercase font-bold transition-all duration-200 mt-2 hover:bg-red-500/10 p-2 rounded-lg w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Quitter le gamos
          </button>
        </div>
      </main>

      {/* Pop-up d'élimination */}
      <AnimatePresence>
        {eliminatedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-md bg-red-600 brutal-border brutal-border-red p-8 flex flex-col items-center justify-center text-center brutal-shadow-red animate-shake-brutal"
            >
              <button
                onClick={() => setEliminatedPlayer(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white brutal-active transition-colors p-2 brutal-border border-transparent hover:border-white hover:bg-black/20"
              >
                <X className="w-6 h-6" />
              </button>
              
              <Skull className="w-24 h-24 text-white mb-6 animate-pulse" />
              
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                ÉLiminé(e) !
              </h2>
              
              <div className="px-4 py-2 brutal-border bg-black text-neon-yellow text-2xl font-black uppercase tracking-widest mt-4 -rotate-2">
                {eliminatedPlayer}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
