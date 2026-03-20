"use client";

/**
 * Page de jeu — Phase de révélation séquentielle.
 *
 * Chaque joueur clique sur son nom pour voir son mot en secret,
 * puis ferme l'overlay avant de passer le téléphone au joueur suivant.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MessageSquare, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useMemeSounds } from "@/hooks/useMemeSounds";
import Header from "@/components/Header";
import PlayerCard from "@/components/PlayerCard";
import WordReveal from "@/components/WordReveal";

export default function GamePage() {
  const router = useRouter();
  const {
    players,
    gamePhase,
    revealingPlayerIndex,
    revealWord,
    hideWord,
    startDiscussion,
  } = useGameStore();

  const { playPop } = useMemeSounds();

  // Redirection si pas en phase de jeu
  useEffect(() => {
    if (gamePhase === "lobby") {
      router.replace("/");
    }
  }, [gamePhase, router]);

  if (gamePhase === "lobby") return null;

  /** Nombre de joueurs ayant vu leur mot */
  const seenCount = players.filter((p) => p.hasSeenWord).length;
  const allSeen = seenCount === players.length;
  /** Progression en pourcentage */
  const progressPercent = Math.round((seenCount / players.length) * 100);

  /** Joueur actuellement en révélation */
  const revealingPlayer =
    revealingPlayerIndex >= 0 ? players[revealingPlayerIndex] : null;

  /** Passer à la discussion */
  const handleStartDiscussion = () => {
    playPop();
    startDiscussion();
    router.push("/game/discussion");
  };

  return (
    <div className="flex flex-col items-center min-h-svh bg-dark">
      <Header size="small" />

      <main className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-6">
        {/* Instructions */}
        <div className="w-full text-center space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Distribution des mots 🤫
          </h2>
          <p className="text-sm text-zinc-500 font-mono">
            Chaque joueur clique sur son nom pour voir son mot en secret
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-zinc-500 font-mono font-bold uppercase">
            <span>
              {seenCount}/{players.length} joueurs
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-4 brutal-border brutal-border-zinc bg-zinc-900 overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-violet-600 border-r-4 border-white transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="w-full space-y-3">
          {players.map((player, index) => (
            <PlayerCard
              key={player.name}
              name={player.name}
              hasSeenWord={player.hasSeenWord}
              isRevealing={revealingPlayerIndex === index}
              onClick={() => {
                if (!player.hasSeenWord) {
                  revealWord(index);
                }
              }}
            />
          ))}
        </div>

        {/* Bouton pour passer à la discussion (visible quand tous ont vu) */}
        {allSeen && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">
                Tout le monde a vu son mot !
              </span>
            </div>
            <button
              onClick={handleStartDiscussion}
              className="w-full py-4 brutal-border brutal-shadow-yellow brutal-active font-black text-lg uppercase tracking-wider
                bg-neon-yellow text-zinc-900 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Commencer la discussion
              </span>
            </button>
          </div>
        )}

        <button
          onClick={() => {
            playPop();
            useGameStore.getState().resetGame();
            router.push("/local");
          }}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 brutal-border border-transparent hover:border-red-500
            font-mono uppercase font-bold transition-all duration-200 mt-4 brutal-active"
        >
          <ArrowLeft className="w-4 h-4" />
          Quitter la partie
        </button>
      </main>

      {/* Overlay de révélation */}
      {revealingPlayer && revealingPlayer.role && revealingPlayer.word && (
        <WordReveal
          playerName={revealingPlayer.name}
          word={revealingPlayer.word}
          role={revealingPlayer.role}
          onClose={hideWord}
        />
      )}
    </div>
  );
}
