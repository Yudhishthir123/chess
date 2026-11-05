# Checkmate — 3D Chess Club

A responsive local two-player chess game built with React and Vite. The board uses a 3D-inspired perspective and layered piece styling, with a complete local chess rules engine.

## Features
- Legal piece movement, including check prevention, checkmate and stalemate detection
- Castling, en passant and pawn promotion (queen, rook, bishop or knight)
- Undo, redo, flip board and new game controls
- Move history, check status and FEN position export
- Responsive layout for desktop, tablet and mobile

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The app is a local two-player game. It does not currently include online multiplayer, an AI opponent, accounts or server-side persistence.
