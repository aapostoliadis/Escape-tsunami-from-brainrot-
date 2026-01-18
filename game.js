// Three.js 3D Game Setup - Escape Tsunami For Brainrots Replica
let scene, camera, renderer;
let player, ground, homeBase;
let tsunamiWave = null;
let brainrots = [];
let safezones = [];
let particles = [];

// Audio
let bgMusic, collectSound, depositSound, warningSound, deathSound;
let audioInitialized = false;

// Game State
let gameRunning = false;
let money = 0;
let totalBrainrots = 0;
let carriedBrainrots = [];
let passiveIncome = 0;

// Player stats
let playerSpeed = 16;
let carryCapacity = 1;
let speedLevel = 1;
let carryLevel = 1;
let rebirths = 0;
let moneyMultiplier = 1;

// Tsunami system
let tsunamiTimer = 0;
let tsunamiActive = false;
let tsunamiWarningPlayed = false;
let tsunamiWarningTime = 3; // 3 second warning
let nextTsunamiTime = 7; // First wave at 7 seconds
let tsunamiInterval = 15; // Waves every 15 seconds after first
let tsunamiSpeed = 0.5;

// Input tracking
const keys = {};
const moveDirection = new THREE.Vector3();

// Brainrot rarity system
const brainrotRarities = [
    { name: 'Common', color: 0x808080, distance: 0, value: 10, chance: 0.5 },
    { name: 'Uncommon', color: 0x00ff00, distance: 50, value: 25, chance: 0.25 },
    { name: 'Rare', color: 0x0080ff, distance: 100, value: 50, chance: 0.15 },
    { name: 'Epic', color: 0x8000ff, distance: 150, value: 100, chance: 0.06 },
    { name: 'Legendary', color: 0xffd700, distance: 200, value: 250, chance: 0.03 },
    { name: 'Mythical', color: 0xff00ff, distance: 300, value: 500, chance: 0.008 },
    { name: 'Cosmic', color: 0x00ffff, distance: 400, value: 1000, chance: 0.001 },
    { name: 'Secret', color: 0xff0000, distance: 500, value: 2500, chance: 0.0009 },
    { name: 'Celestial', color: 0xffffff, distance: 600, value: 5000, chance: 0.0001 }
];

// Upgrade costs
const speedUpgradeCost = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
const carryUpgradeCost = (level) => Math.floor(500 * Math.pow(2, level - 1));
const rebirthRequirement = () => Math.floor(10000 * Math.pow(2, rebirths));

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' && gameRunning) {
        checkRebirth();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize Three.js
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 300);

    // Camera - third person behind player at 20 degrees up
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.rotation.x = -Math.PI / 9; // 20 degrees down

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
    directionalLight.position.set(20, 50, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.far = 200;
    scene.add(directionalLight);

    // Create world
    createGround();
    createHomeBase();
    createSafeZones();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Initialize audio
    initAudio();
}

function initAudio() {
    // Background music
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    // Using royalty-free placeholder - replace with actual game music
    bgMusic.src = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c6b0c16c91.mp3';

    // Sound effects
    collectSound = new Audio();
    collectSound.volume = 0.5;
    collectSound.src = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c5e5a8d2e3.mp3';

    depositSound = new Audio();
    depositSound.volume = 0.6;
    depositSound.src = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';

    warningSound = new Audio();
    warningSound.volume = 0.7;
    warningSound.src = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3';

    deathSound = new Audio();
    deathSound.volume = 0.6;
    deathSound.src = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_89c23af2cf.mp3';
}

