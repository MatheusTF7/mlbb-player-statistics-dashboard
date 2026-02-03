# Deploy - branch `gh-pages`

1. Gere a build:

```bash
quasar build
```

2. Publique o conteúdo de `dist/spa` no branch `gh-pages`:

```bash
cd dist/spa
git init
git branch -M gh-pages
git remote add origin https://github.com/MatheusTF7/mlbb-player-statistics-dashboard.git
git add . -f
git commit -m "Deploy Quasar"
git push -f origin gh-pages
```

# Remover branch gh-pages

1.

```bash
push origin --delete gh-pages
```
