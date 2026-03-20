"use client";

/**
 * Page d'accueil / Lobby du jeu "La France à l'Imposteur".
 *
 * Permet aux joueurs de :
 * - Entrer leurs noms (minimum 3)
 * - Activer/désactiver le rôle Mr. White
 * - Lancer la partie
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Ghost, Play, Users, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useMemeSounds } from "@/hooks/useMemeSounds";
import Header from "@/components/Header";

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const { playPop } = useMemeSounds();

  const { players, mrWhiteEnabled, addPlayer, removePlayer, toggleMrWhite, startGame } =
    useGameStore();

  /** Gère l'ajout d'un joueur */
  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      setError("Entre un nom, boloss 💀");
      return;
    }
    const success = addPlayer(playerName);
    if (success) {
      setPlayerName("");
      setError("");
      playPop();
    } else {
      setError("Ce joueur existe déjà, frérot 🤡");
    }
  };

  /** Gère la soumission du formulaire (appui sur Entrée) */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  /** Lance la partie et redirige vers la page de jeu */
  const handleStartGame = () => {
    startGame();
    router.push("/game");
  };

  const canStart = players.length >= 3;

  return (
    <div className="flex flex-col items-center min-h-svh bg-dark">
      <Header size="small" />

      <main className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-8">
        {/* Section ajout de joueurs */}
        <section className="w-full space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-4 h-4" />
            <h2 className="text-sm font-mono uppercase tracking-widest">
              Joueurs ({players.length}/10)
            </h2>
          </div>

          {/* Input + bouton */}
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nom du joueur..."
              maxLength={20}
              className="flex-1 px-4 py-3 brutal-border brutal-border-zinc bg-zinc-900
                text-white placeholder:text-zinc-600 font-medium
                focus:outline-none focus:brutal-border-violet focus:brutal-shadow-violet
                transition-all duration-200"
            />
            <button
              onClick={handleAddPlayer}
              disabled={players.length >= 10}
              className="px-4 py-3 brutal-border brutal-border-zinc brutal-shadow-zinc brutal-active bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600
                text-white font-bold transition-all duration-200
                disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </section>

        {/* Liste des joueurs */}
        {players.length > 0 && (
          <section className="w-full space-y-2">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player.name}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group flex items-center justify-between p-3 brutal-border bg-zinc-900 
                    border-zinc-800 hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center brutal-border brutal-border-zinc
                      bg-violet-500/20 text-violet-400 text-xs font-bold font-mono">
                      {index + 1}
                    </span>
                    <span className="text-white font-bold uppercase tracking-wider">{player.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      removePlayer(index);
                      playPop();
                    }}
                    className="p-2 brutal-border brutal-border-zinc hover:brutal-border-red hover:bg-red-500 hover:text-white
                      transition-all duration-200 text-zinc-500 brutal-active"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        )}

        {/* Toggle Mr. White */}
        <section className="w-full">
          <button
            onClick={() => {
              toggleMrWhite();
              playPop();
            }}
            className={`w-full flex items-center justify-between p-4 brutal-border brutal-active
              transition-all duration-300 ${
                mrWhiteEnabled
                  ? "brutal-border-zinc brutal-shadow-zinc bg-white/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
          >
            <div className="flex items-center gap-3">
              <Ghost
                className={`w-5 h-5 ${
                  mrWhiteEnabled ? "text-white" : "text-zinc-600"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${
                    mrWhiteEnabled ? "text-white" : "text-zinc-400"
                  }`}
                >
                  Mr. White
                </p>
                <p className="text-xs text-zinc-600 font-mono">
                  Un joueur ne reçoit aucun mot (min. 4 joueurs)
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${
                mrWhiteEnabled ? "bg-white" : "bg-zinc-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-all duration-300 ${
                  mrWhiteEnabled
                    ? "translate-x-5 bg-zinc-900"
                    : "translate-x-0 bg-zinc-500"
                }`}
              />
            </div>
          </button>
        </section>

        {/* Bouton de lancement */}
        <section className="w-full space-y-3">
          {!canStart && (
            <p className="text-center text-xs text-zinc-600 font-mono">
              Il faut au minimum 3 joueurs pour lancer la partie
            </p>
          )}
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`w-full py-4 brutal-border brutal-shadow-violet brutal-active font-black text-lg uppercase tracking-wider
              transition-all duration-300
              ${
                canStart
                  ? "bg-linear-to-r from-violet-600 to-neon-yellow text-zinc-900"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50 brutal-shadow-zinc"
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Lancer la partie
            </span>
          </button>
        </section>

        {/* Bouton retour accueil */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs text-zinc-600 hover:text-white font-mono uppercase font-bold transition-all duration-200 mt-2 hover:bg-white/5 p-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au menu principal
        </button>
      </main>
    </div>
  );
}
