# Prototype — Suivi d'entreprise (Dashboard)

## Objectif
Prototype destiné à aider un entrepreneur à suivre son entreprise en ligne, à distance et en temps réel (simulation).

Cas d'utilisation concret : **Café Congo SARL** — torréfaction et vente de café. Produits suivis dans le prototype : **Arabica Kivu 250g**, **Robusta Nord 250g**, **Mélange Maison 250g**, **Capsules Espresso (10 pcs)**. Le dirigeant peut suivre le CA quotidien, les ventes, la trésorerie et les stocks (seuils d'alerte).

## Contenu
- `index.html` : interface principale (dashboard)
- `style.css` : styles modernes et responsifs
- `script.js` : logique (chargement des données, KPI, graphique, rafraîchissement)
- `data.json` : données d'exemple (stocks, ventes, historique CA)
- `rapport.md` : résumé professionnel à remettre

## Fonctionnalités clés
- KPI (Chiffre d'affaires, Ventes, Trésorerie, Dépenses, Résultat net, Alertes)
- Suivi des dépenses (tableau, ajout local, KPI)
- Gestion clients (liste, ajout local via formulaire)
- Graphique CA sur 7 jours (ou graphique de vente par produit)
- Tableaux détaillés (ventes, stocks) avec mise en évidence des stocks faibles
- Notifications basiques (alertes navigateur pour stocks faibles, dépenses importantes)
- Export PDF via l'option d'impression du navigateur
- Rafraîchissement automatique (simulation temps réel)

## Lancer le prototype
1. Servir le dossier du projet via HTTP (nécessaire pour que `fetch('data.json')` fonctionne) :

- Avec Python (v3.x) :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans votre navigateur.

- Ou utilisez l'extension **Live Server** de VS Code et lancez le serveur depuis l'explorateur.

2. Ouvrir le tableau de bord : `http://localhost:8000` (ou `index.html` si vous savez ce que vous faites).
3. Pour exporter en PDF : bouton "Exporter (PDF)" ou `Fichier > Imprimer` puis enregistrer en PDF.

## Dépannage
- Si `data.json` ne se charge pas : ouvrez DevTools (F12) → **Console** et **Network** → rechargez la page ; vérifiez la requête `data.json` et les éventuelles erreurs (404 / blocked / CORS).
- N'ouvrez pas la page en `file://` si vous utilisez `fetch` : servez le dossier via HTTP (voir commande ci‑dessus).
- Vérifiez que le serveur est lancé et écoute sur le port (ex. 8000). Si nécessaire, arrêtez et redémarrez le serveur.

## Synchronisation du CA (note importante)
- Le graphique utilise `history` (évolution CA), tandis que les KPI utilisent `sales` (ventes). Si `history` n'est pas mis à jour, le graphique peut afficher un montant différent du CA calculé à partir des ventes du jour.
- Solution côté client : mettre à jour l'entrée d'aujourd'hui dans `history` avec la somme calculée depuis `sales` avant de dessiner le graphique. Ex :

```javascript
// après le calcul de totalRevenue
const today = new Date().toISOString().slice(0,10); // 'YYYY-MM-DD'
if (!Array.isArray(data.history)) data.history = [];
const last = data.history[data.history.length - 1];
if (last && last.date === today) last.revenue = totalRevenue;
else data.history.push({date: today, revenue: totalRevenue});
```

## Remarques / Améliorations possibles
- Utiliser Firebase / WebSocket pour données réellement temps réel.
- Authentification et multi-utilisateurs.
- Envoi d'alertes par email/SMS et historique plus détaillé.

---

Pour toute question ou demande d'ajustement, contactez : cynthiapembe11@gmail.com
