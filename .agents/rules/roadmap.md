---
trigger: always_on
---

### 🗺️ ROADMAP : LA FRANCE À L'IMPOSTEUR

#### **Étape 1 : Consolidation du Cœur (Local "Passer le Gamos")**
* **Data de base :** Finaliser le fichier `src/data/words.ts` avec les paires de mèmes (Civils / Imposteur).
* **Logique de distribution :** Créer un algorithme robuste pour attribuer les rôles : $N-2$ Civils, $1$ Imposteur, $1$ Mr. White (si $> 3$ joueurs).
* **UI Local :** Créer l'écran "Secret" (cliquer pour voir son mot, recliquer pour cacher) pour le mode un seul téléphone.

#### **Étape 2 : Infrastructure Multijoueur (PartyKit)**
* **Setup :** Installation de `partykit` et `partysocket`.
* **Serveur Party :** Créer `party/server.ts` pour gérer l'état global d'une partie (Lobby, Liste des joueurs, État "En jeu", Révélation).
* **Codes de Salon :** Implémenter la création de salons avec des codes stylés (ex: `SIX-7`, `TASTY`, `MACRON`).

#### **Étape 3 : Flow de Jeu en Ligne**
* **Le Lobby :** Interface pour rejoindre une partie via un code. Synchronisation des pseudos en temps réel.
* **Synchronisation des Rôles :** Le serveur distribue les mots. Chaque joueur reçoit son mot spécifique sur son propre téléphone via WebSocket.
* **Vote & Élimination :** Système de vote en temps réel pour désigner le suspect du tour.

#### **Étape 4 : Design "Brainrot" & Feedback**
* **Identité Visuelle :** Full Dark Mode, typos brutalistes, accents Jaune néon / Violet.
* **Interactions :** Ajout de sons "mèmes" (optionnel) et d'animations de transition entre les écrans avec `framer-motion`.
* **Responsive :** Optimisation 100% mobile (c'est un jeu de soirée).

#### **Étape 5 : Déploiement & Finalisation**
* **Vercel :** Déploiement du frontend Next.js.
* **PartyKit Cloud :** Déploiement du serveur de sockets pour que tes potes puissent jouer de chez eux.