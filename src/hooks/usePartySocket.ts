"use client";

import usePartySocket from "partysocket/react";
import { useState, useCallback } from "react";
import { type Role, type GamePhase } from "@/store/gameStore";

export type OnlineGameState = {
  phase: GamePhase | "voting" | "turn_typing" | "round_voting";
  role?: Role;
  word?: string;
  players: { id: string; name: string; isHost: boolean; score: number; lastPoints: number }[];
  votes: Array<[string, string]>;
  myId?: string;
  turnOrder: string[];
  currentTurnIndex: number;
  roundWords: Array<{ playerId: string; word: string; round: number }>;
  roundVotes: Array<[string, boolean]>;
  currentRound: number;
  eliminatedPlayerId?: string;
  timerEnd?: number;
};

export function useGameSocket(roomCode: string, playerName: string) {
  const [gameState, setGameState] = useState<OnlineGameState>({
    phase: "lobby",
    players: [],
    turnOrder: [],
    currentTurnIndex: 0,
    roundWords: [],
    roundVotes: [],
    currentRound: 1,
    votes: [],
  });

  const socket = usePartySocket({
    // Pour l'instant, connexion locale en attendant de déployer PartyKit
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
    room: roomCode,
    query: { name: playerName },
    onMessage(evt) {
      try {
        const msg = JSON.parse(evt.data);
        
        switch (msg.type) {
          case "identity":
            setGameState(s => ({ ...s, myId: msg.id }));
            break;

          case "state_update":
            // On mappe le rôle du serveur vers celui de l'UI
            const serverPlayer = msg.payload.players.find((p: any) => p.id === msg.payload.myId || p.id === gameState.myId);
            
            // Mapping du rôle
            let mappedRole: Role | undefined = undefined;
            if (serverPlayer?.role === "Civil") mappedRole = "civil";
            if (serverPlayer?.role === "Imposteur") mappedRole = "impostor";
            if (serverPlayer?.role === "Mr. White") mappedRole = "mrwhite";

            // Mapping de la phase
            let mappedPhase = msg.payload.gameState;
            if (mappedPhase === "in_game") mappedPhase = "revealing";

            setGameState(s => ({
              ...s,
              phase: mappedPhase,
              players: msg.payload.players,
              role: mappedRole,
              word: serverPlayer?.word,
              turnOrder: msg.payload.turnOrder || [],
              currentTurnIndex: msg.payload.currentTurnIndex || 0,
              roundWords: msg.payload.roundWords || [],
              roundVotes: msg.payload.roundVotes || [],
              currentRound: msg.payload.currentRound || 1,
              eliminatedPlayerId: msg.payload.eliminatedPlayerId,
              timerEnd: msg.payload.timerEnd,
              votes: msg.payload.votes || [],
            }));
            break;
        }


      } catch (err) {
        console.error("Erreur parsing WebSocket message:", err);
      }
    }
  });

  const startGame = useCallback(() => {
    socket.send(JSON.stringify({ type: "start_game" }));
  }, [socket]);

  const vote = useCallback((targetId: string) => {
    socket.send(JSON.stringify({ type: "vote_player", payload: { targetId } }));
  }, [socket]);

  const startTurn = useCallback(() => {
    socket.send(JSON.stringify({ type: "start_turn" }));
  }, [socket]);

  const submitWord = useCallback((word: string) => {
    socket.send(JSON.stringify({ type: "submit_word", payload: { word } }));
  }, [socket]);

  const voteRoundEnd = useCallback((eliminate: boolean) => {
    socket.send(JSON.stringify({ type: "vote_round", payload: { eliminate } }));
  }, [socket]);

  const forceRestart = useCallback(() => {
    socket.send(JSON.stringify({ type: "force_restart" }));
  }, [socket]);

  return {
    socket,
    gameState,
    startGame,
    startTurn,
    submitWord,
    voteRoundEnd,
    forceRestart,
    vote
  };
}
