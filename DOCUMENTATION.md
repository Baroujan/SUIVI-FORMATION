# Documentation - Suivi de Formation BDB France Scientific

## Table des matières

1. [Présentation](#présentation)
2. [Accès à l'application](#accès-à-lapplication)
3. [Interface Formateur](#interface-formateur)
4. [Interface Stagiaire](#interface-stagiaire)
5. [Interface Administrateur](#interface-administrateur)
6. [Fonctionnalités communes](#fonctionnalités-communes)
7. [FAQ](#faq)

---

## Présentation

L'application Suivi de Formation est un outil en ligne permettant de suivre les formations en cytométrie de flux dispensées par BDB France Scientific. Elle permet :

- Aux **formateurs** de valider les éléments vus en formation
- Aux **stagiaires** d'évaluer leur niveau d'aisance sur chaque élément
- Aux **administrateurs** de surveiller les métriques et d'envoyer des alertes

### Instruments supportés

L'application couvre les cytomètres BD Biosciences suivants :
- BD FACSCanto II (3 lasers, 8 couleurs)
- BD FACSLyric (cytomètre clinique)
- BD FACSCelesta (jusqu'à 14 couleurs)
- BD FACSymphony A5 (analyseur spectral)
- BD FACSAria III (trieur cellulaire)
- BD FACSMelody (trieur compact)

---

## Accès à l'application

### URL d'accès
L'application est accessible à l'adresse : **https://suivi-formation.vercel.app/**

### Connexion

1. Entrez votre **identifiant utilisateur** (fourni par votre formateur ou administrateur)
2. Si vous êtes stagiaire, entrez également votre **code laboratoire** (ex: LAB001)
3. Cliquez sur "Se connecter"

### Utilisateurs de démonstration

| Identifiant | Code Labo | Rôle |
|-------------|-----------|------|
| trainer | - | Formateur |
| admin | - | Administrateur |
| jean.dupont | LAB001 | Stagiaire |
| marie.martin | LAB001 | Stagiaire |
| pierre.bernard | LAB002 | Stagiaire |

---

## Interface Formateur

### Tableau de bord

Le tableau de bord affiche :
- Nombre de sessions de formation
- Stagiaires actuellement sélectionnés
- Éléments validés récemment

### Démarrer une session de formation

1. Accédez à **"Nouvelle session"** depuis le menu latéral
2. **Sélectionnez les stagiaires** de deux manières :
   - **Scanner QR Code** : Cliquez sur "Scanner QR" pour scanner le code QR d'un stagiaire
   - **Saisie manuelle** : Entrez l'identifiant du stagiaire dans le champ de recherche
3. **Choisissez le lieu de formation** : Rungis, Sur site, ou En ligne
4. **Sélectionnez les instruments** que vous allez couvrir

### Valider des éléments de formation

1. Sélectionnez l'onglet de l'instrument souhaité
2. Développez les chapitres et sous-chapitres
3. Pour chaque élément, cliquez sur le bouton de validation
4. L'élément est automatiquement marqué comme validé avec la date et votre nom

### Sauvegarder/Charger une session

Pour les formations sur plusieurs jours :
1. Cliquez sur **"Sauvegarder la session"**
2. Donnez un nom à votre session (ex: "Formation CHU Lyon - Janvier 2026")
3. Pour reprendre : allez dans **"Sessions"** et chargez la session souhaitée

---

## Interface Stagiaire

### Mon tableau de bord

Affiche un résumé de votre progression :
- Nombre d'éléments validés
- Moyenne de votre niveau d'aisance
- Dernières activités

### Ma progression

Cette page affiche tous les éléments validés par vos formateurs :

1. **Par instrument** : Naviguez entre les onglets pour chaque cytomètre
2. **Par chapitre** : Développez les accordéons pour voir les éléments

### Évaluer votre niveau d'aisance

Pour chaque élément validé :
1. Cliquez sur les étoiles (1 à 5) correspondant à votre niveau d'aisance :
   - 1 : Très difficile
   - 2 : Difficile
   - 3 : Moyen
   - 4 : À l'aise
   - 5 : Très à l'aise
2. Votre évaluation est enregistrée automatiquement
3. Vous pouvez modifier votre évaluation à tout moment

### Accéder aux ressources FACSUniversity

Certains éléments comportent un lien vers FACSUniversity :
1. Repérez le bouton "FACSUniversity" à côté de l'élément
2. Cliquez pour accéder au contenu e-learning associé

---

## Interface Administrateur

### Tableau de bord global

Affiche les métriques clés :
- Nombre de laboratoires actifs
- Nombre total de stagiaires
- Alertes actives (stagiaires sous le seuil)
- Moyenne globale d'aisance

### Alertes

Les stagiaires dont la moyenne d'aisance est inférieure au seuil (2.5/5) apparaissent dans la liste des alertes :
1. Consultez la liste des stagiaires en alerte
2. Cliquez sur **"Envoyer une alerte"** pour notifier le support BDB

### Scores laboratoires

Visualisez les performances par laboratoire :
- Nombre d'utilisateurs par labo
- Moyenne d'aisance du labo
- Fréquence des formations

### Génération de rapports

1. Accédez à **"Rapports"** dans le menu
2. Choisissez le type de rapport :
   - **Rapport individuel** : Progression d'un stagiaire
   - **Rapport laboratoire** : Compilation des données d'un labo
3. Sélectionnez le stagiaire ou le laboratoire
4. Cliquez sur **"Générer"** ou **"Envoyer par email"**

---

## Fonctionnalités communes

### Changement de langue

1. Cliquez sur l'icône globe dans l'en-tête
2. Sélectionnez "Français" ou "English"

### Mode sombre/clair

1. Cliquez sur l'icône soleil/lune dans l'en-tête
2. Le thème s'applique immédiatement

### Déconnexion

Cliquez sur l'icône de sortie dans l'en-tête pour vous déconnecter.

### Traçabilité des modifications

Toutes les modifications sont enregistrées avec :
- Date et heure
- Utilisateur responsable
- Type d'action (création, modification, suppression)

Les formateurs et stagiaires peuvent consulter l'historique des modifications sur leurs éléments.

---

## FAQ

### Comment obtenir mes identifiants ?

Contactez votre formateur BDB France Scientific ou l'administrateur de votre laboratoire.

### Comment signaler un problème technique ?

Envoyez un email à support@bdbfrance.com avec une description détaillée du problème.

### Puis-je modifier une évaluation après l'avoir soumise ?

Oui, vous pouvez modifier votre niveau d'aisance à tout moment en cliquant sur les nouvelles étoiles.

### Les données sont-elles sauvegardées automatiquement ?

Oui, toutes les validations et évaluations sont sauvegardées instantanément dans la base de données.

### Comment fonctionne le système d'alertes ?

Lorsque la moyenne d'aisance d'un stagiaire descend sous 2.5/5, une alerte est générée automatiquement et visible par les administrateurs.

---

## Support

Pour toute question ou assistance :
- Email : support@bdbfrance.com
- Téléphone : +33 1 XX XX XX XX
- Site web : https://www.bdbiosciences.com/en-fr

---

*Document mis à jour le 2 janvier 2026*
