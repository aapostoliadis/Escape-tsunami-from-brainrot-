// Three.js 3D Game Setup
let scene, camera, renderer;
let player, ground, tsunami;
let obstacles = [];
let collectibles = [];
let particles = [];

// Game State
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let gameSpeed = 0.15;
let frameCount = 0;

// Player settings
let playerLane = 0; // -1 = left, 0 = center, 1 = right
const laneWidth = 3;
let playerVelocityY = 0;
let isJumping = false;
const jumpStrength = 0.3;
const gravity = 0.015;

// Input tracking
const keys = {};

// Brainrot terms for obstacles
const brainrotTerms = [
    'SKIBIDI',
    'RIZZ',
    'SIGMA',
    'OHIO',
    'GYATT',
    'NPC',
    'FANUM',
    'CRINGE',
    'TIKTOK',
    'BRAINROT'
];

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (!gameRunning) return;

    if (e.key === 'ArrowLeft' && playerLane > -1) {
        playerLane--;
        e.preventDefault();
    }

    if (e.key === 'ArrowRight' && playerLane < 1) {
        playerLane++;
        e.preventDefault();
    }

    if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
        isJumping = true;
        playerVelocityY = jumpStrength;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize Three.js
function initThree() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 2, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Ground
    createGround();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Update high score display
    document.getElementById('highScore').textContent = highScore;
}

function createGround() {
    // Main ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.8
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -50;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lane markers
    const markerGeometry = new THREE.BoxGeometry(0.2, 0.1, 200);
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    const leftMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    leftMarker.position.set(-laneWidth, 0.05, -50);
    scene.add(leftMarker);

    const rightMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    rightMarker.position.set(laneWidth, 0.05, -50);
    scene.add(rightMarker);
}

function createPlayer() {
    // Player body
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4299e1 });
    player = new THREE.Mesh(bodyGeometry, bodyMaterial);
    player.position.set(0, 1, 5);
    player.castShadow = true;
    scene.add(player);

    // Player head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    player.add(head);

    // Player eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.6, 0.4);
    player.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.6, 0.4);
    player.add(rightEye);
}

function createTsunami() {
    // Tsunami wave - large blue wall with particles
    const waveGeometry = new THREE.BoxGeometry(20, 15, 5);
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a365d,
        transparent: true,
        opacity: 0.7
    });
    tsunami = new THREE.Mesh(waveGeometry, waveMaterial);
    tsunami.position.set(0, 7.5, 30);
    scene.add(tsunami);

    // Add foam particles on top
    const foamGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const foamMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < 20; i++) {
        const foam = new THREE.Mesh(foamGeometry, foamMaterial);
        foam.position.set(
            (Math.random() - 0.5) * 18,
            12 + Math.random() * 2,
            28 + Math.random() * 4
        );
        tsunami.add(foam);

        // Animate foam
        foam.userData.offset = Math.random() * Math.PI * 2;
    }
}

function createObstacle(lane, type) {
    const obstacleGroup = new THREE.Group();

    // Obstacle body
    const height = type === 'tall' ? 3 : 1.5;
    const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xe53e3e });
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.y = height / 2;
    obstacle.castShadow = true;
    obstacleGroup.add(obstacle);

    // Create text sprite
    const text = brainrotTerms[Math.floor(Math.random() * brainrotTerms.length)];
    const sprite = createTextSprite(text, 0.5);
    sprite.position.y = height / 2;
    sprite.position.z = 1;
    obstacleGroup.add(sprite);

    obstacleGroup.position.set(lane * laneWidth, 0, -30);
    obstacleGroup.userData = { type: 'obstacle', lane: lane, height: height };

    scene.add(obstacleGroup);
    obstacles.push(obstacleGroup);
}

function createCollectible(lane, height) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5
    });
    const collectible = new THREE.Mesh(geometry, material);
    collectible.position.set(lane * laneWidth, height, -30);
    collectible.castShadow = true;
    collectible.userData = { type: 'collectible', wobble: Math.random() * Math.PI * 2 };

    scene.add(collectible);
    collectibles.push(collectible);
}

function createTextSprite(text, scale) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'white';
    context.font = 'bold 40px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(scale * 4, scale * 2, 1);

    return sprite;
}

function createParticleExplosion(position, color) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: color });

    for (let i = 0; i < 15; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            ),
            life: 60
        };
        scene.add(particle);
        particles.push(particle);
    }
}

