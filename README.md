# Gîtes de Kerhotten – proposition de refonte (maquette privée)

> **Private redesign proposal, photos © Gîtes de Kerhotten, not for publication without owners' consent.**
> Proposition de refonte privée – photos © Gîtes de Kerhotten, ne pas publier sans l'accord écrit des propriétaires.

Maquette statique (HTML/CSS/JS, sans framework ni dépendance externe) préparée pour un rendez-vous de prospection.
Rien n'est déployé, aucun domaine, aucun compte, aucun envoi : la page tourne uniquement en local.

## Voir la maquette

```bash
cd /workspace/portfolio/kerhotten-demo
python3 -m http.server 8765 --bind 127.0.0.1
# puis http://127.0.0.1:8765/   (version anglaise : bouton EN ou ?lang=en)
```

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Page générée (CSS critique inline, images responsives) – **ne pas éditer à la main** |
| `styles.css` | Source CSS (lisible) – inlinée et minifiée dans `index.html` au build |
| `main.js` / `main.min.js` | FR/EN, menu mobile, apparitions au scroll (désactivées si `prefers-reduced-motion`), formulaire de demande |
| `_build/index.src.html` | Gabarit source (les `<!--pic …-->` deviennent des `<picture>` WebP + JPEG de repli) |
| `_build/build.py` | `python3 _build/build.py` → régénère `index.html` et `main.min.js` |
| `img/` | 14 photos du site actuel, redimensionnées (480/800/1280 px) et compressées en WebP (+ un JPEG 800 px de repli), `og.jpg` 1200×630 |
| `fonts/` | Cormorant Garamond + Inter (woff2, sous-ensemble latin, auto-hébergées, licence SIL OFL) |

## Règles suivies

- **Uniquement des faits présents sur www.gitesdekerhotten.fr** (consulté le 10/10/2026). Capacités et surfaces = celles de la page d'accueil
  (Le Saule 5 pers. / 90 m², La Châtaigne 8–10 pers. / 130 m², La Grange 7 pers. / 95 m²) ; d'autres pages du site donnent des chiffres différents (voir l'audit).
- **Aucun prix, avis, note ou statistique inventé.** Tarifs et calendrier de disponibilités = emplacements hachurés « à compléter ».
  Mentions légales = emplacement « à compléter ».
- **Formulaire de demande 100 % front-end** : il vérifie les dates et la capacité du gîte choisi, puis affiche un aperçu de l'e-mail et un lien
  `mailto:kerhotten@outlook.fr`. Rien n'est envoyé, rien ne s'ouvre automatiquement : le visiteur doit cliquer, puis envoyer lui-même depuis sa messagerie.
- `<meta name="robots" content="noindex, nofollow">` : volontaire tant que c'est une maquette (à retirer au lancement ; c'est ce qui fait tomber le score SEO Lighthouse à 66).
- Bandeau discret « Proposition de refonte – maquette » en haut de page + mention © dans le pied de page et en commentaire HTML.

## À faire avant toute mise en ligne (avec accord des propriétaires)

1. Accord écrit pour l'utilisation des photos (ou nouveau shooting).
2. Tarifs, calendrier (iCal / outil de réservation), mentions légales, politique de confidentialité.
3. Trancher les incohérences du site actuel (surfaces, capacités, 1692/1697, Kervoten/Kervotten).
4. Retirer `noindex`, vérifier `canonical`/`og:url`, ajouter coordonnées GPS au JSON-LD si fournies.
5. Hébergement avec compression gzip/brotli et cache long sur `img/` et `fonts/`.