function playSound(sound) {
    if (sound && audioInitialized) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function startBackgroundMusic() {
    if (bgMusic && audioInitialized) {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
}

function createGround() {
    // Main long track
    const groundGeometry = new THREE.PlaneGeometry(40, 800);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.8
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -400;
    ground.receiveShadow = true;
    scene.add(ground);

    // Distance markers
    for (let i = 0; i <= 700; i += 50) {
        const markerGeometry = new THREE.BoxGeometry(40, 0.2, 1);
        const markerMaterial = new THREE.MeshStandardMaterial({
            color: i % 100 === 0 ? 0xffff00 : 0xffffff
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 0.1, -i);
        scene.add(marker);

        // Distance text
        const text = createTextSprite(`${i}m`, 2);
        text.position.set(15, 3, -i);
        scene.add(text);
    }

    // Side walls
    const wallGeometry = new THREE.BoxGeometry(1, 5, 800);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-20, 2.5, -400);
    leftWall.castShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(20, 2.5, -400);
    rightWall.castShadow = true;
    scene.add(rightWall);
}

function createHomeBase() {
    // Home base platform (safe zone)
    const baseGeometry = new THREE.BoxGeometry(30, 2, 30);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x00aa00,
        emissive: 0x004400,
        emissiveIntensity: 0.5
    });
    homeBase = new THREE.Mesh(baseGeometry, baseMaterial);
    homeBase.position.set(0, 1, 15);
    homeBase.castShadow = true;
    homeBase.receiveShadow = true;
    scene.add(homeBase);

    // Base sign
    const signText = createTextSprite('HOME BASE\nDEPOSIT HERE', 3);
    signText.position.set(0, 6, 15);
    scene.add(signText);

    // Deposit indicator
    const ringGeometry = new THREE.TorusGeometry(8, 0.5, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    const depositRing = new THREE.Mesh(ringGeometry, ringMaterial);
    depositRing.rotation.x = -Math.PI / 2;
    depositRing.position.set(0, 2.5, 15);
    scene.add(depositRing);
    homeBase.depositRing = depositRing;
}

function createSafeZones() {
    // Safe zone platforms every 100m
    for (let i = 100; i <= 700; i += 100) {
        const safeGeometry = new THREE.BoxGeometry(25, 1.5, 15);
        const safeMaterial = new THREE.MeshStandardMaterial({
            color: 0x0080ff,
            emissive: 0x004080,
            emissiveIntensity: 0.3
        });
        const safezone = new THREE.Mesh(safeGeometry, safeMaterial);
        safezone.position.set(0, 4, -i);
        safezone.castShadow = true;
        safezone.receiveShadow = true;
        scene.add(safezone);
        safezones.push(safezone);

        // Safe zone sign
        const sign = createTextSprite('SAFE ZONE', 1.5);
        sign.position.set(0, 7, -i);
        scene.add(sign);
    }
}

function createPlayer() {
    // Player body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4299e1 });
    player = new THREE.Mesh(bodyGeometry, bodyMaterial);
    player.position.set(0, 2.25, 10);
    player.castShadow = true;
    scene.add(player);

    // Player head
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    player.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 1.9, 0.5);
    player.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 1.9, 0.5);
    player.add(rightEye);
}

function spawnBrainrots() {
    // Spawn brainrots along the track
    for (let distance = 20; distance <= 700; distance += 20) {
        const rarity = getBrainrotRarity(distance);

        // Random spawn chance
        if (Math.random() < 0.3) {
            const brainrot = createBrainrot(rarity, distance);
            scene.add(brainrot);
            brainrots.push(brainrot);
        }
    }
}

function getBrainrotRarity(distance) {
    // Determine rarity based on distance
    let availableRarities = brainrotRarities.filter(r => distance >= r.distance);

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;

    for (let i = availableRarities.length - 1; i >= 0; i--) {
        cumulative += availableRarities[i].chance;
        if (random <= cumulative) {
            return availableRarities[i];
        }
    }

    return availableRarities[0]; // Fallback to most common
}

function createBrainrot(rarity, distance) {
    const geometry = new THREE.SphereGeometry(0.8, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color: rarity.color,
        emissive: rarity.color,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.3
    });

    const brainrot = new THREE.Mesh(geometry, material);
    brainrot.position.set(
        (Math.random() - 0.5) * 30,
        1.5,
        -distance + (Math.random() - 0.5) * 10
    );
    brainrot.castShadow = true;
    brainrot.userData = {
        rarity: rarity,
        wobble: Math.random() * Math.PI * 2,
        collected: false
    };

    // Add glow ring
    const ringGeometry = new THREE.TorusGeometry(1, 0.1, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: rarity.color });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    brainrot.add(ring);
    brainrot.ring = ring;

    return brainrot;
}

function createTsunami() {
    // Tsunami wave wall
    const waveGeometry = new THREE.BoxGeometry(60, 25, 10);
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a365d,
        transparent: true,
        opacity: 0.7,
        emissive: 0x0a1a2d,
        emissiveIntensity: 0.3
    });
    tsunamiWave = new THREE.Mesh(waveGeometry, waveMaterial);
    tsunamiWave.position.set(0, 12.5, 50);
    scene.add(tsunamiWave);

    // Foam particles
    const foamGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const foamMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });

    for (let i = 0; i < 30; i++) {
        const foam = new THREE.Mesh(foamGeometry, foamMaterial);
        foam.position.set(
            (Math.random() - 0.5) * 55,
            18 + Math.random() * 5,
            45 + Math.random() * 10
        );
        tsunamiWave.add(foam);
        foam.userData.offset = Math.random() * Math.PI * 2;
    }

    // Warning text
    const warningText = createTextSprite('TSUNAMI WARNING!\nGET TO SAFE ZONE!', 4);
    warningText.position.set(0, 35, 0);
    tsunamiWave.warningText = warningText;
    scene.add(warningText);
}

