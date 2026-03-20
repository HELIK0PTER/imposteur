# Problèmes & Améliorations

1. permettre de rejoindre une partie en tapant juste le code de la partie sans mettre son nom :
   1. si on a tapé le code de la partie on est redirigé vers la page de la partie
   2. on stocke dans le local storage le code de la partie et le nom du joueur (si yen a un)
   3. si ya un code de partie mais pas de nom de joueur le joueur est directement prompté pour mettre son nom
   4. la partie ne peut pas commencer sans que tout le monde ait mis son nom
2. si quelqu'un quitte la partie tout le monde reçoit une notif en disant qui est parti, si il y a toujours plus de 2 joueurs la partie continue mais les mots sont redéfinis et le jeu recommence (les points sont conservés)
3. si il y a moins de 2 joueurs la partie se termine et on redirige vers la page d'accueil de la partie (avec les points de chacun)