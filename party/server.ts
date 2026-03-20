import type * as Party from "partykit/server";
import { getRandomWordPair, WordPair } from "../src/data/words";

type Role = "Civil" | "Imposteur" | "Mr. White" | null;

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role: Role;
  word: string | null;
  hasVoted: boolean;
  isEliminated: boolean;
  score: number;
  lastPoints: number;
}

type GameState = "lobby" | "in_game" | "turn_typing" | "round_voting" | "voting" | "finished";

export default class ImposteurServer implements Party.Server {
  players: Map<string, Player> = new Map();
  persistentScores: Map<string, number> = new Map(); // pid -> score
  gameState: GameState = "lobby";
  votes: Map<string, string> = new Map(); // voterId -> targetId

  turnOrder: string[] = [];
  currentTurnIndex: number = 0;
  roundWords: Array<{ playerId: string; word: string; round: number }> = [];
  roundVotes: Map<string, boolean> = new Map(); // true = éliminer, false = refaire un tour
  currentRound: number = 1;
  lastFirstPlayerId: string | null = null;
  eliminatedPlayerId: string | null = null;
  timerEnd: number | null = null;
  restartTimeout: NodeJS.Timeout | null = null;
  isGameOver: boolean = false;

  constructor(readonly room: Party.Room) {}

    async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const rawName = url.searchParams.get("name") || "Anonyme";
    const pid = url.searchParams.get("pid");
    
    // Rechercher si un joueur avec le même pid est déjà là (pour transfert de host/stats)
    let existingPlayer: Player | null = null;
    let oldConnId: string | null = null;
    if (pid) {
      for (const [id, p] of this.players.entries()) {
        const connPid = (this.room.getConnection(id) as any)?.pid;
        if (connPid === pid) {
          existingPlayer = p;
          oldConnId = id;
          break;
        }
      }
    }

    // Si on a trouvé l'ancien, on le dégage d'abord pour prendre sa place proprement
    if (existingPlayer && oldConnId) {
      this.players.delete(oldConnId);
    }

    const uniqueName = this.getUniqueName(rawName, conn.id);
    const isHost = existingPlayer ? existingPlayer.isHost : (this.players.size === 0);
    const savedScore = pid ? (this.persistentScores.get(pid) || 0) : 0;
    
    const newPlayer: Player = {
      id: conn.id,
      name: uniqueName,
      isHost,
      role: existingPlayer ? existingPlayer.role : null,
      word: existingPlayer ? existingPlayer.word : null,
      hasVoted: existingPlayer ? existingPlayer.hasVoted : false,
      isEliminated: existingPlayer ? existingPlayer.isEliminated : false,
      score: savedScore,
      lastPoints: existingPlayer ? existingPlayer.lastPoints : 0
    };
    
    (conn as any).pid = pid;
    this.players.set(conn.id, newPlayer);

    // Envoyer son ID au joueur pour qu'il se reconnaisse
    conn.send(JSON.stringify({
      type: "identity",
      id: conn.id
    }));

