# LCM Balloon Pop - Interactive Math Game (Grades 4-7)

An engaging browser game to teach Least Common Multiple (LCM) by popping balloons that show common multiples of two numbers. Built with HTML/CSS/JavaScript and a tiny PHP endpoint to save high scores. Runs on WAMP/XAMPP/LAMP.

## How to Run (Windows + XAMPP/WAMP)
1. Copy this folder ("VAULTBOARD CONSULTING PVT LTD") into your server web root:
   - XAMPP: `C:/xampp/htdocs/VAULTBOARD CONSULTING PVT LTD`
   - WAMP: `C:/wamp64/www/VAULTBOARD CONSULTING PVT LTD`
2. Start Apache (PHP) from the control panel.
3. Visit `http://localhost/VAULTBOARD%20CONSULTING%20PVT%20LTD/` in your browser.
4. Click Start Game. Use Save Score to persist results (requires PHP running).

Tip: You can also open `index.html` directly without a server; the game works. Only the Save Score function will show a tip because PHP isn’t available.

## Gameplay
- Pop balloons that show numbers which are common multiples of A and B.
- Wrong pops cost a life; missing a correct balloon also costs a life.
- Clear the target number of correct balloons to level up. Each level displays and explains the LCM.
- Difficulty increases each level: faster spawns, shorter fall time, new number pairs.

## Teaching Notes (LCM)
- The LCM of A and B is the smallest number that both A and B divide into exactly.
- The game strengthens multiplication table fluency and recognition of common multiples.
- Use the How To dialog and level-up message to connect gameplay to LCM reasoning.

## Files
- `index.html` – structure and UI
- `css/style.css` – visuals and animations
- `js/game.js` – game logic and LCM reasoning
- `php/save_score.php` – saves scores into `data/scores.json`
- `data/scores.json` – JSON array of scores (auto-created)

## Customize
- Click Settings to adjust numbers, spawn speed, balloon fall duration, and target correct clicks per level.

## Security/Notes
- Demo uses file-based JSON storage for simplicity; not for production.
- Ensure `data/` is writable by the web server user to save scores.

## Credit
- Fonts: Google Fonts (Fredoka)
- Built as a hiring task for Vaultboard Consulting Pvt Ltd.

## Deploy to Render (Docker)
- Ensure the repo contains `Dockerfile` and `render.yaml`.
- Push the project to GitHub.
- On Render, create a New Web Service → connect the repo → Render reads `render.yaml`.
- Choose the Free plan and deploy. The app will be available at your Render URL.
