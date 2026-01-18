# 🌊 Escape Tsunami For Brainrots - 3D Browser Replica 🌊

A **3D browser-based replica** of the popular Roblox game "Escape Tsunami For Brainrots"! Built with Three.js for immersive WebGL graphics.

## 🎮 Game Description

Run across a long track to collect valuable Brainrots and bring them back to your home base before periodic tsunami waves sweep the area! Use safe zones to survive the waves, upgrade your speed and carrying capacity, and rebirth for permanent multipliers. The farther you venture, the rarer the Brainrots you'll find!

## 🚀 How to Play

1. Open `index.html` in any modern web browser
2. Click "START GAME" to begin
3. **Collect Phase**: Run down the track (W/A/S/D or Arrow Keys) to collect glowing Brainrot spheres
4. **Return Phase**: Bring collected Brainrots back to the green HOME BASE to deposit them for money
5. **Tsunami Warning**: After 7 seconds, you'll get a 3-second warning before the first tsunami wave!
6. **Survive**: Get to blue SAFE ZONE platforms or return to HOME BASE before the wave hits
7. **Upgrade**: Use your money to buy Speed and Carry Capacity upgrades
8. **Rebirth**: Press R when you have enough Brainrots to rebirth for permanent money multipliers

## 🎯 Core Gameplay Loop

```
Collect Brainrots → Return to Base → Deposit for Money → Buy Upgrades → Collect More → Survive Tsunamis → Rebirth
```

## ⚡ Key Features

### Tsunami System
- **First Wave**: Comes at 7 seconds with a 3-second warning
- **Periodic Waves**: Returns every 15 seconds after the first
- **Warning System**: Visual "TSUNAMI WARNING!" text alerts you 3 seconds before
- **Safe Zones**: Blue elevated platforms every 100m provide safety
- **Home Base**: Green platform at spawn is always safe

### Brainrot Collection System
- **9 Rarity Tiers**: Common, Uncommon, Rare, Epic, Legendary, Mythical, Cosmic, Secret, Celestial
- **Distance-Based Spawning**: Rarer Brainrots only appear farther down the track
- **Value System**: Higher rarities worth more money and passive income
- **Color-Coded**: Each rarity has a unique color and glow effect
- **Carry Capacity**: Start with 1, upgrade to carry more at once

### Progression Systems
- **Money**: Earned by depositing Brainrots at home base
- **Speed Upgrades**: Increase movement speed (cost: 100 × 1.5^level)
- **Carry Upgrades**: Increase how many Brainrots you can carry (cost: 500 × 2^level)
- **Passive Income**: Each deposited Brainrot generates 10% of its value per second
- **Rebirth System**: Trade Brainrot count for permanent money multipliers

### 3D World
- **800m Long Track**: With distance markers every 50m
- **Safe Zone Platforms**: Every 100m (at 100m, 200m, 300m, etc.)
- **Dynamic Camera**: Follows player with smooth tracking
- **Realistic Lighting**: Shadows, fog, and emissive materials
- **Particle Effects**: Explosions when collecting or depositing

## 🎨 Brainrot Rarity System

| Rarity | Color | Distance Required | Base Value | Spawn Chance |
|--------|-------|------------------|------------|--------------|
| Common | Gray | 0m | $10 | 50% |
| Uncommon | Green | 50m | $25 | 25% |
| Rare | Blue | 100m | $50 | 15% |
| Epic | Purple | 150m | $100 | 6% |
| Legendary | Gold | 200m | $250 | 3% |
| Mythical | Magenta | 300m | $500 | 0.8% |
| Cosmic | Cyan | 400m | $1000 | 0.1% |
| Secret | Red | 500m | $2500 | 0.09% |
| Celestial | White | 600m | $5000 | 0.01% |

## 🛠️ Technical Details

### Built With:
- **Three.js** (r128) for 3D rendering and physics
- **WebGL** for hardware-accelerated graphics
- **Vanilla JavaScript** for game logic
- **CSS3** for UI overlay styling
- **LocalStorage** for persistent high scores

