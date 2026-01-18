// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let gameSpeed = 5;
let frameCount = 0;

// Player Object
const player = {
    x: 150,
    y: 450,
    width: 40,
    height: 60,
    velocityY: 0,
    jumping: false,
    sliding: false,
    grounded: true
};

// Tsunami Wave
const tsunami = {
    x: -200,
    width: 200,
    speed: 2,
    intensity: 0
};

// Arrays for game objects
let obstacles = [];
let collectibles = [];
let particles = [];

// Brainrot terms for obstacles
const brainrotTerms = [
    '💀 SKIBIDI',
    '🧠 RIZZ',
    '😤 SIGMA',
    '🤡 OHIO',
    '👹 GYATT',
    '🗿 NPC',
    '💩 FANUM',
    '🎪 CRINGE',
    '📱 TIKTOK',
    '🤯 BRAINROT'
];

// Based collectibles
const basedEmojis = ['💎', '⭐', '🏆', '👑', '💪', '🔥', '✨'];

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Update high score display
document.getElementById('highScore').textContent = highScore;

function handleKeyDown(e) {
    if (!gameRunning) return;

    if ((e.key === ' ' || e.key === 'ArrowUp') && player.grounded && !player.sliding) {
        player.velocityY = -15;
        player.jumping = true;
        player.grounded = false;
        e.preventDefault();
    }

    if (e.key === 'ArrowDown' && player.grounded) {
        player.sliding = true;
        player.height = 30;
        player.y = 480;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowDown') {
        player.sliding = false;
        player.height = 60;
        player.y = 450;
    }
}

function startGame() {
    // Reset game state
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 5;
    frameCount = 0;
    obstacles = [];
    collectibles = [];
    particles = [];

    // Reset player
    player.y = 450;
    player.velocityY = 0;
    player.jumping = false;
    player.sliding = false;
    player.grounded = true;

    // Reset tsunami
    tsunami.x = -200;
    tsunami.intensity = 0;

    // Hide overlays
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');

    // Update UI
    updateUI();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameRunning) return;

    frameCount++;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game difficulty
    if (frameCount % 300 === 0) {
        gameSpeed += 0.5;
        tsunami.speed += 0.1;
    }

    // Draw background
    drawBackground();

    // Update and draw tsunami
    updateTsunami();
    drawTsunami();

    // Update and draw player
    updatePlayer();
    drawPlayer();

    // Spawn obstacles and collectibles
    if (frameCount % 90 === 0) {
        spawnObstacle();
    }
    if (frameCount % 150 === 0) {
        spawnCollectible();
    }

    // Update and draw obstacles
    updateObstacles();
    drawObstacles();

    // Update and draw collectibles
    updateCollectibles();
    drawCollectibles();

    // Update and draw particles
    updateParticles();
    drawParticles();

    // Update score
    score += 1;
    updateUI();

    // Check if tsunami caught player
    if (tsunami.x + tsunami.width > player.x) {
        gameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, 510, canvas.width, 90);

    // Ground line
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 510);
    ctx.lineTo(canvas.width, 510);
    ctx.stroke();

    // Ground details
    ctx.fillStyle = '#6b5345';
    for (let i = 0; i < 20; i++) {
        const x = (frameCount * 3 + i * 50) % canvas.width;
        ctx.fillRect(x, 520 + Math.sin(i) * 5, 30, 3);
    }
}

function updatePlayer() {
    // Apply gravity
    if (!player.grounded) {
        player.velocityY += 0.6;
        player.y += player.velocityY;
    }

    // Ground collision
    if (player.y >= 450 && !player.sliding) {
        player.y = 450;
        player.velocityY = 0;
        player.grounded = true;
        player.jumping = false;
    } else if (player.y >= 480 && player.sliding) {
        player.y = 480;
        player.grounded = true;
    }
}

function drawPlayer() {
    // Player body
    ctx.fillStyle = '#4299e1';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player outline
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);

    // Player face
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(player.x + 10, player.y + 15, 5, 5); // Eye 1
    ctx.fillRect(player.x + 25, player.y + 15, 5, 5); // Eye 2

    // Player emoji indicator
    ctx.font = '20px Arial';
    ctx.fillText('🏃', player.x + 5, player.y - 5);
}

