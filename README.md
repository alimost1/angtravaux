# ANG Travaux — CRM de facturation

Application en français : clients, chantiers, devis, factures, paiements, tableau de bord, export CSV, impression PDF, rôles et journal d’activité. Données persistantes D1. Authentification fournie par Sites / ChatGPT.

## Premier accès

Le site est privé, réservé au propriétaire. Connectez-vous avec ChatGPT puis cliquez sur « Initialiser mon espace ». Cette étape crée l’administrateur et importe le devis Nadia 60/2026 comme brouillon à vérifier (28 lignes ; 825 000 DH HT, 165 000 DH TVA, 990 000 DH TTC). Les quantités non indiquées dans le PDF sont saisies à 1 forfait. Les libellés ambigus sont signalés.

Pour un collaborateur : le propriétaire doit autoriser sa visite via les paramètres d’accès Sites ET définir le même e-mail dans Utilisateurs. L’application ne transmet aucune invitation. Administrateur : tous droits ; Comptable : clients, chantiers, documents et paiements ; Lecture seule : consultation/export. Le propriétaire ne peut pas se suspendre ou perdre son rôle.

## Documents

Enregistrez un brouillon, puis validez-le. L’enregistrement attribue une référence numéro/année (ex. 61/2026). La validation conserve cette référence et fige les données du client et de l’entreprise. Le devis importé doit d’abord être vérifié et enregistré. Un devis accepté est convertible une seule fois en facture brouillon avec sa propre référence. Les règlements sont partiels ou complets ; un dépassement du solde est refusé. « Imprimer / PDF » utilise le dialogue du navigateur (Enregistrer en PDF). Aucun document n’est envoyé automatiquement aux clients.

Les anciens brouillons sans référence sont numérotés au prochain chargement par un administrateur ou un comptable via une action authentifiée et idempotente. Les références existantes sont conservées ; leur année ne peut plus être modifiée. Une écriture concurrente échoue sans consommer de numéro et peut être réessayée. Les séries sont indépendantes par type et année. La prochaine référence dépasse les compteurs et toutes les références connues (anciens formats compris). Le devis importé 60/2026 conserve son numéro ; le prochain devis 2026 est au minimum 61/2026. Les références des factures externes non présentes dans le CRM ne sont pas connues. Les statistiques excluent les factures brouillons. Les montants sont en DH. La TVA est modifiable par ligne ; 20 % est le défaut repris du devis source, pas une validation du taux applicable à chaque prestation.

Cette première version ne comprend pas de paiement bancaire en ligne, de connexion par mot de passe indépendante de ChatGPT, d’avoirs, de signature électronique ni d’envoi e-mail automatique. Les corrections de factures déjà émises nécessitent une évolution avec avoirs, plutôt qu’une édition destructive.

## Vérification

- `node tests/business.mjs` : règles métier et contrôles d’accès (base simulée pour tests).
- `node node_modules/typescript/bin/tsc --noEmit`.
- Construction avec le helper Sites `build-site.mjs`.

D1 stocke l’espace dans une ligne JSON versionnée. La mise à jour compare la révision pour prévenir les écrasements concurrents. Cette architecture est adaptée à un premier CRM de petite équipe ; une forte volumétrie nécessitera des tables normalisées et une pagination. Aucune donnée utilisateur réelle n’est enregistrée dans le navigateur.

## QR codes des documents

Chaque devis et facture affiche un QR vectoriel imprimable. Il encode le lien permanent `/?document=<id>` du CRM et reste valable après validation du brouillon. L’ouverture du lien recherche le document après authentification ; aucune publication anonyme ni droit supplémentaire n’est accordé. Les PDF déjà téléchargés doivent être réexportés pour obtenir le QR.

Le bouton « Scanner un QR » de la recherche accepte la caméra (permission à accorder dans le navigateur) ou une photo. Les images sont décodées localement avec jsQR et ne sont pas téléversées. Seules les URL de documents de cette instance sont reconnues ; aucun lien arbitraire n’est suivi. Les pistes caméra sont arrêtées à la fermeture ou après lecture. Si la caméra est indisponible, utilisez une photo ou la caméra native du téléphone pour ouvrir le lien.

Tests : `node --experimental-strip-types tests/qr.mjs` vérifie les allers-retours de génération/décodage et le refus des liens externes.
