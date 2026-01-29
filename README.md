# Balatro Mines•Rogue (mini)

Open `index.html` in a browser to play. This is a self-contained static demo.

Features:
- Mines-like grid with cashout mechanic.
- Roguelike twist: buy upgrades in the shop between runs, abilities (`Scan`, `Scry`, `Defuse`).
- Local persistence for balance & purchased upgrades (localStorage).
- Flashy particle effects on large cashouts.

Files:
- [index.html](index.html)
- [style.css](style.css)
- [game.js](game.js)

To run locally with a simple static server (recommended):

Windows PowerShell:
```
python -m http.server 8000
```
Then open http://localhost:8000/mines-rogue/