function updateTsunami() {
    tsunami.x += tsunami.speed;
    tsunami.intensity = Math.min(tsunami.intensity + 0.01, 1);

    // Keep tsunami behind player but advancing
    if (tsunami.x < -50) {
        tsunami.x += 0.5;
    }
}

function drawTsunami() {
    // Wave gradient
    const gradient = ctx.createLinearGradient(tsunami.x, 0, tsunami.x + tsunami.width, 0);
    gradient.addColorStop(0, '#1a365d');
    gradient.addColorStop(0.5, '#2c5282');
    gradient.addColorStop(1, '#3182ce');

    ctx.fillStyle = gradient;

    // Draw wave with curve
    ctx.beginPath();
    ctx.moveTo(tsunami.x, canvas.height);
    ctx.lineTo(tsunami.x, 300);

    for (let i = 0; i <= 10; i++) {
        const x = tsunami.x + tsunami.width * (i / 10);
        const y = 300 + Math.sin(frameCount * 0.05 + i) * 30;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(tsunami.x + tsunami.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Wave foam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 5; i++) {
        const x = tsunami.x + tsunami.width - 20 + Math.sin(frameCount * 0.1 + i) * 10;
        const y = 280 + i * 40 + Math.cos(frameCount * 0.08 + i) * 15;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    // Warning text
    if (tsunami.x > -100) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('TSUNAMI!', tsunami.x + 50, 250);
    }
}

function spawnObstacle() {
    const randomTerm = brainrotTerms[Math.floor(Math.random() * brainrotTerms.length)];
    const height = Math.random() > 0.5 ? 60 : 40;
    const y = height === 60 ? 450 : 470;

    obstacles.push({
        x: canvas.width,
        y: y,
        width: 70,
        height: height,
        text: randomTerm,
        speed: gameSpeed
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacles[i].speed;

        // Check collision with player
        if (checkCollision(player, obstacles[i])) {
            lives--;
            updateUI();

            // Create damage particles
            createParticles(obstacles[i].x, obstacles[i].y, '#ff0000');

            obstacles.splice(i, 1);

            if (lives <= 0) {
                gameOver();
                return;
            }
            continue;
        }

        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Obstacle body
        ctx.fillStyle = '#e53e3e';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Obstacle outline
        ctx.strokeStyle = '#9b2c2c';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Obstacle text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obstacle.text, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2 + 5);
        ctx.textAlign = 'left';
    });
}

function spawnCollectible() {
    const randomEmoji = basedEmojis[Math.floor(Math.random() * basedEmojis.length)];
    const y = 350 + Math.random() * 100;

    collectibles.push({
        x: canvas.width,
        y: y,
        width: 30,
        height: 30,
        emoji: randomEmoji,
        speed: gameSpeed,
        wobble: 0
    });
}

function updateCollectibles() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].x -= collectibles[i].speed;
        collectibles[i].wobble += 0.1;

        // Check collision with player
        if (checkCollision(player, collectibles[i])) {
            score += 500;
            createParticles(collectibles[i].x, collectibles[i].y, '#ffd700');
            collectibles.splice(i, 1);
            continue;
        }

        // Remove off-screen collectibles
        if (collectibles[i].x + collectibles[i].width < 0) {
            collectibles.splice(i, 1);
        }
    }
}

function drawCollectibles() {
    collectibles.forEach(collectible => {
        const wobbleY = Math.sin(collectible.wobble) * 5;

        ctx.font = '25px Arial';
        ctx.fillText(collectible.emoji, collectible.x, collectible.y + wobbleY);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffd700';
        ctx.fillText(collectible.emoji, collectible.x, collectible.y + wobbleY);
        ctx.shadowBlur = 0;
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            life: 30,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].velocityX;
        particles[i].y += particles[i].velocityY;
        particles[i].life--;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, 4, 4);
        ctx.globalAlpha = 1;
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateUI() {
    document.getElementById('score').textContent = score;

    const heartsArray = ['❤️', '❤️', '❤️'];
    document.getElementById('lives').textContent = heartsArray.slice(0, lives).join('');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

function gameOver() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}
