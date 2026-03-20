/**
 * Store Zustand pour la gestion de l'état global du jeu "La France à l'Imposteur".
 *
 * Gère les joueurs, les rôles, les phases de jeu et la distribution des mots.
 * Prépare le terrain pour du multijoueur futur.
 */

import { create } from "zustand";
import { getRandomWordPair, type WordPair } from "@/data/words";

/** Rôles possibles dans le jeu */
export type Role = "civil" | "impostor" | "mrwhite";

/** Phases de jeu possibles */
export type GamePhase = "lobby" | "revealing" | "discussion" | "finished";

/** Informations sur un joueur dans la partie */
export interface PlayerInfo {
  /** Nom du joueur */
  name: string;
  /** Rôle attribué (défini après le lancement de la partie) */
  role?: Role;
  /** Mot attribué au joueur (défini après le lancement de la partie) */
  word?: string;
  /** Indique si le joueur a vu son mot */
  hasSeenWord: boolean;
}

/** État complet du jeu */
interface GameState {
  /** Liste des joueurs */
  players: PlayerInfo[];
  /** Phase actuelle du jeu */
  gamePhase: GamePhase;
  /** Paire de mots sélectionnée pour la partie en cours */
  currentWordPair: WordPair | null;
  /** Activation du rôle Mr. White */
  mrWhiteEnabled: boolean;
  /** Index du joueur actuellement en train de voir son mot (-1 si aucun) */
  revealingPlayerIndex: number;

  // --- Actions ---

  /** Ajoute un joueur au lobby */
  addPlayer: (name: string) => boolean;
  /** Supprime un joueur du lobby par son index */
  removePlayer: (index: number) => void;
  /** Active/désactive le rôle Mr. White */
  toggleMrWhite: () => void;
  /** Lance la partie : distribue les rôles et les mots */
  startGame: () => void;
  /** Ouvre la révélation du mot pour un joueur donné */
  revealWord: (playerIndex: number) => void;
  /** Ferme la révélation du mot pour le joueur courant */
  hideWord: () => void;
  /** Passe à la phase de discussion */
  startDiscussion: () => void;
  /** Réinitialise le jeu pour retourner au lobby */
  resetGame: () => void;
}

/**
 * Mélange un tableau en place (algorithme de Fisher-Yates).
 * @param array Le tableau à mélanger
 * @returns Le tableau mélangé (même référence)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  gamePhase: "lobby",
  currentWordPair: null,
  mrWhiteEnabled: false,
  revealingPlayerIndex: -1,

  addPlayer: (name: string): boolean => {
    const trimmedName = name.trim();
    // Pas de nom vide ni de doublon
    if (!trimmedName) return false;
    const exists = get().players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) return false;

    set((state) => ({
      players: [...state.players, { name: trimmedName, hasSeenWord: false }],
    }));
    return true;
  },

  removePlayer: (index: number) => {
    set((state) => ({
      players: state.players.filter((_, i) => i !== index),
    }));
  },

  toggleMrWhite: () => {
    set((state) => ({ mrWhiteEnabled: !state.mrWhiteEnabled }));
  },

  startGame: () => {
    const { players, mrWhiteEnabled } = get();
    if (players.length < 3) return;

    const wordPair = getRandomWordPair();

    // Création de la liste des rôles
    const roles: Role[] = new Array(players.length).fill("civil");

    // Mélanger les indices pour une distribution aléatoire
    const shuffledIndices = shuffleArray(
      Array.from({ length: players.length }, (_, i) => i)
    );

    // Le premier indice mélangé reçoit le rôle d'imposteur
    roles[shuffledIndices[0]] = "impostor";

    // Si Mr. White activé et au moins 4 joueurs, le 2e indice reçoit Mr. White
    if (mrWhiteEnabled && players.length >= 4) {
      roles[shuffledIndices[1]] = "mrwhite";
    }

    // Attribution des mots selon les rôles
    const updatedPlayers: PlayerInfo[] = players.map((player, index) => {
      const role = roles[index];
      let word: string;

      switch (role) {
        case "impostor":
          word = wordPair.impostor;
          break;
        case "mrwhite":
          word = "🤫 Tu es Mr. White";
          break;
        default:
          word = wordPair.civilian;
          break;
      }

      return {
        ...player,
        role,
        word,
        hasSeenWord: false,
      };
    });

    set({
      players: updatedPlayers,
      currentWordPair: wordPair,
      gamePhase: "revealing",
      revealingPlayerIndex: -1,
    });
  },

  revealWord: (playerIndex: number) => {
    set({ revealingPlayerIndex: playerIndex });
  },

  hideWord: () => {
    const { revealingPlayerIndex } = get();
    if (revealingPlayerIndex === -1) return;

    set((state) => ({
      players: state.players.map((p, i) =>
        i === revealingPlayerIndex ? { ...p, hasSeenWord: true } : p
      ),
      revealingPlayerIndex: -1,
    }));
  },

  startDiscussion: () => {
    set({ gamePhase: "discussion" });
  },

  resetGame: () => {
    set({
      players: [],
      gamePhase: "lobby",
      currentWordPair: null,
      mrWhiteEnabled: false,
      revealingPlayerIndex: -1,
    });
  },
}));
