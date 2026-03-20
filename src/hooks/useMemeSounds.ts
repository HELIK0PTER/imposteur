"use client";

import useSound from "use-sound";

/**
 * Hook personnalisé pour jouer des effets sonores "Brainrot / Meme".
 * Nécessite que les fichiers mp3 soient placés dans le dossier public/sounds/
 */
export function useMemeSounds() {
  const [playPop] = useSound("/sounds/pop.mp3", { volume: 0.5 });
  const [playVineBoom] = useSound("/sounds/vine-boom.mp3", { volume: 0.7 });
  const [playBuzzer] = useSound("/sounds/buzzer.mp3", { volume: 0.6 });

  return {
    playPop,
    playVineBoom,
    playBuzzer,
  };
}
