"use client";

import { useRouter } from "next/navigation";
import { Users, Wifi, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useMemeSounds } from "@/hooks/useMemeSounds";
import Header from "@/components/Header";

export default function LandingPage() {
  const router = useRouter();
  const { playPop } = useMemeSounds();

  const handleNavigate = (path: string) => {
    playPop();
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center min-h-svh bg-dark overflow-hidden relative">
      <Header />

      <main className="flex flex-col items-center w-full max-w-lg px-4 pb-12 gap-8 mt-12 flex-1 justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="w-full flex flex-col gap-6"
        >
          {/* Passer le Gamos (Local) */}
          <button
            onClick={() => handleNavigate("/local")}
            className="group relative w-full flex flex-col items-center py-10 px-8 gap-4
              brutal-border brutal-shadow-violet brutal-active bg-zinc-900 border-2 border-violet-600
              hover:bg-violet-600/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <Users className="w-14 h-14 text-violet-400 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3" />
            <div className="text-center font-bold z-10">
              <h2 className="text-white text-2xl md:text-3xl uppercase tracking-widest mb-2 font-black">
                Passer le Gamos
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-mono">
                1 seul tel pour toute l'équipe (Local)
              </p>
            </div>
            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
          </button>

          {/* En Réseau (Online) */}
          <button
            onClick={() => handleNavigate("/online")}
            className="group relative w-full flex flex-col items-center py-10 px-8 gap-4
              brutal-border brutal-shadow-zinc brutal-active bg-zinc-900 border-2 border-neon-yellow/80
              hover:bg-neon-yellow/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-neon-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <Wifi className="w-14 h-14 text-neon-yellow group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-3" />
            <div className="text-center font-bold z-10">
              <h2 className="text-white text-2xl md:text-3xl uppercase tracking-widest mb-2 font-black">
                En Réseau
              </h2>
              <p className="text-sm md:text-base text-zinc-400 font-mono">
                Chacun sur son tel (Online Party)
              </p>
            </div>
            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-neon-yellow opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
          </button>
        </motion.div>
      </main>
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-yellow/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
