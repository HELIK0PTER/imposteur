"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Users, Hash, AlertTriangle, ArrowRight, QrCode, X } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import Header from "@/components/Header";

/**
 * Génère un code de salon aléatoire (5 lettres)
 */
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function OnlineEntryPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("imposteur_player_name");
      if (savedName) setPlayerName(savedName);

      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      if (codeParam) {
        const upperCode = codeParam.toUpperCase();
        setRoomCodeInput(upperCode);
        localStorage.setItem("imposteur_last_room", upperCode);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError("Il te faut un pseudo, boloss 💀");
      return;
    }
    localStorage.setItem("imposteur_player_name", playerName.trim());
    const code = generateRoomCode();
    localStorage.setItem("imposteur_last_room", code);
    router.push(`/online/${code}?name=${encodeURIComponent(playerName.trim())}`);
  };

  const handleJoinRoom = () => {
    if (!roomCodeInput.trim() || roomCodeInput.length < 3) {
      setError("Entre un code de salon valide frère");
      return;
    }
    const cleanCode = roomCodeInput.toUpperCase().trim();
    localStorage.setItem("imposteur_last_room", cleanCode);
    if (playerName.trim()) {
      localStorage.setItem("imposteur_player_name", playerName.trim());
      router.push(`/online/${cleanCode}?name=${encodeURIComponent(playerName.trim())}`);
    } else {
      router.push(`/online/${cleanCode}`);
    }
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const rawValue = result[0].rawValue;
      let codeStr = rawValue;
      try {
        const url = new URL(rawValue);
        const codeParam = url.searchParams.get('code');
        if (codeParam) codeStr = codeParam;
      } catch (e) {
        // n'est pas une URL entière
      }
      const upperCode = codeStr.toUpperCase();
      setRoomCodeInput(upperCode);
      localStorage.setItem("imposteur_last_room", upperCode);
      setShowScanner(false);
      
      if (!playerName.trim()) {
        setError("Code scanné ! Tu peux rejoindre direct ou mettre ton pseudo d'abord.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-dark">
      <Header />

      <main className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-8 mt-4">
        
        {/* Pseudo input */}
        <section className="w-full space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-400">
              Ton Pseudo
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError("");
              }}
              placeholder="Ex: Zinédine..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border-2 border-zinc-800
                text-white placeholder:text-zinc-600 font-medium text-center text-lg
                focus:outline-none focus:border-neon-yellow focus:shadow-[0_0_20px_rgba(250,204,21,0.2)]
                transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter" && playerName.trim()) {
                  handleCreateRoom();
                }
              }}
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-mono mt-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </section>

        <div className="w-full h-px bg-zinc-800 my-4" />

        {/* Join / Create Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          {/* Create Room */}
          <button
            onClick={handleCreateRoom}
            className="flex flex-col items-center justify-center p-6 gap-3 rounded-2xl
              bg-zinc-900/50 border-2 border-violet-600/50 hover:border-violet-500
              hover:bg-violet-600/10 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Users className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
            <div className="text-center font-bold">
              <h3 className="text-white text-lg">Créer un salon</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">Tu seras l'hôte (boss)</p>
            </div>
          </button>

          {/* Join Room */}
          <div className="flex flex-col p-4 gap-3 rounded-2xl bg-zinc-900/50 border-2 border-zinc-800">
            <div className="text-center font-bold">
              <h3 className="text-white text-lg mb-1">Rejoindre</h3>
              <p className="text-xs text-zinc-500 font-mono">Si on t'a filé un code</p>
            </div>

            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-700 transition-colors border border-zinc-700 border-dashed"
            >
              <QrCode className="w-4 h-4" />
              Scanner un QR Code
            </button>

            <div className="flex gap-2 mt-auto">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={6}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-zinc-950 border border-zinc-800
                    text-white placeholder:text-zinc-700 font-bold uppercase tracking-widest
                    focus:outline-none focus:border-neon-yellow transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && roomCodeInput.trim()) {
                      handleJoinRoom();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!roomCodeInput.trim()}
                className="px-4 py-3 rounded-xl bg-neon-yellow text-zinc-900 font-bold
                  hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
        </div>

      </main>

      {/* Modal Scanner QR Code */}
      {showScanner && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-zinc-900 border-2 border-violet-500 rounded-2xl p-4 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute -top-4 -right-4 bg-zinc-800 text-white p-2 rounded-full border-2 border-zinc-700 hover:bg-zinc-700 transition-colors z-70"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-white font-bold uppercase tracking-widest text-lg">Scanner le QR Code</h3>
            <p className="text-zinc-400 text-xs font-mono text-center mb-2">Vise l'écran du créateur du salon</p>
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 relative">
              <Scanner 
                onScan={handleScan}
                formats={['qr_code']}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
