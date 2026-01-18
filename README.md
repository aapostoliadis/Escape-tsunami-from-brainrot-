# 🌊 Escape Tsunami from Brainrot! 🌊

A fast-paced endless runner browser game where you must outrun a tsunami wave while avoiding brainrot obstacles!

## 🎮 Game Description

Run for your life as a massive tsunami of internet brainrot chases you down! Jump and slide to avoid obstacles representing various internet trends and memes. Collect based emojis for bonus points and see how long you can survive!

## 🚀 How to Play

1. Open `index.html` in any modern web browser
2. Click "START GAME" to begin
3. Use controls to avoid obstacles:
   - **SPACE** or **UP ARROW**: Jump over obstacles
   - **DOWN ARROW**: Slide under obstacles
4. Collect glowing emojis for bonus points (+500 each)
5. Survive as long as you can before the tsunami catches you!

## 🎯 Features

- **Dynamic Difficulty**: Game speed increases over time
- **Lives System**: Start with 3 lives (hearts)
- **Score Tracking**: High score saved in browser localStorage
- **Brainrot Obstacles**: Dodge popular internet slang terms like:
  - SKIBIDI
  - RIZZ
  - SIGMA
  - GYATT
  - OHIO
  - And more!
- **Collectibles**: Grab based emojis (💎⭐🏆👑) for bonus points
- **Particle Effects**: Visual feedback for collisions and collections
- **Progressive Tsunami**: The wave gets faster and closer over time

## 🛠️ Technical Details

### Built With:
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS3 for UI styling
- No external dependencies required!

### Game Mechanics:
- **Physics**: Gravity-based jumping with realistic acceleration
- **Collision Detection**: Rectangle-based collision system
- **Spawning System**: Dynamic obstacle and collectible generation
- **Animation**: 60 FPS game loop using requestAnimationFrame

## 📁 Project Structure

```
.
├── index.html      # Main HTML file with game structure
├── style.css       # Styling and animations
├── game.js         # Core game logic and mechanics
└── README.md       # This file
```

## 🎨 Game Elements

### Player Character
- Blue runner sprite with emoji indicator 🏃
- Can jump and slide
- Positioned at x: 150px from left edge

### Tsunami Wave
- Animated water wave with foam effects
- Gradually advances from the left
- Game over if it catches the player

### Obstacles (Red)
- Various sizes and positions
- Display brainrot terms
- Lose 1 life on collision

### Collectibles (Gold)
- Wobbling animated emojis
- Worth 500 bonus points
- Hover at different heights

## 🏆 Scoring

- **Survival**: +1 point per frame
- **Collectibles**: +500 points per emoji collected
- **High Score**: Automatically saved in browser

## 💡 Tips for High Scores

1. Focus on survival over collecting everything
2. Time your jumps carefully to avoid obstacles
3. Use slides for low obstacles to maintain speed
4. Watch the tsunami - it speeds up over time!
5. Collect emojis when safe to do so

## 🌐 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

## 📝 Future Enhancement Ideas

- Multiple characters to choose from
- Power-ups (slow time, invincibility, etc.)
- Different biomes/environments
- Mobile touch controls
- Sound effects and music
- Leaderboard system
- More obstacle types

## 🎪 About "Brainrot"

This game playfully references internet culture and the phenomenon of "brainrot" - the overconsumption of low-quality internet content and memes. The obstacles represent popular slang terms that have dominated online spaces.

## 📄 License

This is a fun personal project. Feel free to modify and share!

## 🤝 Contributing

This is an open project! Feel free to:
- Report bugs
- Suggest new features
- Add new obstacles or collectibles
- Improve game mechanics

---

**Made with ❤️ and a healthy dose of internet culture**

*Now go escape that tsunami!* 🏃💨🌊