    // Informer tout le monde
    this.broadcastState();
  }

  onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message);


      if (data.type === "update_name") {
        const player = this.players.get(sender.id);
        if (player) {
          const newName = this.getUniqueName(data.payload.name, sender.id);
          player.name = newName;
          this.broadcastState();
        }
      }

      if (data.type === "start_game") {
        const player = this.players.get(sender.id);
        const hasAnonymous = Array.from(this.players.values()).some(p => p.name === "Anonyme" || !p.name.trim());
        
        if (player?.isHost && this.players.size >= 3 && !hasAnonymous) {
          this.startGame();
        } else if (hasAnonymous) {
          sender.send(JSON.stringify({
            type: "error",
            message: "Faut que tout le monde mette un blaze avant de lancer !"
          }));
        }
      }

      // Small utility to switch from in_game to turn_typing (called by Host)
      if (data.type === "start_turn") {
        const player = this.players.get(sender.id);
        if (player?.isHost && this.gameState === "in_game") {
          this.gameState = "turn_typing";
          this.broadcastState();
        }
      }

      if (data.type === "submit_word") {
        if (this.gameState === "turn_typing") {
          const expectedPlayerId = this.turnOrder[this.currentTurnIndex];
          if (sender.id === expectedPlayerId) {
            this.roundWords.push({
              playerId: sender.id,
              word: data.payload.word,
              round: this.currentRound
            });
            
            this.currentTurnIndex++;
            
            // Si c'est la fin du tour
            if (this.currentTurnIndex >= this.turnOrder.length) {
              this.gameState = "round_voting";
              this.roundVotes.clear(); // Prépare les votes pour ce round
            }
            this.broadcastState();
          }
        }
      }

      if (data.type === "vote_round") {
        if (this.gameState === "round_voting") {
          const voter = this.players.get(sender.id);
          if (voter && !voter.isEliminated) {
            this.roundVotes.set(sender.id, data.payload.eliminate);
            this.broadcastState();

            // Vérifier si tous les non éliminés ont voté
            const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
            if (this.roundVotes.size === activePlayers.length) {
              // Compter
              let eliminateCount = 0;
              for (const v of this.roundVotes.values()) {
                if (v) eliminateCount++;
              }
              const majority = eliminateCount > activePlayers.length / 2;
              if (majority) {
                // On passe au vote final
                this.gameState = "voting";
                // Réinitialise les votes de la phase d'élimination
                for (const p of this.players.values()) {
                  p.hasVoted = false;
                }
                this.votes.clear();
              } else {
                // Nouveau tour
                this.gameState = "turn_typing";
                this.currentRound++;
                this.currentTurnIndex = 0;
              }
              this.broadcastState();
            }
          }
        }
      }

      if (data.type === "vote_player") {
        const voter = this.players.get(sender.id);
        if (voter && !voter.hasVoted && !voter.isEliminated && this.gameState === "voting") {
          this.votes.set(sender.id, data.payload.targetId);
          voter.hasVoted = true;
          this.broadcastState();
          this.checkVotes();
        }
      }

      // Small utility to switch from in_game to voting (can be called by Host)
      if (data.type === "start_voting") {
        const player = this.players.get(sender.id);
        if (player?.isHost && this.gameState === "in_game") {
          this.gameState = "voting";
          this.broadcastState();
        }
      }

      // Small utility to return to lobby
      if (data.type === "return_to_lobby") {
        const player = this.players.get(sender.id);
        if (player?.isHost) {
          this.gameState = "lobby";
          for (const p of this.players.values()) {
            p.role = null;
            p.word = null;
            p.hasVoted = false;
            p.isEliminated = false;
          }
          this.votes.clear();
          this.broadcastState();
        }
      }

      // Relance immédiate par l'hôte
      if (data.type === "force_restart") {
        const player = this.players.get(sender.id);
        if (player?.isHost && this.gameState === "finished") {
          this.tryRestartGame();
        }
      }
      
      if (data.type === "end_game") {
        const player = this.players.get(sender.id);
        if (player?.isHost && this.gameState === "finished") {
          if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
          }
          this.isGameOver = true;
          this.broadcastState();
        }
      }

    } catch (e) {
      console.error("Invalid message", e);
    }
  }

  tryRestartGame() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    // S'il reste au moins 3 joueurs, on relance, sinon retour au lobby
    if (this.players.size >= 3) {
      this.startGame();
    } else {
      this.gameState = "lobby";
      for (const p of this.players.values()) {
        p.role = null;
        p.word = null;
        p.hasVoted = false;
        p.isEliminated = false;
      }
      this.votes.clear();
      this.broadcastState();
    }
  }

  onClose(conn: Party.Connection) {
    const playerWhoLeft = this.players.get(conn.id);
    if (!playerWhoLeft) return;

    // Remove the player
    this.players.delete(conn.id);
    this.votes.delete(conn.id);

    // If host left, assign a new host
    if (this.players.size > 0 && !Array.from(this.players.values()).some(p => p.isHost)) {
      const firstPlayer = Array.from(this.players.values())[0];
      if (firstPlayer) firstPlayer.isHost = true;
    }

    // Inform everyone
    this.room.broadcast(JSON.stringify({
      type: "notification",
      message: `${playerWhoLeft.name} a quitté le gamos 💨`
    }));

    // Logic based on remaining players
    if (this.gameState !== "lobby" && this.gameState !== "finished") {
      if (this.players.size >= 3) {
        // More than 2 players remain (>= 3): restart round, keep scores
        this.room.broadcast(JSON.stringify({
          type: "notification",
          message: "Un joueur est parti, on relance la manche ! Les points sont gardés."
        }));
        this.startGame();
      } else {
        // 2 or fewer players remain: end game
        this.gameState = "finished";
        if (this.restartTimeout) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = null;
        }
        this.room.broadcast(JSON.stringify({
          type: "notification",
          message: "Pas assez de joueurs pour continuer, fin de la partie."
        }));
      }
    }

    this.broadcastState();
  }

  startGame() {
    this.gameState = "in_game";
    this.currentRound = 1;
    this.roundWords = [];
    this.roundVotes.clear();
    this.currentTurnIndex = 0;
    this.eliminatedPlayerId = null;
    this.timerEnd = null;
    this.isGameOver = false;

    // Reset properties for all players before calculating activePlayerIds
    for (const p of this.players.values()) {
      p.hasVoted = false;
      p.isEliminated = false;
      p.role = null;
      p.word = null;
      p.lastPoints = 0;
    }

    const activePlayerIds = Array.from(this.players.values()).map(p => p.id);
    let playerIds = [...activePlayerIds];
    
    // Fisher-Yates shuffle
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    const impostorId = playerIds[0];
    const mrWhiteId = playerIds.length >= 4 ? playerIds[1] : null;

    const wordPair = getRandomWordPair();
    // Aléatoire : on décide si on inverse les rôles des mots pour cette partie
    const civilWord = Math.random() > 0.5 ? wordPair.civilian : wordPair.impostor;
    const impostorWord = civilWord === wordPair.civilian ? wordPair.impostor : wordPair.civilian;

    for (const [id, player] of this.players.entries()) {
      if (id === impostorId) {
        player.role = "Imposteur";
        player.word = impostorWord;
      } else if (id === mrWhiteId) {
        player.role = "Mr. White";
        player.word = null;
      } else {
        player.role = "Civil";
        player.word = civilWord;
      }
    }
    // Shuffle intelligent pour l'ordre de passage (turnOrder)
    let turnOrder = [...activePlayerIds];
    for (let i = turnOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]];
    }

    // Décale si le premier a déjà commencé à la partie précédente
    if (this.lastFirstPlayerId && turnOrder[0] === this.lastFirstPlayerId && turnOrder.length > 1) {
      turnOrder.push(turnOrder.shift()!);
    }
    
    this.lastFirstPlayerId = turnOrder[0];
    this.turnOrder = turnOrder;

    this.votes.clear();
    this.broadcastState();
  }

  checkVotes() {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isEliminated);
    const allVoted = activePlayers.every(p => p.hasVoted);
    
    if (allVoted) {
      // Logic for elimination
      const voteCounts = new Map<string, number>();
      for (const targetId of this.votes.values()) {
        voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
      }
      
      let maxVotes = 0;
      let eliminatedId: string | null = null;
      
      for (const [id, count] of voteCounts.entries()) {
        if (count > maxVotes) {
          maxVotes = count;
          eliminatedId = id;
        } else if (count === maxVotes) {
          // In case of a tie, for now nobody point out explicitly, just keep the first or null.
          // Let's keep it simple and just eliminate the first one that reached maxVotes.
        }
      }

      if (eliminatedId) {
        const eliminatedPlayer = this.players.get(eliminatedId);
        if (eliminatedPlayer) {
          eliminatedPlayer.isEliminated = true;
        }
      }

      this.gameState = "finished";
      this.eliminatedPlayerId = eliminatedId;
      this.timerEnd = Date.now() + 30000;

      // Attribution des points
      const playersList = Array.from(this.players.values());
      const totalPlayers = playersList.length;
      const impostor = playersList.find(p => p.role === "Imposteur");
      const impostorId = impostor?.id;

      // Calcul pour l'imposteur
      if (impostorId) {
        let nonVotersCount = 0;
        for (const [voterId, targetId] of this.votes.entries()) {
          if (targetId !== impostorId && voterId !== impostorId) {
            nonVotersCount++;
          }
        }
        // Points pour l'imposteur : {10/totalPlayers} par personne n'ayant pas voté pour lui
        const pointsPerNonVoter = 10 / totalPlayers;
        const totalImpostorPoints = Math.round(nonVotersCount * pointsPerNonVoter);
        
        const impostorPlayer = this.players.get(impostorId);
        if (impostorPlayer) {
          impostorPlayer.score += totalImpostorPoints;
          impostorPlayer.lastPoints = totalImpostorPoints;
        }
      }

      // Calcul pour les autres (Civils et Mr. White)
      for (const [id, p] of this.players.entries()) {
        if (p.role !== "Imposteur") {
          const myVoteTarget = this.votes.get(id);
          if (myVoteTarget === impostorId) {
            // A trouvé l'imposteur
            p.score += 10;
            p.lastPoints = 10;
          } else {
            p.lastPoints = 0;
          }
        }
      }

      // Mettre à jour les scores persistants
      for (const conn of this.room.getConnections()) {
        const player = this.players.get(conn.id);
        const pid = (conn as any).pid;
        if (player && pid) {
          this.persistentScores.set(pid, player.score);
        }
      }

      this.broadcastState();

      // Démarrage du compte à rebours de 30s
      this.restartTimeout = setTimeout(() => {
        this.tryRestartGame();
      }, 30000);
    }
  }

  broadcastState() {
    this.room.broadcast(JSON.stringify({
      type: "state_update",
      payload: {
        players: Array.from(this.players.values()),
        gameState: this.gameState,
        roomCode: this.room.id,
        turnOrder: this.turnOrder,
        currentTurnIndex: this.currentTurnIndex,
        roundWords: this.roundWords,
        roundVotes: Array.from(this.roundVotes.entries()),
        currentRound: this.currentRound,
        eliminatedPlayerId: this.eliminatedPlayerId,
        timerEnd: this.timerEnd,
        votes: Array.from(this.votes.entries()),
        isGameOver: this.isGameOver,
      }
    }));
  }

  /**
   * Garantit un pseudo unique dans le salon
   */
  getUniqueName(requestedName: string, excludeId?: string): string {
    const name = requestedName.trim() || "Anonyme";
    let uniqueName = name;
    let counter = 2;

    const otherPlayers = Array.from(this.players.values())
      .filter(p => p.id !== excludeId);

    while (otherPlayers.some(p => p.name.toLowerCase() === uniqueName.toLowerCase())) {
      uniqueName = `${name} (${counter})`;
      counter++;
    }

    return uniqueName;
  }
}

