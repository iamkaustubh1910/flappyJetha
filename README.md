# Flappy Jethalal 🎮

A fun and entertaining Flappy Bird clone featuring Jethalal from Taarak Mehta Ka Ooltah Chashmah! Navigate through pipes and collect points while Babita ji cheers you on.

## Play the Game

👉 [Play Flappy Jethalal](https://yourusername.github.io/flappy-jethalal)

## Features

- Play as Jethalal from TMKOC
- Progressive difficulty system
- Score tracking
- Babita ji appearances
- Responsive design
- Sound effects

## How to Play

- Press SPACE or CLICK to make Jethalal fly
- Navigate through the pipes
- Score points by passing through pipes
- Watch for Babita ji's appearance when scoring!

## Development

This game is built using:
- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API for sound effects

## Contributing

Feel free to fork this repository and make improvements!

## 🎲 Difficulty Progression

The game starts easy and gradually becomes more challenging:

- **Initial Settings (Score 0)**:
  - Wide pipe gaps (250px)
  - Slow pipe movement
  - Long intervals between pipes
  - Gentle physics

- **Progressive Difficulty (Score 1-9)**:
  - Gradually decreasing pipe gaps
  - Increasing pipe speed
  - Shorter intervals between pipes

- **Maximum Difficulty (Score 10+)**:
  - Minimum pipe gap (150px)
  - Maximum pipe speed
  - Shortest intervals between pipes

## 🛠️ Technical Details

The game is built using:
- HTML5
- CSS3
- JavaScript (Vanilla)
- SVG graphics for characters
- RequestAnimationFrame for smooth animations

## 📦 Project Structure

```
flappy/
├── index.html      # Main game HTML file
├── styles.css      # Game styling and animations
└── script.js       # Game logic and mechanics
```

## 🎨 Customization

Feel free to modify the game by adjusting these values in `script.js`:
- `GRAVITY`: Controls falling speed
- `FLAP_FORCE`: Controls jump height
- `INITIAL_PIPE_SPEED` and `MAX_PIPE_SPEED`: Controls pipe movement speed
- `INITIAL_PIPE_GAP` and `MIN_PIPE_GAP`: Controls gap size between pipes
- `INITIAL_PIPE_SPAWN_INTERVAL` and `MIN_PIPE_SPAWN_INTERVAL`: Controls pipe spawn timing

## 🚀 Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Start playing!

## 🎨 Customization

Feel free to modify the game by:
- Changing the sound effects in `index.html`