function createTextSprite(text, scale) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;

    context.fillStyle = 'white';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = 'black';
    context.lineWidth = 4;

    const lines = text.split('\n');
    lines.forEach((line, i) => {
        const y = 128 + (i - lines.length / 2 + 0.5) * 60;
        context.strokeText(line, 256, y);
        context.fillText(line, 256, y);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(scale * 8, scale * 4, 1);

    return sprite;
}

function startGame() {
    gameRunning = true;
    tsunamiTimer = 0;
    tsunamiActive = false;
    tsunamiWarningPlayed = false;
    carriedBrainrots = [];

    // Enable audio on first user interaction
    if (!audioInitialized) {
        audioInitialized = true;
        startBackgroundMusic();
    }

    // Clear old objects
    brainrots.forEach(b => scene.remove(b));
    brainrots = [];
    if (tsunamiWave) {
        scene.remove(tsunamiWave);
        if (tsunamiWave.warningText) scene.remove(tsunamiWave.warningText);
        tsunamiWave = null;
    }

    // Create player
    if (player) scene.remove(player);
    createPlayer();

    // Spawn brainrots
    spawnBrainrots();

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

    tsunamiTimer += 1/60; // Assuming 60 FPS

    // Handle tsunami spawning
    if (!tsunamiActive && tsunamiTimer >= nextTsunamiTime - tsunamiWarningTime) {
        if (!tsunamiWave) {
            createTsunami();
        }
        // Show warning
        if (tsunamiWave && tsunamiWave.warningText) {
            tsunamiWave.warningText.visible = true;
            // Play warning sound once
            if (!tsunamiWarningPlayed) {
                playSound(warningSound);
                tsunamiWarningPlayed = true;
            }
        }
    }

    if (!tsunamiActive && tsunamiTimer >= nextTsunamiTime) {
        tsunamiActive = true;
        if (tsunamiWave && tsunamiWave.warningText) {
            tsunamiWave.warningText.visible = false;
        }
    }

    // Update player
    updatePlayer();

    // Update tsunami
    if (tsunamiWave) {
        updateTsunami();
    }

    // Check if tsunami passed
    if (tsunamiActive && tsunamiWave && tsunamiWave.position.z < -750) {
        // Remove tsunami
        scene.remove(tsunamiWave);
        if (tsunamiWave.warningText) scene.remove(tsunamiWave.warningText);
        tsunamiWave = null;
        tsunamiActive = false;
        tsunamiWarningPlayed = false;
        tsunamiTimer = 0;
        nextTsunamiTime = tsunamiInterval;
    }

    // Update brainrots
    updateBrainrots();

    // Check brainrot collection
    checkBrainrotCollection();

    // Check deposit
    checkDeposit();

    // Update particles
    updateParticles();

    // Passive income
    if (Math.floor(tsunamiTimer * 60) % 60 === 0) {
        money += passiveIncome * moneyMultiplier;
    }

    // Update camera to follow player (behind at 20 degrees up)
    const cameraDistance = 12;
    const cameraHeight = 5;

    // Position camera behind player
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + cameraDistance;
    camera.position.y = player.position.y + cameraHeight;

    // Look at player's position (slightly ahead)
    camera.lookAt(player.position.x, player.position.y, player.position.z - 3);

    // Update UI
    updateUI();

    // Render
    renderer.render(scene, camera);

    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    // Movement
    moveDirection.set(0, 0, 0);

    if (keys['w'] || keys['ArrowUp']) moveDirection.z -= 1;
    if (keys['s'] || keys['ArrowDown']) moveDirection.z += 1;
    if (keys['a'] || keys['ArrowLeft']) moveDirection.x -= 1;
    if (keys['d'] || keys['ArrowRight']) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        const speed = playerSpeed * 0.1;
        player.position.x += moveDirection.x * speed;
        player.position.z += moveDirection.z * speed;

        // Clamp to track bounds
        player.position.x = Math.max(-18, Math.min(18, player.position.x));
        player.position.z = Math.max(-700, Math.min(10, player.position.z));

        // Rotate player to face movement direction
        player.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
    }

    // Check safe zone height
    let onSafeZone = false;
    if (player.position.z > 5 && player.position.z < 25) {
        // On home base
        player.position.y = 3.25;
        onSafeZone = true;
    } else {
        for (let safezone of safezones) {
            const distance = Math.abs(player.position.z - safezone.position.z);
            if (distance < 7.5 && Math.abs(player.position.x) < 12.5) {
                player.position.y = 5.25;
                onSafeZone = true;
                break;
            }
        }
    }

    if (!onSafeZone) {
        player.position.y = 1.25;
    }
}

