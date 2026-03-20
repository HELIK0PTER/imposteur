"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useGameSocket } from "@/hooks/usePartySocket";
import { useEffect, useState } from "react";
import { Users, Play, Eye, EyeOff, Gavel, Skull, Copy, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";

export default function OnlineRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const [playerName, setPlayerName] = useState<string | null>(null);
  const roomCode = params.roomCode as string;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const nameFromUrl = searchParams.get("name");
      const nameFromStorage = localStorage.getItem("imposteur_player_name");
      setPlayerName(nameFromUrl || nameFromStorage);
    }
  }, [searchParams]);

  const { gameState, startGame, vote, startTurn, submitWord, voteRoundEnd, forceRestart, updatePlayerName } = useGameSocket(roomCode, playerName || "");
  const { phase, players, role, word, myId, turnOrder, currentTurnIndex, roundWords, roundVotes, currentRound, notifications } = gameState;

  const myPlayer = players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost ?? false;

  const [showWord, setShowWord] = useState(false);
  const [hasVotedFor, setHasVotedFor] = useState<string | null>(null);
  const [typedWord, setTypedWord] = useState("");

  const [showQR, setShowQR] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [tempName, setTempName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);

  // Vérifier si on doit afficher le modal de nom
  useEffect(() => {
    const myP = players.find(p => p.id === myId);
    if (myP && (myP.name === "Anonyme" || !myP.name.trim())) {
      setShowNameModal(true);
    } else if (myP) {
      setShowNameModal(false);
    }
  }, [players, myId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/online?code=${roomCode}`);
    }
  }, [roomCode]);

  // Reset du vote local quand la phase change
  useEffect(() => {
    if (phase === "revealing" || phase === "lobby") {
      setHasVotedFor(null);
    }
  }, [phase]);

  // Pour copier le code du salon
  const [copied, setCopied] = useState(false);
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-dark text-white">
      <Header />
      
      {/* Notifications flottantes (toujours visibles) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="bg-zinc-900 border-2 border-violet-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm pointer-events-auto"
            >
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Fixation du Pseudo (toujours visible si nécessaire) */}
      {showNameModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-sm bg-zinc-900 border-2 border-violet-500 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(168,85,247,0.4)]"
          >
            <div className="text-center space-y-2">
              <h3 className="text-white font-black uppercase tracking-widest text-xl">Ton Blaze ? 💀</h3>
              <p className="text-zinc-400 text-sm font-mono">Tu peux pas entrer dans le gamos sans pseudo, frérot.</p>
            </div>

            <input 
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ex: Le Z..."
              maxLength={20}
              className="w-full bg-dark border-2 border-zinc-800 rounded-xl px-4 py-4 text-white text-center font-bold text-xl focus:outline-none focus:border-neon-yellow transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && tempName.trim()) {
                  updatePlayerName(tempName.trim());
                  localStorage.setItem("imposteur_player_name", tempName.trim());
                }
              }}
            />

            <button 
              onClick={() => {
                if (tempName.trim()) {
                  updatePlayerName(tempName.trim());
                  localStorage.setItem("imposteur_player_name", tempName.trim());
                }
              }}
              disabled={!tempName.trim()}
              className="w-full py-4 bg-neon-yellow text-zinc-900 font-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              C'EST PARTI
            </button>
          </motion.div>
        </div>
      )}

      {/* Contenu principal selon la phase */}
      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.main 
            key="lobby"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-8 mt-4"
          >
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-zinc-400 font-mono tracking-widest text-sm uppercase">Code du Salon</h2>
              <button 
                onClick={copyRoomCode}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-800 hover:border-violet-500 transition-colors group cursor-pointer"
              >
                <span className="text-4xl font-black tracking-widest text-neon-yellow">{roomCode}</span>
                <Copy className={`w-5 h-5 transition-colors ${copied ? "text-green-400" : "text-zinc-500 group-hover:text-violet-400"}`} />
              </button>
              {copied && <span className="text-green-400 text-xs font-mono mt-1">Copié !</span>}

              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                <QrCode className="w-4 h-4" />
                Afficher le QR Code
              </button>
            </div>

            <section className="w-full space-y-4">
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <h2 className="text-sm font-mono uppercase tracking-widest">
                    Joueurs ({players.length}/10)
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {players.length === 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center text-sm text-zinc-500 font-mono animate-pulse">
                    Connexion en cours...
                  </div>
                )}
                {players.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-white font-medium flex-1">
                      {p.name} {p.id === myId && "(Toi)"} {p.isHost && "👑"}
                    </span>
                    <div className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-neon-yellow text-[10px] font-mono font-bold">
                      {p.score || 0} PTS
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="w-full mt-4 space-y-3">
               {isHost ? (
                 <>
                   {players.length < 3 && players.length > 0 && (
                      <p className="text-center text-xs text-zinc-600 font-mono">
                        Il faut au minimum 3 joueurs pour lancer
                      </p>
                    )}
                   <button
                    onClick={startGame}
                    disabled={players.length < 3}
                    className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider
                      transition-all duration-300
                      ${
                        players.length >= 3
                          ? "bg-gradient-to-r from-violet-600 to-neon-yellow text-zinc-900 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] active:scale-[0.98]"
                          : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      }
                    `}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Lancer la partie
                    </span>
                  </button>
                 </>
               ) : (
                  <p className="text-center text-sm text-zinc-500 font-mono mt-4 animate-pulse">
                    En attente que l'hôte lance la partie...
                  </p>
               )}
            </section>

            {/* Modal QR Code (Lobby only) */}
            {showQR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-sm bg-zinc-900 border-2 border-neon-yellow/50 rounded-3xl p-6 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(250,204,21,0.2)]">
                  <button 
                    onClick={() => setShowQR(false)}
                    className="absolute -top-4 -right-4 bg-zinc-800 text-white p-2 rounded-full border-2 border-zinc-700 hover:bg-zinc-700 transition-colors z-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-white font-black uppercase tracking-widest text-xl">Rejoindre la partie</h3>
                    <p className="text-zinc-400 text-sm font-mono">Scannez ce code pour rejoindre automatiquement le salon <span className="text-neon-yellow font-bold">{roomCode}</span></p>
                  </div>

                  <div className="bg-white p-4 rounded-xl">
                    <QRCode value={joinUrl} size={200} />
                  </div>

                  <p className="text-zinc-600 text-xs font-mono text-center">
                    Ou allez sur <span className="text-zinc-300">{typeof window !== 'undefined' ? window.location.host : ''}/online</span>
                  </p>
                </div>
              </div>
            )}
          </motion.main>
        )}

        {phase === "revealing" && (
          <motion.div 
            key="revealing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center grow w-full px-4"
          >
            <AnimatePresence mode="wait">
                {!showWord ? (
                  <motion.button
                    key="hide"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    onClick={() => setShowWord(true)}
                    className="w-full max-w-sm aspect-square rounded-3xl bg-zinc-900 border-2 border-zinc-800 flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] group hover:border-violet-500 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Eye className="w-12 h-12 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                      Voir mon secret
                    </h2>
                    <p className="text-zinc-600 font-mono text-xs max-w-[200px] text-center">
                      Assure-toi que personne ne regarde ton écran.
                    </p>
                  </motion.button>
                ) : (
                  <motion.div
                    key="show"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm aspect-square rounded-3xl bg-violet-900 border-2 border-violet-500 flex flex-col items-center justify-center gap-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden p-6 text-center"
                  >
                    <button 
                      onClick={() => setShowWord(false)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/50 text-white hover:bg-zinc-800 transition-colors"
                    >
                      <EyeOff className="w-5 h-5" />
                    </button>
                    
                    <div className="space-y-2 relative z-10 w-full">
                      <p className="text-violet-300 font-mono text-sm uppercase tracking-widest bg-dark/50 inline-block px-3 py-1 rounded-lg">
                        Ton Rôle
                      </p>
                      <h2 className="text-3xl font-black uppercase tracking-widest text-neon-yellow">
                        {role === "civil" ? "Civil" : role === "impostor" ? "Imposteur" : "Mr. White"}
                      </h2>
                    </div>

                    <div className="space-y-4 w-full">
                       <p className="text-white font-mono text-sm uppercase tracking-widest">
                        Ton Mot Secret
                      </p>
                      <div className="w-full bg-dark/80 p-4 rounded-xl border border-violet-500/30">
                        <p className="text-2xl sm:text-3xl font-black text-white text-center break-words">
                          {word}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
            {isHost ? (
                <button 
                  onClick={startTurn}
                  className="fixed bottom-8 px-8 py-3 rounded-xl bg-neon-yellow text-zinc-900 font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,204,21,0.3)]"
                >
                  Commencer le tour
                </button>
            ) : (
               <p className="fixed bottom-8 text-zinc-500 font-mono text-xs text-center px-4">
                 En attente que le Host démarre le tour...
               </p>
            )}
          </motion.div>
        )}

        {phase === "turn_typing" && (
          <motion.main 
            key="turn_typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-md px-4 mt-6 gap-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-neon-yellow font-black uppercase tracking-widest text-xl">Tour {currentRound}</h2>
              {turnOrder[currentTurnIndex] === myId ? (
                <p className="text-lg font-bold text-white">C'est à toi de jouer !</p>
              ) : (
                <p className="text-zinc-400 font-mono">
                  En attente de <span className="text-violet-400 font-bold">{players.find(p => p.id === turnOrder[currentTurnIndex])?.name}</span>...
                </p>
              )}
            </div>

            {turnOrder[currentTurnIndex] === myId && (
               <div className="flex flex-col gap-4 bg-zinc-900 border-2 border-violet-500 p-6 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] w-full">
                 <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Ton mot pour ce tour</label>
                 <input 
                   type="text" 
                   value={typedWord}
                   onChange={(e) => setTypedWord(e.target.value)}
                   maxLength={20}
                   placeholder="Ex: Baguette"
                   className="w-full bg-dark border-2 border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-yellow transition-colors font-bold text-center"
                   autoFocus
                   onKeyDown={(e) => {
                     if (e.key === "Enter" && typedWord.trim()) {
                        submitWord(typedWord.trim());
                        setTypedWord("");
                     }
                   }}
                 />
                 <button
                   onClick={() => {
                     if (typedWord.trim().length > 0) {
                       submitWord(typedWord.trim());
                       setTypedWord("");
                     }
                   }}
                   disabled={typedWord.trim().length === 0}
                   className="w-full mt-2 py-3 bg-neon-yellow text-zinc-900 font-bold rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                 >
                   Envoyer
                 </button>
               </div>
            )}

            <div className="mt-8 space-y-4 w-full">
              <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 text-center mb-4">Mots du tour</h3>
              {turnOrder.map(playerId => {
                const p = players.find(x => x.id === playerId);
                if (!p) return null;
                const playerWords = roundWords.filter(rw => rw.playerId === playerId);
                const isCurrentlyTyping = turnOrder[currentTurnIndex] === playerId;
                return (
                  <div key={playerId} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${isCurrentlyTyping ? "bg-violet-900/40 border-violet-500" : "bg-zinc-900/50 border-zinc-800"}`}>
                    <span className={`font-bold ${isCurrentlyTyping ? "text-violet-300" : "text-white"}`}>{p.name} {p.id === myId && "(Toi)"}</span>
                    <div className="flex gap-2">
                       <div className="flex flex-wrap gap-2 justify-end">
                         {playerWords.map((w, i) => (
                           <span key={i} className="px-3 py-1 bg-dark text-neon-yellow rounded-lg font-bold text-sm">
                             {w.word}
                           </span>
                         ))}
                         {isCurrentlyTyping && playerWords.length === 0 && (
                            <span className="text-zinc-600 font-mono text-xs italic animate-pulse">Réfléchit...</span>
                         )}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.main>
        )}

        {phase === "round_voting" && (
          <motion.main 
            key="round_voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-md px-4 mt-12 gap-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center">
              <Gavel className="w-8 h-8 text-violet-400" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black uppercase tracking-widest text-white">Fin du tour</h2>
               <p className="text-zinc-400 font-mono text-sm px-4">Avez-vous repéré l'imposteur ou voulez-vous un mot de plus ?</p>
            </div>

            {(() => {
              const hasVoted = roundVotes.some(v => v[0] === myId);
              if (!hasVoted) return (
                <div className="flex flex-col gap-4 w-full">
                   <button 
                     onClick={() => voteRoundEnd(true)}
                     className="w-full py-4 rounded-xl border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase tracking-wider transition-all"
                   >
                     Passer au vote final
                   </button>
                   <button 
                     onClick={() => voteRoundEnd(false)}
                     className="w-full py-4 rounded-xl border-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider transition-all"
                   >
                     Nouveau tour
                   </button>
                </div>
              );
              return (
                <div className="w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 mt-4">
                   <p className="text-neon-yellow font-bold text-lg mb-2">Choix enregistré !</p>
                   <p className="text-zinc-500 font-mono text-sm">
                     En attente des autres... ({roundVotes.length}/{players.length})
                   </p>
                </div>
              );
            })()}

            <div className="w-full mt-8 text-left">
               <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-4 text-center">Rappel des mots</h3>
               <div className="flex flex-wrap gap-2 justify-center">
                 {roundWords.filter(rw => rw.round === currentRound).map((rw, i) => {
                   const p = players.find(x => x.id === rw.playerId);
                   return (
                     <div key={i} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2">
                       <span className="text-zinc-500 text-xs">{p?.name} :</span>
                       <span className="text-white font-bold text-sm">{rw.word}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </motion.main>
        )}

        {phase === "voting" && (
          <motion.main 
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-lg px-4 mt-4 pb-12"
          >
            <div className="flex flex-col items-center gap-2 mb-8 text-center">
              <Gavel className="w-12 h-12 text-neon-yellow" />
              <h1 className="text-2xl font-black uppercase tracking-widest">Phase de Vote</h1>
              <p className="text-sm font-mono text-zinc-400">Qui est l'imposteur selon toi ?</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {players.map((p) => {
                const isMe = p.id === myId;
                const isSelected = hasVotedFor === p.id;
                return (
                  <button
                     key={p.id}
                     disabled={isMe || hasVotedFor !== null}
                     onClick={() => {
                       setHasVotedFor(p.id);
                       vote(p.id);
                     }}
                     className={`
                        relative p-4 flex flex-col items-center gap-3 rounded-2xl border-2 transition-all duration-300
                        ${isMe ? "bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed" : ""}
                        ${!isMe && hasVotedFor === null ? "bg-zinc-900/80 border-zinc-700 hover:border-violet-500 hover:bg-violet-900/20 active:scale-95 cursor-pointer" : ""}
                        ${isSelected ? "bg-neon-yellow/20 border-neon-yellow text-neon-yellow shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-105 z-10" : ""}
                        ${hasVotedFor !== null && !isSelected && !isMe ? "bg-zinc-900/30 border-zinc-800 opacity-40 cursor-not-allowed" : ""}
                     `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${isSelected ? "bg-neon-yellow/20" : "bg-zinc-800"}`}>
                      <Skull className={`w-6 h-6 ${isSelected ? "text-neon-yellow" : "text-zinc-500"}`} />
                      <div className="absolute -right-1 -top-1 flex -space-x-1">
                        {gameState.votes?.filter(v => v[1] === p.id).map(([voterId]) => {
                          const voter = players.find(x => x.id === voterId);
                          return (
                            <div key={voterId} className="w-5 h-5 rounded-full bg-violet-500 border border-dark flex items-center justify-center text-[8px] font-black text-white">
                              {voter?.name.substring(0, 1).toUpperCase()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold block truncate max-w-[80px]">{p.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{p.score || 0}</span>
                      </div>
                      {isMe && <span className="text-xs font-mono text-zinc-500 block">(Toi)</span>}
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {roundWords.map((rw, i) => rw.playerId === p.id && (
                          <span key={i} className="px-2 py-0.5 bg-dark/50 text-neon-yellow rounded text-[10px] font-bold border border-neon-yellow/10">
                            {rw.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasVotedFor && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-8 p-4 rounded-xl bg-violet-600/20 border border-violet-500/30 text-center"
               >
                 <p className="text-violet-300 font-medium">Vote enregistré.</p>
                 <p className="text-zinc-400 font-mono text-xs mt-1">En attente des autres joueurs...</p>
               </motion.div>
            )}
          </motion.main>
        )}

        {phase === "finished" && (
          <motion.main 
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-md px-4 mt-6 gap-6 pb-12"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-widest text-white">Fin de la partie</h1>
              {gameState.eliminatedPlayerId ? (
                <p className="text-lg font-bold">
                  <span className="text-violet-400">{players.find(p => p.id === gameState.eliminatedPlayerId)?.name}</span> a été éliminé !
                </p>
              ) : (
                <p className="text-lg font-bold text-red-500">Pas assez de joueurs pour continuer !</p>
              )}
            </div>

            {gameState.eliminatedPlayerId && (
              <div className={`w-full p-6 rounded-2xl border-2 flex flex-col items-center gap-4 ${players.find(p => p.id === gameState.eliminatedPlayerId)?.role?.toLowerCase() === "imposteur" ? "bg-green-500/10 border-green-500/50" : "bg-red-500/10 border-red-500/50"}`}>
                <span className="text-5xl">{players.find(p => p.id === gameState.eliminatedPlayerId)?.role?.toLowerCase() === "imposteur" ? "🎉" : "💀"}</span>
                <div>
                  <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest mb-1">Son Rôle Était</p>
                  <p className={`text-2xl font-black uppercase tracking-widest ${players.find(p => p.id === gameState.eliminatedPlayerId)?.role?.toLowerCase() === "imposteur" ? "text-green-400" : "text-red-400"}`}>
                    {players.find(p => p.id === gameState.eliminatedPlayerId)?.role?.toUpperCase()}
                  </p>
                </div>
                {(() => {
                  const me = players.find(p => p.id === myId);
                  if (!me) return null;
                  const isMeImp = me.role?.toLowerCase() === "imposteur";
                  const points = me.lastPoints || 0;
                  return (
                    <div className="text-center">
                      <p className="font-bold text-white mt-2 text-lg">
                        {isMeImp ? (points === 0 ? "Tu as été démasqué !" : "Bien joué, tu les as bien berné !") : (points > 0 ? "Bravo tu as trouvé l'imposteur !" : "L'imposteur t'as bien fumé !")}
                      </p>
                      <p className="text-neon-yellow text-sm font-black uppercase mt-1">
                        +{points} POINTS GAGNÉS
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="w-full space-y-3 mt-4">
              <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500">Classement & Rôles</h3>
              <div className="flex flex-col gap-2">
                {players.sort((a,b) => (b.score || 0) - (a.score || 0)).map(p => (
                  <div key={p.id} className={`flex flex-col items-start p-3 bg-zinc-900 border rounded-xl gap-1 ${p.id === gameState.eliminatedPlayerId ? "border-red-500/50 bg-red-500/5" : "border-zinc-800"}`}>
                    <div className="flex justify-between w-full items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{p.name} {p.id === myId && "(Toi)"}</span>
                        <span className="text-[10px] text-neon-yellow font-black uppercase tracking-tighter">{p.score} PTS</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded-md ${p.role?.toLowerCase() === "imposteur" ? "bg-red-500/20 text-red-400" : p.role?.toLowerCase() === "mr. white" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                        {(p.role || "???").toUpperCase()}
                      </span>
                    </div>
                    {(p as any).word && <span className="text-xs font-bold text-zinc-500 italic">Mot: {(p as any).word}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full mt-4 flex flex-col gap-3">
                {players.length >= 3 && (
                  <>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 relative">
                      <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 30, ease: "linear" }} className="absolute left-0 top-0 h-full bg-neon-yellow" />
                    </div>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Relance dans 30 secondes...</p>
                  </>
                )}
               <div className="flex gap-4 mt-4 w-full">
                 <button onClick={() => router.push("/online")} className="flex-1 py-3 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all">Quitter</button>
                 {isHost && players.length >= 3 && (
                   <button onClick={() => forceRestart()} className="flex-1 py-3 border border-violet-500 bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 font-bold rounded-xl transition-all">Relancer direct</button>
                 )}
               </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