function startGame() {
    // Reset game state
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 0.15;
    frameCount = 0;
    playerLane = 0;
    playerVelocityY = 0;
    isJumping = false;

    // Clear arrays
    obstacles.forEach(obs => scene.remove(obs));
    collectibles.forEach(col => scene.remove(col));
    particles.forEach(p => scene.remove(p));
    obstacles = [];
    collectibles = [];
    particles = [];

    // Remove old objects
    if (player) scene.remove(player);
    if (tsunami) scene.remove(tsunami);

    // Create game objects
    createPlayer();
    createTsunami();

    // Hide overlays
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');

    // Update UI
    updateUI();

    // Start game loop
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    frameCount++;

    // Update difficulty
    if (frameCount % 300 === 0) {
        gameSpeed += 0.02;
    }

    // Update player position
    updatePlayer();

    // Update tsunami
    updateTsunami();

    // Spawn obstacles
    if (frameCount % 80 === 0) {
        const lane = Math.floor(Math.random() * 3) - 1;
        const type = Math.random() > 0.5 ? 'tall' : 'short';
        createObstacle(lane, type);
    }

    // Spawn collectibles
    if (frameCount % 120 === 0) {
        const lane = Math.floor(Math.random() * 3) - 1;
        const height = 2 + Math.random() * 2;
        createCollectible(lane, height);
    }

    // Update obstacles
    updateObstacles();

    // Update collectibles
    updateCollectibles();

    // Update particles
    updateParticles();

    // Update camera
    camera.position.x = player.position.x * 0.3;
    camera.position.z = player.position.z + 8;
    camera.lookAt(player.position.x, player.position.y, player.position.z - 5);

    // Update score
    score += 1;
    updateUI();

    // Check if tsunami caught player
    if (tsunami.position.z > player.position.z) {
        gameOver();
        return;
    }

    // Render scene
    renderer.render(scene, camera);

    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    // Smooth lane transition
    const targetX = playerLane * laneWidth;
    player.position.x += (targetX - player.position.x) * 0.15;

    // Jumping physics
    if (isJumping) {
        playerVelocityY -= gravity;
        player.position.y += playerVelocityY;

        if (player.position.y <= 1) {
            player.position.y = 1;
            playerVelocityY = 0;
            isJumping = false;
        }
    }

    // Player rotation for style
    player.rotation.y = Math.sin(frameCount * 0.05) * 0.1;
}

function updateTsunami() {
    // Move tsunami forward
    tsunami.position.z += gameSpeed * 0.8;

    // Animate foam
    tsunami.children.forEach((foam, i) => {
        foam.position.y = 12 + Math.sin(frameCount * 0.05 + foam.userData.offset) * 0.5;
    });

    // Add threatening effect
    tsunami.material.opacity = 0.7 + Math.sin(frameCount * 0.1) * 0.1;
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.position.z += gameSpeed;

        // Rotate for effect
        obstacle.rotation.y += 0.02;

        // Check collision
        if (Math.abs(obstacle.position.z - player.position.z) < 1) {
            if (Math.abs(obstacle.position.x - player.position.x) < 1) {
                if (player.position.y < obstacle.userData.height + 0.5) {
                    // Hit!
                    lives--;
                    updateUI();
                    createParticleExplosion(obstacle.position, 0xff0000);
                    scene.remove(obstacle);
                    obstacles.splice(i, 1);

                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                    continue;
                }
            }
        }

        // Remove if passed
        if (obstacle.position.z > 10) {
            scene.remove(obstacle);
            obstacles.splice(i, 1);
        }
    }
}

function updateCollectibles() {
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        collectible.position.z += gameSpeed;

        // Wobble animation
        collectible.userData.wobble += 0.1;
        collectible.position.y += Math.sin(collectible.userData.wobble) * 0.02;
        collectible.rotation.y += 0.05;

        // Check collision
        if (Math.abs(collectible.position.z - player.position.z) < 1) {
            if (Math.abs(collectible.position.x - player.position.x) < 1.5) {
                if (Math.abs(collectible.position.y - player.position.y) < 2) {
                    // Collected!
                    score += 500;
                    createParticleExplosion(collectible.position, 0xffd700);
                    scene.remove(collectible);
                    collectibles.splice(i, 1);
                    continue;
                }
            }
        }

        // Remove if passed
        if (collectible.position.z > 10) {
            scene.remove(collectible);
            collectibles.splice(i, 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.y -= 0.01; // Gravity
        particle.userData.life--;

        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(i, 1);
        }
    }
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
initThree();

// Start animation loop for scene (even when game not running)
function animate() {
    requestAnimationFrame(animate);
    if (!gameRunning) {
        renderer.render(scene, camera);
    }
}
animate();