### Game Architecture:
- **Object-Oriented Design**: Player, Brainrots, Tsunami, Safe Zones
- **3D Collision Detection**: Distance-based collection and height-aware tsunami hits
- **Timed Events**: Tsunami spawning on precise intervals
- **Upgrade System**: Dynamic cost calculation with exponential scaling
- **State Management**: Game state, player stats, and progression tracking

### Controls:
- **Movement**: W/A/S/D or Arrow Keys (↑/←/↓/→)
- **Rebirth**: R key (when requirement met)

## 📁 Project Structure

```
.
├── index.html      # Main HTML with UI overlays
├── style.css       # Fullscreen 3D styling
├── game.js         # Complete game engine (~700 lines)
└── README.md       # This file
```

## 💡 Strategy Tips

1. **First 7 Seconds**: Rush out to collect nearby Common/Uncommon Brainrots
2. **Time Management**: Always watch the timer - return to base before the wave
3. **Safe Zone Strategy**: Use safe zones as checkpoints for deeper runs
4. **Upgrade Priority**: Get speed upgrades first for better collection efficiency
5. **Risk vs Reward**: Rarer Brainrots are worth more but require longer runs
6. **Passive Income**: Focus on total Brainrots deposited for long-term gains
7. **Rebirth Timing**: Rebirth when you can afford it to multiply all future earnings

## 🏆 Progression Milestones

- **$500**: Buy first carry capacity upgrade
- **$1000**: Reach 100m+ for Rare Brainrots
- **$5000**: Max out early speed upgrades
- **$10000**: First rebirth available (permanent 2x multiplier!)
- **$50000**: Venture to 400m+ for Cosmic Brainrots
- **$100000**: Multiple rebirths for exponential growth

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (Recommended - best performance)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Opera

**Requirements**: WebGL-capable device (all modern browsers support this)

## 📝 Differences from Roblox Version

This is a faithful recreation with some adaptations for browser gameplay:

**Similarities:**
- ✅ Collect-and-return gameplay loop
- ✅ Periodic tsunami wave system (7s first wave)
- ✅ Safe zone platforms
- ✅ 9 rarity tiers with distance-based spawning
- ✅ Speed and carry capacity upgrades
- ✅ Rebirth system with multipliers
- ✅ Money and passive income mechanics

**Browser Adaptations:**
- 🎮 Keyboard controls instead of mobile/gamepad
- 🎨 Simplified 3D graphics (optimized for web)
- 💾 LocalStorage instead of cloud saves
- 🚀 Instant loading (no download required!)

## 🎪 About "Brainrot"

This game playfully references internet culture and the phenomenon of "brainrot" - the overconsumption of low-quality internet content and memes. The gameplay loop is intentionally addictive and grindy, mimicking the viral nature of the content it parodies!

## 🔗 Original Game

This is a fan-made browser replica of the Roblox game:
- **Original**: [Escape Tsunami For Brainrots on Roblox](https://www.roblox.com/games/131623223084840/Escape-Tsunami-For-Brainrots)

## 📄 License

This is a fan project created for educational and entertainment purposes. Feel free to modify and share!

## 🤝 Contributing

Want to improve the game? Ideas:
- Add more Brainrot types and rarities
- Implement sound effects and music
- Create additional tsunami patterns
- Add achievements system
- Build mobile touch controls
- Implement multiplayer features

---

**Made with ❤️ and inspired by internet culture**

*Now go collect those Brainrots!* 🏃💨🌊

## 🎮 Quick Start Guide

1. **Download** or clone this repository
2. **Open** `index.html` in your browser
3. **Click** "START GAME"
4. **Collect** Brainrot spheres
5. **Return** to green home base
6. **Survive** the tsunami waves!
7. **Upgrade** and **Rebirth** to progress

That's it! No installation, no downloads, no accounts needed. Just pure browser-based gaming!
