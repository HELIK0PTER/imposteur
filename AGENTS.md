# 🕵️‍♂️ Projet : La France à l'Imposteur

1. Vision & Ambiance
"La France à l'Imposteur" est une version moderne, typée "Twitter Game / Shitpost", du jeu de l'Imposteur (Undercover).

Vibe : Tasty Crousty, Six-Seven, Doro Party, Brainrot, Twitter France.

Ton : Impertinent, drôle, visuels typés "Dark Mode" avec des néons (Violet/Jaune).

Public : Les "élites" du web français qui ont les refs.

2. Tech Stack
Framework : Next.js 14+ (App Router).

Styling : Tailwind CSS + Lucide React (Icons).

Multijoueur : PartyKit (pour le temps réel).

State Management : React Context ou Zustand.

Déploiement : Vercel (Frontend) + PartyKit Cloud.

3. Logique du Jeu
Le jeu comporte 3 types de rôles distribués aléatoirement :

Les Civils : Ont le mot secret A.

L'Imposteur : A le mot secret B (très proche de A).

Le Mr. White : N'a aucun mot (doit deviner le mot des civils).

Modes de jeu :
Mode "Passer le Gamos" (Local) : Un seul téléphone pour tout le monde. On affiche le rôle, le joueur regarde, clique sur "C'est bon j'ai vu", et passe le téléphone au suivant.

Mode "En Réseau" (PartyKit) : Chaque joueur rejoint via un code de salon sur son propre téléphone. Les rôles sont distribués sur chaque écran simultanément.

4. Instructions de Développement (Règles d'or)
Autonomie Totale : Tu as l'autorisation d'exécuter des commandes npm, de créer des dossiers et de modifier les fichiers sans confirmation manuelle. Si une dépendance manque (lucide-react, partykit, clsx, etc.), installe-la.

Fichier de Mots : La base de données de mots doit être dans src/data/words.ts. Utilise des paires de mots basées sur les mèmes (ex: Tasty Crousty / Doro Party, Six-Seven / 92i, Jul / SCH).

Composants UI : Crée des composants réutilisables dans src/components/ui. Priorise une expérience mobile-first (boutons larges, feedback tactile, animations simples avec framer-motion si possible).