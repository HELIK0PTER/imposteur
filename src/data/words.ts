/**
 * Paires de mots pour le jeu "La France à l'Imposteur".
 * Chaque paire contient un mot pour les Civils et un mot proche pour l'Imposteur.
 * Inspirées de la culture mème et shitposting français.
 */

export interface WordPair {
  /** Identifiant unique de la paire (auto-généré) */
  id: number;
  /** Mot donné aux Civils */
  civilian: string;
  /** Mot donné à l'Imposteur (proche du mot civil) */
  impostor: string;
}

/** Format brut d'une paire, sans id — l'id est assigné automatiquement */
type RawWordPair = Omit<WordPair, "id">;

/** Liste brute sans id — ajoute/supprime librement, les id sont assignés automatiquement */
const rawWordPairs: RawWordPair[] = [
  { civilian: "Tasty Crousty", impostor: "Doro Party" },
  { civilian: "Six-Seven", impostor: "92i" },
  { civilian: "La France à Macron", impostor: "La France à l'Imposteur" },
  { civilian: "Quoicoubeh", impostor: "Apanyae" },
  { civilian: "Ratio + L + Bozo", impostor: "Skill Issue" },
  { civilian: "Ça claque sa mère", impostor: "C'est pas faux" },
  { civilian: "Wesh alors", impostor: "Wola" },
  { civilian: "Zemmour", impostor: "Mélenchon" },
  { civilian: "Baguette", impostor: "Croissant" },
  { civilian: "TikTok", impostor: "YouTube Shorts" },
  { civilian: "Cramé au tier", impostor: "Dead au sol" },
  { civilian: "Oui oui baguette", impostor: "Sacré bleu" },
  { civilian: "Darmanin", impostor: "Dupond-Moretti" },
  { civilian: "Pookie", impostor: "Bae" },
  { civilian: "C'est une dinguerie", impostor: "Ça pique sa mère" },
  { civilian: "Slay", impostor: "Purr" },
  { civilian: "Bledard", impostor: "Teh du bled" },
  { civilian: "Jean-Pierre Foucault", impostor: "Nagui" },
  { civilian: "Le Daron", impostor: "Le Tonton" },
  { civilian: "Jul", impostor: "SCH" },
  { civilian: "Mbappe", impostor: "Griezmann" },
  { civilian: "PSG", impostor: "OM" },
  { civilian: "Kebab", impostor: "Tacos français" },
  { civilian: "Koh-Lanta", impostor: "Pékin Express" },
  { civilian: "No cap", impostor: "Fr fr" },
  { civilian: "C'est chaud patate", impostor: "C'est mort de chez mort" },
  { civilian: "La Hess", impostor: "La Dèche" },
  { civilian: "Boloss", impostor: "Tocard" },
  { civilian: "Gilet Jaune", impostor: "Bonnets Rouges" },
  { civilian: "JUL", impostor: "PNL" },
  { civilian: "Squeezie", impostor: "Cyprien" },
  { civilian: "Inoxtag", impostor: "Michou" },
  { civilian: "O'Tacos", impostor: "Kebab" },
  { civilian: "Masterclass", impostor: "Poulet" },
  { civilian: "Banger", impostor: "Pépite" },
  { civilian: "Gamos", impostor: "Vago" },
  { civilian: "J'ai juré", impostor: "Sur la tête de oim" },
  { civilian: "Zinzin", impostor: "Fou allié" },
  { civilian: "Feur", impostor: "Quoi" },
  { civilian: "Cristaline", impostor: "Evian" },
  { civilian: "Gims", impostor: "Black M" },
  { civilian: "ZEvent", impostor: "GP Explorer" },
  { civilian: "Tibo InShape", impostor: "Juju Fitcats" },
  { civilian: "PNL", impostor: "QLF" },
  { civilian: "C'est le S", impostor: "C'est le sang" },
  { civilian: "La D", impostor: "La hess" },
  { civilian: "Carré", impostor: "Net" },
  { civilian: "Goatesque", impostor: "Incroyable" },
  { civilian: "McDo", impostor: "Burger King" },
  { civilian: "McFly", impostor: "Carlito" },
  { civilian: "10 balles", impostor: "10 euros" },
  { civilian: "FDP", impostor: "Enfant de chienne" },
  { civilian: "Flop", impostor: "Bide" },
  { civilian: "FC Chomage", impostor: "Pôle Emploi" },
  { civilian: "Gênant", impostor: "Cringe" },
  { civilian: "JPP", impostor: "MDR" },
  { civilian: "S'en battre les couilles", impostor: "Balek" },
  { civilian: "Capter", impostor: "Piger" },
  { civilian: "Charo", impostor: "Dalleux" },
  { civilian: "Miskine", impostor: "Le pauvre" },
  { civilian: "Cheh", impostor: "Bien fait" },
  { civilian: "Go muscu", impostor: "Pousseur de fonte" },
  { civilian: "Red flag", impostor: "Green flag" },
  { civilian: "Ghoster", impostor: "Vu" },
  { civilian: "Force à toi", impostor: "Bon courage" },
  { civilian: "Mytho", impostor: "Menteur" },
  { civilian: "Ça dit quoi", impostor: "Bien ou quoi" },
  { civilian: "Un biff", impostor: "Un billet" },
  { civilian: "Bifle", impostor: "Gifle" },
  { civilian: "Kichta", impostor: "Liasse" },
  { civilian: "Zinzin de l'espace", impostor: "Fada" },
  { civilian: "Une dinguerie", impostor: "Une folie" },
  { civilian: "Aya Nakamura", impostor: "Wejdene" },
  { civilian: "Golgoth", impostor: "Armoire à glace" },
  { civilian: "Pépite", impostor: "Masterclass" },
  { civilian: "Azi", impostor: "Vas-y" },
  { civilian: "Bourbier", impostor: "Traquenard" },
  { civilian: "C'est carré", impostor: "C'est propre" },
  { civilian: "Eclaté au sol", impostor: "Nul à chier" },
  { civilian: "Mdrrr", impostor: "Ptdrrr" },
  { civilian: "Pookie", impostor: "Bavard" },
  { civilian: "Bendo", impostor: "Tierquar" },
  { civilian: "Pouloulou", impostor: "Oulala" },
  { civilian: "Finito", impostor: "Terminé" },
  { civilian: "Smicard", impostor: "Prolétaire" },
  { civilian: "Chaud", impostor: "Tendax" }
];

/** Paires finales avec id auto-incrémenté à partir de 1 */
export const wordPairs: WordPair[] = rawWordPairs.map((pair, index) => ({
  id: index + 1,
  ...pair,
}));



/**
 * Sélectionne une paire de mots aléatoire.
 * @returns Une paire de mots random tirée de la liste
 */
export function getRandomWordPair(): WordPair {
  const index = Math.floor(Math.random() * wordPairs.length);
  return wordPairs[index];
}