function updateTsunami() {
    if (!tsunamiActive) return;

    // Move tsunami down the track
    tsunamiWave.position.z -= tsunamiSpeed;

    // Animate foam
    tsunamiWave.children.forEach((foam, i) => {
        if (foam.userData.offset !== undefined) {
            foam.position.y = 18 + Math.sin(tsunamiTimer * 5 + foam.userData.offset) * 0.8;
        }
    });

    // Pulsating effect
    tsunamiWave.material.opacity = 0.7 + Math.sin(tsunamiTimer * 3) * 0.1;

    // Check if player is caught
    if (player.position.z > tsunamiWave.position.z - 5 && player.position.y < 4) {
        gameOver('Consumed by the tsunami!');
    }
}

function updateBrainrots() {
    brainrots.forEach(brainrot => {
        if (brainrot.userData.collected) return;

        // Wobble animation
        brainrot.userData.wobble += 0.05;
        brainrot.position.y = 1.5 + Math.sin(brainrot.userData.wobble) * 0.3;
        brainrot.rotation.y += 0.03;

        if (brainrot.ring) {
            brainrot.ring.rotation.z += 0.05;
        }
    });
}

function checkBrainrotCollection() {
    if (carriedBrainrots.length >= carryCapacity) return;

    brainrots.forEach(brainrot => {
        if (brainrot.userData.collected) return;

        const distance = player.position.distanceTo(brainrot.position);
        if (distance < 2) {
            // Collect brainrot
            brainrot.userData.collected = true;
            carriedBrainrots.push(brainrot.userData.rarity);
            scene.remove(brainrot);

            // Visual feedback
            createParticleExplosion(brainrot.position, brainrot.userData.rarity.color);

            // Sound effect
            playSound(collectSound);
        }
    });
}

function checkDeposit() {
    if (carriedBrainrots.length === 0) return;

    // Check if player is at home base
    const distanceToBase = player.position.distanceTo(new THREE.Vector3(0, 2, 15));
    if (distanceToBase < 8) {
        // Deposit all carried brainrots
        carriedBrainrots.forEach(rarity => {
            money += rarity.value * moneyMultiplier;
            passiveIncome += rarity.value * 0.1;
            totalBrainrots++;
        });

        carriedBrainrots = [];

        // Visual feedback
        createParticleExplosion(homeBase.position, 0xffff00);

        // Sound effect
        playSound(depositSound);
    }
}

function createParticleExplosion(position, color) {
    const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: color });

    for (let i = 0; i < 20; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            ),
            life: 60
        };
        scene.add(particle);
        particles.push(particle);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.y -= 0.02;
        particle.userData.life--;

        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(i, 1);
        }
    }
}

function updateUI() {
    document.getElementById('score').textContent = `$${Math.floor(money)}`;
    document.getElementById('highScore').textContent = `Brainrots: ${totalBrainrots}`;
    document.getElementById('lives').textContent = `Carry: ${carriedBrainrots.length}/${carryCapacity}`;
}

function checkRebirth() {
    const required = rebirthRequirement();
    if (totalBrainrots >= required) {
        rebirths++;
        moneyMultiplier = 1 + rebirths;
        speedLevel = 1;
        playerSpeed = 16;
        alert(`Rebirth ${rebirths}! Money multiplier now ${moneyMultiplier}x`);
        updateUI();
    }
}

function gameOver(reason) {
    gameRunning = false;

    // Play death sound
    playSound(deathSound);

    document.getElementById('finalScore').textContent = `$${Math.floor(money)} | ${totalBrainrots} Brainrots`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Shop functions (called from UI buttons)
function buySpeedUpgrade() {
    const cost = speedUpgradeCost(speedLevel);
    if (money >= cost) {
        money -= cost;
        speedLevel++;
        playerSpeed = 16 + speedLevel * 2;
        updateUI();
    }
}

function buyCarryUpgrade() {
    const cost = carryUpgradeCost(carryLevel);
    if (money >= cost) {
        money -= cost;
        carryLevel++;
        carryCapacity = carryLevel;
        updateUI();
    }
}

// Initialize
initThree();

// Animation loop for menu
function animate() {
    requestAnimationFrame(animate);
    if (!gameRunning) {
        renderer.render(scene, camera);
    }
}
animate();
