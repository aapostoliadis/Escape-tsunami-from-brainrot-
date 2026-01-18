# 🌊 Escape Tsunami from Brainrot! 🌊

A fast-paced **3D endless runner** browser game where you must outrun a tsunami wave while avoiding brainrot obstacles in stunning Three.js graphics!

## 🎮 Game Description

Run for your life in full 3D as a massive tsunami of internet brainrot chases you down! Navigate between three lanes, jump over obstacles, and dodge various internet trends and memes represented as 3D objects. Collect golden spheres for bonus points and see how long you can survive!

## 🚀 How to Play

1. Open `index.html` in any modern web browser
2. Click "START GAME" to begin
3. Use controls to avoid 3D obstacles:
   - **LEFT ARROW**: Move to left lane
   - **RIGHT ARROW**: Move to right lane
   - **SPACE** or **UP ARROW**: Jump over obstacles
4. Collect glowing golden spheres for bonus points (+500 each)
5. Survive as long as you can before the 3D tsunami catches you!

## 🎯 Features

- **Full 3D Graphics**: Rendered with Three.js for immersive gameplay
- **Dynamic Camera**: Third-person view that follows your character
- **3-Lane System**: Dodge left and right between lanes
- **Dynamic Difficulty**: Game speed increases over time
- **Lives System**: Start with 3 lives (hearts)
- **Score Tracking**: High score saved in browser localStorage
- **Brainrot Obstacles**: Dodge 3D boxes with popular internet slang:
  - SKIBIDI
  - RIZZ
  - SIGMA
  - GYATT
  - OHIO
  - NPC
  - FANUM
  - CRINGE
  - TIKTOK
  - BRAINROT
- **3D Collectibles**: Golden glowing spheres at various heights
- **Particle Effects**: 3D particle explosions for collisions and collections
- **Progressive Tsunami**: Massive 3D wave with animated foam
- **Realistic Lighting**: Dynamic shadows and lighting effects
- **Fog Effects**: Distance fog for atmosphere

## 🛠️ Technical Details

### Built With:
- **Three.js** (r128) for 3D rendering
- **WebGL** for hardware-accelerated graphics
- **Vanilla JavaScript** for game logic
- **CSS3** for UI overlay styling
- Only one external dependency (Three.js from CDN)

### Game Mechanics:
- **3D Physics**: Gravity-based jumping with realistic acceleration
- **3D Collision Detection**: Spatial collision system with height awareness
- **Lane-Based Movement**: Smooth transitions between three lanes
- **Dynamic Spawning**: Random obstacle and collectible generation across lanes
- **Animation**: 60 FPS game loop using requestAnimationFrame
- **Camera System**: Dynamic third-person camera following player
- **Shadow Mapping**: Real-time shadow rendering

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
- 3D character with blue body and skin-toned head
- Complete with eyes and dynamic animations
- Can move between three lanes and jump
- Smooth lane transitions and rotation effects

### Tsunami Wave
- Massive 3D wall (20x15x5 units) of dark blue water
- 20 animated foam particles on the wave surface
- Pulsating opacity for threatening effect
- Gradually advances from behind

### Obstacles (Red)
- 3D red boxes in two sizes: tall (3 units) and short (1.5 units)
- Display brainrot terms as text sprites
- Spawn randomly across the three lanes
- Rotating animation for visual interest
- Lose 1 life on collision

### Collectibles (Gold)
- 3D golden spheres with emissive glow
- Wobbling animation at various heights (2-4 units)
- Worth 500 bonus points each
- Rotating and floating effects

### Environment
- Brown ground plane (10x200 units) with shadows
- Yellow lane markers to guide movement
- Sky-blue background with distance fog
- Directional lighting with real-time shadows

## 🏆 Scoring

- **Survival**: +1 point per frame
- **Collectibles**: +500 points per emoji collected
- **High Score**: Automatically saved in browser

## 💡 Tips for High Scores

1. Master lane switching - keep an eye on obstacles in all lanes
2. Time your jumps carefully - you can jump over short obstacles
3. Stay in the center lane when uncertain for more options
4. Watch the 3D tsunami behind you - it speeds up over time!
5. Collect golden spheres when safe - they're worth 500 points each
6. Use the lane markers as visual guides
7. Jump to collect high-altitude spheres

## 🌐 Browser Compatibility

Works on all modern browsers with WebGL support:
- Chrome/Edge (Recommended for best performance)
- Firefox
- Safari
- Opera

**Note**: Requires WebGL-capable device. Most modern desktops, laptops, and mobile devices support WebGL.

## 📝 Future Enhancement Ideas

- VR/AR support for immersive gameplay
- Multiple 3D character models to choose from
- Power-ups (slow time, shield, magnet, etc.)
- Different 3D biomes/environments (desert, city, ocean)
- Mobile touch controls (swipe left/right, tap to jump)
- Sound effects and background music
- Online leaderboard system
- More obstacle varieties and patterns
- Procedurally generated environments
- Day/night cycle
- Weather effects (rain, snow)

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
