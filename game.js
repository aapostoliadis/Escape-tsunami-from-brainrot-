// Three.js 3D Game Setup - Escape Tsunami For Brainrots EXACT REPLICA
// High Quality Graphics Version with Advanced Post-Processing

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let scene, camera, renderer, composer;
let player, ground, homeBase;
let tsunamiWave = null;
let brainrots = [];
let storedBrainrots = []; // Brainrots in base storage
let safezones = [];
let particles = [];
let clouds = [];

// Audio
let bgMusic, collectSound, depositSound, warningSound, deathSound, upgradeSound;
let audioInitialized = false;

// Game State
let gameRunning = false;
let money = 0;
let totalBrainrots = 0;
let carriedBrainrots = [];
let passiveIncome = 0;

// Player stats
let playerSpeed = 20;
let carryCapacity = 1;
let jumpPower = 15;
let baseSlots = 10;

// Upgrade levels
let speedLevel = 1;
let carryLevel = 1;
let jumpLevel = 1;
let baseSlotsLevel = 1;
let rebirths = 0;
let moneyMultiplier = 1;
let radioactiveCoins = 0;
let slowModeEnabled = false;

// Player physics
let playerVelocityY = 0;
let isJumping = false;
const gravity = 3.5; // Increased gravity for snappier 0.2 sec jumps

// Tsunami system
let tsunamiTimer = 0;
let tsunamiActive = false;
let tsunamiWarningPlayed = false;
let tsunamiWarningTime = 3;
let nextTsunamiTime = 7;
let tsunamiInterval = 15;
let tsunamiSpeed = 0.6;
let tsunamiBaseSpeed = 0.6;
let slowZones = [];

// Input tracking
const keys = {};
const moveDirection = new THREE.Vector3();

// Camera controls
let cameraAngleH = 0; // Horizontal rotation
let cameraAngleV = 0.35; // Vertical angle (20 degrees = ~0.35 radians)
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Mutation types with multipliers and colors
const mutations = [
    { name: 'None', multiplier: 1, color: null, chance: 0.80 },
    { name: 'Emerald', multiplier: 1.2, color: 0x00ff00, emissive: 0x00aa00, chance: 0.12 },
    { name: 'Gold', multiplier: 2, color: 0xffd700, emissive: 0xffaa00, chance: 0.05 },
    { name: 'Blood', multiplier: 2, color: 0xff0000, emissive: 0xaa0000, chance: 0.02 },
    { name: 'Diamond', multiplier: 2.5, color: 0x00ffff, emissive: 0x0099ff, chance: 0.008 },
    { name: 'Electric', multiplier: 3, color: 0xffff00, emissive: 0xffff00, chance: 0.002 }
];

// Brainrot rarity system (96 total brainrots)
const brainrotRarities = [
    { name: 'Common', color: 0x808080, distance: 0, value: 2, maxDistance: 50, count: 20, chance: 0.5 },
    { name: 'Uncommon', color: 0x00ff00, distance: 50, value: 5, maxDistance: 100, count: 15, chance: 0.25 },
    { name: 'Rare', color: 0x0080ff, distance: 100, value: 12, maxDistance: 150, count: 12, chance: 0.15 },
    { name: 'Epic', color: 0x8000ff, distance: 150, value: 30, maxDistance: 200, count: 10, chance: 0.06 },
    { name: 'Legendary', color: 0xffd700, distance: 200, value: 75, maxDistance: 300, count: 8, chance: 0.03 },
    { name: 'Mythical', color: 0xff00ff, distance: 300, value: 200, maxDistance: 400, count: 6, chance: 0.008 },
    { name: 'Cosmic', color: 0x00ffff, distance: 400, value: 500, maxDistance: 500, count: 4, chance: 0.001 },
    { name: 'Secret', color: 0xff0000, distance: 500, value: 1500, maxDistance: 600, count: 2, chance: 0.0009 },
    { name: 'Celestial', color: 0xffffff, distance: 600, value: 5000, maxDistance: 700, count: 1, chance: 0.0001 }
];

// Upgrade costs
const speedUpgradeCost = (level) => Math.floor(100 * Math.pow(1.5, level - 1));
const carryUpgradeCost = (level) => Math.floor(500 * Math.pow(2, level - 1));
const jumpUpgradeCost = (level) => Math.floor(300 * Math.pow(1.8, level - 1));
const baseSlotsUpgradeCost = (level) => Math.floor(1000 * Math.pow(2.5, level - 1));
const rebirthRequirement = () => 10 + rebirths * 5; // Brainrot count requirement

// UI Shop state
let shopVisible = false;

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Slow Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
    const slowModeToggle = document.getElementById('slowModeToggle');
    if (slowModeToggle) {
        slowModeToggle.addEventListener('change', (e) => {
            slowModeEnabled = e.target.checked;
            if (slowModeEnabled) {
                tsunamiSpeed = 0.3; // Slower tsunami
                playerSpeed = playerSpeed * 0.7; // Slower player
            } else {
                tsunamiSpeed = 0.6; // Normal tsunami
                playerSpeed = 20 + (speedLevel - 1) * 5; // Reset to normal based on level
            }
        });
    }
});

// Global functions for HTML onclick handlers
window.openShopUI = function() {
    if (gameRunning) {
        toggleShop();
    }
};

window.attemptRebirth = function() {
    if (gameRunning) {
        checkRebirth();
    }
};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (!gameRunning) return;

    // Jump
    if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
        isJumping = true;
        playerVelocityY = jumpPower * 1.4; // Adjusted for quick 0.2 sec jump
        e.preventDefault();
    }

    // Rebirth
    if (e.key === 'r' || e.key === 'R') {
        checkRebirth();
    }

    // Toggle shop
    if (e.key === 'e' || e.key === 'E') {
        toggleShop();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse controls for camera rotation
document.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Right click
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        e.preventDefault();
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
        mouseDown = false;
    }
});

document.addEventListener('mousemove', (e) => {
    if (mouseDown && gameRunning) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        cameraAngleH += deltaX * 0.005;
        cameraAngleV = Math.max(0.1, Math.min(1.4, cameraAngleV - deltaY * 0.005));

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// Initialize Three.js with HIGH QUALITY graphics
function initThree() {
    scene = new THREE.Scene();

    // Enhanced sky gradient
    const skyColor = new THREE.Color(0x87ceeb);
    const horizonColor = new THREE.Color(0xe0f6ff);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0015);

    // Camera - third person behind player at 20 degrees up
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // High quality renderer with latest features
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        precision: "highp",
        alpha: false,
        stencil: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enhanced shadow settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;

    // Advanced tone mapping and color space
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Post-processing setup
    composer = new EffectComposer(renderer);

    // Main render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom effect for glowing elements
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);

    // Output pass for final render
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Advanced lighting system
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional sun light with enhanced shadows
    const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;

    // Ultra high-quality shadow map
    directionalLight.shadow.mapSize.width = 8192;
    directionalLight.shadow.mapSize.height = 8192;
    directionalLight.shadow.camera.left = -250;
    directionalLight.shadow.camera.right = 250;
    directionalLight.shadow.camera.top = 250;
    directionalLight.shadow.camera.bottom = -250;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.00001;
    directionalLight.shadow.radius = 2;
    directionalLight.shadow.normalBias = 0.02;
    scene.add(directionalLight);

    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.8);
    scene.add(hemisphereLight);

    // Fill light to reduce harsh shadows
    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 0.4);
    fillLight.position.set(-30, 40, -30);
    scene.add(fillLight);

    // Rim light for depth and separation
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(-50, 30, 100);
    scene.add(rimLight);

    // Create world
    createEnhancedGround();
    createEnhancedHomeBase();
    createEnhancedSafeZones();
    createClouds();
    createEnvironmentDetails();
    createAreaLabels();
    createCurrencyPads();
    createFreeEpicArea();
    createLikeAndGroupArea();
    createSpeedUpgradesShop();
    createSlowZones();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Initialize audio
    initAudio();

    // Initialize shop UI
    createShopUI();
}

function initAudio() {
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    bgMusic.src = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c6b0c16c91.mp3';

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

    upgradeSound = new Audio();
    upgradeSound.volume = 0.5;
    upgradeSound.src = 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_cbc4daa16c.mp3';
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

function createEnhancedGround() {
    // Main track with enhanced PBR material
    const groundGeometry = new THREE.PlaneGeometry(40, 800, 50, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b8e23,
        roughness: 0.95,
        metalness: 0.0,
        envMapIntensity: 0.3,
        flatShading: false
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -400;
    ground.receiveShadow = true;
    ground.castShadow = false;
    scene.add(ground);

    // Add vertex displacement for terrain variation
    const positions = ground.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        positions.setY(i, Math.random() * 0.3);
    }
    positions.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    // Zone markers with glowing lines
    const zones = [
        { distance: 0, name: 'COMMON', color: 0x808080 },
        { distance: 50, name: 'UNCOMMON', color: 0x00ff00 },
        { distance: 100, name: 'RARE', color: 0x0080ff },
        { distance: 150, name: 'EPIC', color: 0x8000ff },
        { distance: 200, name: 'LEGENDARY', color: 0xffd700 },
        { distance: 300, name: 'MYTHICAL', color: 0xff00ff },
        { distance: 400, name: 'COSMIC', color: 0x00ffff },
        { distance: 500, name: 'SECRET', color: 0xff0000 },
        { distance: 600, name: 'CELESTIAL', color: 0xffffff }
    ];

    zones.forEach(zone => {
        // Glowing zone line
        const lineGeometry = new THREE.BoxGeometry(40, 0.3, 2);
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: zone.color,
            emissive: zone.color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.15, -zone.distance);
        scene.add(line);

        // Zone label
        const label = createTextSprite(zone.name, 3);
        label.position.set(0, 8, -zone.distance);
        scene.add(label);

        // Distance marker
        const distMarker = createTextSprite(`${zone.distance}m`, 1.5);
        distMarker.position.set(18, 3, -zone.distance);
        scene.add(distMarker);
    });

    // Side walls with better appearance
    const wallGeometry = new THREE.BoxGeometry(2, 6, 800);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.8,
        metalness: 0.2
    });

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-21, 3, -400);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(21, 3, -400);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

function createEnhancedHomeBase() {
    // Main base platform with glow
    const baseGeometry = new THREE.BoxGeometry(32, 2.5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x00cc00,
        emissive: 0x00aa00,
        emissiveIntensity: 0.6,
        roughness: 0.4,
        metalness: 0.3
    });
    homeBase = new THREE.Mesh(baseGeometry, baseMaterial);
    homeBase.position.set(0, 1.25, 15);
    homeBase.castShadow = true;
    homeBase.receiveShadow = true;
    scene.add(homeBase);

    // Base border glow
    const borderGeometry = new THREE.BoxGeometry(34, 0.5, 34);
    const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.set(0, 2.8, 15);
    scene.add(border);

    // Animated deposit ring
    const ringGeometry = new THREE.TorusGeometry(10, 0.8, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.9
    });
    const depositRing = new THREE.Mesh(ringGeometry, ringMaterial);
    depositRing.rotation.x = -Math.PI / 2;
    depositRing.position.set(0, 3, 15);
    scene.add(depositRing);
    homeBase.depositRing = depositRing;

    // Base sign
    const signText = createTextSprite('HOME BASE\nDEPOSIT HERE', 4);
    signText.position.set(0, 8, 15);
    scene.add(signText);

    // Storage indicators (base slots)
    createBaseStorageVisuals();
}

function createBaseStorageVisuals() {
    // Create visual representation of stored brainrots at base
    const slotContainer = new THREE.Group();
    slotContainer.position.set(-12, 4, 15);

    for (let i = 0; i < baseSlots; i++) {
        const slotGeometry = new THREE.BoxGeometry(2, 2, 2);
        const slotMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.3
        });
        const slot = new THREE.Mesh(slotGeometry, slotMaterial);

        const row = Math.floor(i / 5);
        const col = i % 5;
        slot.position.set(col * 2.5, row * 2.5, 0);

        slotContainer.add(slot);
    }

    scene.add(slotContainer);
    homeBase.storageSlots = slotContainer;
}

function createEnhancedSafeZones() {
    const zoneDistances = [100, 150, 200, 300, 400, 500, 600];

    zoneDistances.forEach(distance => {
        const safeGeometry = new THREE.BoxGeometry(28, 2, 18);
        const safeMaterial = new THREE.MeshStandardMaterial({
            color: 0x0080ff,
            emissive: 0x004080,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.5
        });
        const safezone = new THREE.Mesh(safeGeometry, safeMaterial);
        safezone.position.set(0, 5, -distance);
        safezone.castShadow = true;
        safezone.receiveShadow = true;
        scene.add(safezone);
        safezones.push(safezone);

        // Glowing border
        const borderGeometry = new THREE.BoxGeometry(30, 0.5, 20);
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(0, 6.3, -distance);
        scene.add(border);

        // Pillars
        for (let x of [-13, 13]) {
            for (let z of [-8, 8]) {
                const pillarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 10, 8);
                const pillarMaterial = new THREE.MeshStandardMaterial({
                    color: 0x0060cc,
                    metalness: 0.8,
                    roughness: 0.2
                });
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.set(x, 0, -distance + z);
                pillar.castShadow = true;
                scene.add(pillar);
            }
        }

        // Safe zone sign
        const sign = createTextSprite('SAFE ZONE', 2);
        sign.position.set(0, 9, -distance);
        scene.add(sign);
    });
}

function createClouds() {
    // Add decorative clouds
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 3 + 2, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

        cloud.position.set(
            (Math.random() - 0.5) * 100,
            30 + Math.random() * 20,
            (Math.random() - 0.5) * 800
        );

        cloud.userData.speed = Math.random() * 0.02 + 0.01;
        scene.add(cloud);
        clouds.push(cloud);
    }
}

function createEnvironmentDetails() {
    // Add some decorative rocks/obstacles along the track
    for (let i = 0; i < 30; i++) {
        const rockSize = Math.random() * 2 + 1;
        const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 1.0,
            metalness: 0
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        rock.position.set(
            (Math.random() - 0.5) * 36 + (Math.random() > 0.5 ? 18 : -18),
            rockSize / 2,
            -Math.random() * 700
        );

        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

function createAreaLabels() {
    // Add floating area labels in the 3D world
    const areas = [
        { distance: 0, name: 'COMMON AREA', color: 0x808080 },
        { distance: 60, name: 'UNCOMMON AREA', color: 0x00ff00 },
        { distance: 120, name: 'RARE AREA', color: 0x0080ff },
        { distance: 170, name: 'EPIC AREA', color: 0x8000ff },
        { distance: 230, name: 'LEGENDARY AREA', color: 0xffd700 },
        { distance: 330, name: 'MYTHICAL AREA', color: 0xff00ff },
        { distance: 430, name: 'COSMIC AREA', color: 0x00ffff },
        { distance: 530, name: 'SECRET AREA', color: 0xff0000 },
        { distance: 630, name: 'CELESTIAL AREA', color: 0xffffff }
    ];

    areas.forEach(area => {
        const labelSprite = createTextSprite(area.name, 6);
        labelSprite.position.set(0, 15, -area.distance);
        scene.add(labelSprite);
    });
}

function createCurrencyPads() {
    // Create currency collection pads on the ground (for radioactive coins)
    const padPositions = [
        { x: 12, z: -80, value: 100 },
        { x: -12, z: -120, value: 250 },
        { x: 10, z: -200, value: 500 },
        { x: -10, z: -280, value: 1000 },
        { x: 12, z: -380, value: 2500 },
        { x: -12, z: -480, value: 5000 }
    ];

    padPositions.forEach(pos => {
        const padGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
        const padMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00aa00,
            emissiveIntensity: 0.7,
            roughness: 0.3,
            metalness: 0.6
        });
        const pad = new THREE.Mesh(padGeometry, padMaterial);
        pad.position.set(pos.x, 0.25, pos.z);
        pad.rotation.x = 0;
        pad.castShadow = true;
        scene.add(pad);

        // Value display above pad
        const valueText = createTextSprite('$' + formatNumber(pos.value), 2);
        valueText.position.set(pos.x, 3, pos.z);
        scene.add(valueText);

        // Store pad data for collection detection
        pad.userData.value = pos.value;
        pad.userData.collected = false;
        if (!scene.userData.currencyPads) scene.userData.currencyPads = [];
        scene.userData.currencyPads.push(pad);
    });
}

function createFreeEpicArea() {
    // FREE EPIC claim area with purple pad
    const epicGeometry = new THREE.BoxGeometry(8, 1.5, 8);
    const epicMaterial = new THREE.MeshStandardMaterial({
        color: 0x8000ff,
        emissive: 0x4000aa,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.7
    });
    const epicPad = new THREE.Mesh(epicGeometry, epicMaterial);
    epicPad.position.set(-15, 0.75, -40);
    epicPad.castShadow = true;
    scene.add(epicPad);

    // "FREE EPIC" sign
    const epicSign = createTextSprite('FREE EPIC\n(Claim Daily!)', 3);
    epicSign.position.set(-15, 5, -40);
    scene.add(epicSign);

    // Glowing particles around the pad
    for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        const angle = (i / 8) * Math.PI * 2;
        particle.position.set(
            -15 + Math.cos(angle) * 5,
            3 + Math.sin(Date.now() * 0.001 + i) * 0.5,
            -40 + Math.sin(angle) * 5
        );
        scene.add(particle);
    }
}

function createLikeAndGroupArea() {
    // "Like game + join group!" prompt area
    const promptGeometry = new THREE.BoxGeometry(10, 2, 6);
    const promptMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        emissive: 0x2040aa,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.5
    });
    const promptPad = new THREE.Mesh(promptGeometry, promptMaterial);
    promptPad.position.set(15, 1, -40);
    promptPad.castShadow = true;
    scene.add(promptPad);

    // Prompt sign
    const promptSign = createTextSprite('Like game +\njoin group!', 2.5);
    promptSign.position.set(15, 5, -40);
    scene.add(promptSign);
}

function createSpeedUpgradesShop() {
    // SPEED UPGRADES shop area in the world
    const shopGeometry = new THREE.BoxGeometry(12, 3, 10);
    const shopMaterial = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xaa6600,
        emissiveIntensity: 0.5,
        roughness: 0.4,
        metalness: 0.5
    });
    const shopBuilding = new THREE.Mesh(shopGeometry, shopMaterial);
    shopBuilding.position.set(-18, 1.5, 0);
    shopBuilding.castShadow = true;
    scene.add(shopBuilding);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(8, 3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.8
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-18, 4, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Shop sign
    const shopSign = createTextSprite('SPEED UPGRADES\n⚡ SHOP ⚡', 3);
    shopSign.position.set(-18, 6, 0);
    scene.add(shopSign);

    // Entrance platform
    const entranceGeometry = new THREE.BoxGeometry(6, 0.5, 6);
    const entranceMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.4
    });
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(-18, 0.25, 6);
    scene.add(entrance);
}

function createSlowZones() {
    // Create SLOW zones that reduce tsunami speed
    const slowZonePositions = [-600, -450, -300, -150];

    slowZonePositions.forEach(zPos => {
        // Large SLOW sign
        const signGeometry = new THREE.BoxGeometry(50, 20, 2);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0x2196F3,
            emissive: 0x1976D2,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8,
            roughness: 0.3,
            metalness: 0.4
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 15, zPos);
        scene.add(sign);

        // SLOW text
        const slowText = createTextSprite('SLOW', 8);
        slowText.position.set(0, 15, zPos + 2);
        scene.add(slowText);

        // Supporting poles
        const poleGeometry = new THREE.CylinderGeometry(0.8, 0.8, 30, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.6,
            metalness: 0.7
        });

        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        leftPole.position.set(-26, 0, zPos);
        leftPole.castShadow = true;
        scene.add(leftPole);

        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
        rightPole.position.set(26, 0, zPos);
        rightPole.castShadow = true;
        scene.add(rightPole);

        // Store slow zone data
        slowZones.push({
            position: zPos,
            active: true,
            slowFactor: 0.4 // Reduces speed to 40% of normal
        });
    });
}

function createPlayer() {
    const bodyGeometry = new THREE.BoxGeometry(1.8, 3, 1.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4299e1,
        roughness: 0.5,
        metalness: 0.3
    });
    player = new THREE.Mesh(bodyGeometry, bodyMaterial);
    player.position.set(0, 2.5, 10);
    player.castShadow = true;
    scene.add(player);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xffdbac,
        roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    player.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 2.3, 0.6);
    player.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 2.3, 0.6);
    player.add(rightEye);

    // Simple arms
    const armGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x4299e1 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.2, 0.5, 0);
    leftArm.castShadow = true;
    player.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.2, 0.5, 0);
    rightArm.castShadow = true;
    player.add(rightArm);
}

function spawnBrainrots() {
    // Spawn 96 brainrots across all zones
    brainrotRarities.forEach(rarity => {
        for (let i = 0; i < rarity.count; i++) {
            const distance = rarity.distance + Math.random() * (rarity.maxDistance - rarity.distance);
            const mutation = getRandomMutation();
            const brainrot = createBrainrot(rarity, distance, mutation);
            scene.add(brainrot);
            brainrots.push(brainrot);
        }
    });
}

function getRandomMutation() {
    const random = Math.random();
    let cumulative = 0;

    for (let mutation of mutations) {
        cumulative += mutation.chance;
        if (random <= cumulative) {
            return mutation;
        }
    }

    return mutations[0]; // None
}

function createBrainrot(rarity, distance, mutation) {
    const geometry = new THREE.SphereGeometry(1, 32, 32); // Higher poly for smoother look

    // Use mutation color if available, otherwise use rarity color
    const color = mutation.color || rarity.color;
    const emissive = mutation.emissive || rarity.color;

    // Enhanced PBR material with better visual properties
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: mutation.name === 'None' ? 0.6 : 1.2,
        metalness: 0.8,
        roughness: 0.15,
        envMapIntensity: 1.5,
        transparent: false
    });

    const brainrot = new THREE.Mesh(geometry, material);
    brainrot.position.set(
        (Math.random() - 0.5) * 32,
        2,
        -distance + (Math.random() - 0.5) * 10
    );
    brainrot.castShadow = true;
    brainrot.receiveShadow = true;
    brainrot.userData = {
        rarity: rarity,
        mutation: mutation,
        wobble: Math.random() * Math.PI * 2,
        collected: false,
        rotationSpeed: Math.random() * 0.02 + 0.02
    };

    // Glow ring for rarer brainrots
    if (rarity.name !== 'Common' && rarity.name !== 'Uncommon') {
        const ringGeometry = new THREE.TorusGeometry(1.3, 0.15, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        brainrot.add(ring);
        brainrot.ring = ring;
    }

    // Particle effect for mutations
    if (mutation.name !== 'None') {
        createBrainrotParticles(brainrot, color);
    }

    return brainrot;
}

function createBrainrotParticles(brainrot, color) {
    // Create glowing particle effect around mutated brainrots
    const particleCount = 10;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 3;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    brainrot.add(particles);
    brainrot.mutationParticles = particles;
}

function createTsunami() {
    // Create massive tsunami wave
    const wallWidth = 100;
    const wallHeight = 80;
    const wallDepth = 25;

    // Main wave body with enhanced PBR material
    const waveGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0x1976D2, // Deep ocean blue
        transparent: true,
        opacity: 0.92,
        emissive: 0x0D47A1,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.15,
        envMapIntensity: 1.0,
        side: THREE.DoubleSide
    });
    tsunamiWave = new THREE.Mesh(waveGeometry, waveMaterial);
    tsunamiWave.position.set(0, wallHeight / 2, -750);
    tsunamiWave.castShadow = true;
    tsunamiWave.receiveShadow = true;
    scene.add(tsunamiWave);

    // Wave crest - curved top section
    const crestGeometry = new THREE.CylinderGeometry(wallWidth / 2, wallWidth / 2, 15, 32, 1, false, 0, Math.PI);
    const crestMaterial = new THREE.MeshStandardMaterial({
        color: 0x42A5F5,
        transparent: true,
        opacity: 0.88,
        emissive: 0x1976D2,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.1
    });
    const crest = new THREE.Mesh(crestGeometry, crestMaterial);
    crest.rotation.z = Math.PI / 2;
    crest.position.set(0, wallHeight / 2 + 5, wallDepth / 4);
    tsunamiWave.add(crest);

    // Dense foam layer at wave crest
    for (let i = 0; i < 80; i++) {
        const foamSize = Math.random() * 1.5 + 0.8;
        const foamGeometry = new THREE.SphereGeometry(foamSize, 8, 8);
        const foamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const foam = new THREE.Mesh(foamGeometry, foamMaterial);

        const angle = (Math.random() - 0.5) * Math.PI;
        const distance = Math.random() * wallWidth * 0.45;

        foam.position.set(
            distance * Math.cos(angle),
            wallHeight / 2 + Math.random() * 12 - 2,
            wallDepth / 4 + Math.random() * 8
        );
        tsunamiWave.add(foam);
        foam.userData.offset = Math.random() * Math.PI * 2;
        foam.userData.floatSpeed = Math.random() * 1.0 + 0.5;
        foam.userData.bobAmount = Math.random() * 1.5 + 0.5;
    }

    // Spray particles at the very top
    for (let i = 0; i < 40; i++) {
        const sprayGeometry = new THREE.SphereGeometry(0.3, 6, 6);
        const sprayMaterial = new THREE.MeshBasicMaterial({
            color: 0xE3F2FD,
            transparent: true,
            opacity: 0.7
        });
        const spray = new THREE.Mesh(sprayGeometry, sprayMaterial);
        spray.position.set(
            (Math.random() - 0.5) * wallWidth * 0.8,
            wallHeight / 2 + 8 + Math.random() * 6,
            wallDepth / 2 + Math.random() * 5
        );
        tsunamiWave.add(spray);
        spray.userData.offset = Math.random() * Math.PI * 2;
        spray.userData.floatSpeed = Math.random() * 1.5 + 0.8;
        spray.userData.isSpray = true;
    }

    // Front foam/turbulence
    const frontFoamGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.4, 3);
    const frontFoamMaterial = new THREE.MeshStandardMaterial({
        color: 0xBBDEFB,
        transparent: true,
        opacity: 0.7,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
        roughness: 0.8
    });
    const frontFoam = new THREE.Mesh(frontFoamGeometry, frontFoamMaterial);
    frontFoam.position.set(0, -wallHeight * 0.15, wallDepth / 2 + 2);
    tsunamiWave.add(frontFoam);

    // Warning text
    const warningText = createTextSprite('⚠️ TSUNAMI COMING! ⚠️\nRUN TO BASE!', 5);
    warningText.position.set(0, wallHeight + 10, -600);
    tsunamiWave.warningText = warningText;
    scene.add(warningText);
}

function createTextSprite(text, scale) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 512;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = 'bold 64px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = 'black';
    context.lineWidth = 6;

    const lines = text.split('\n');
    lines.forEach((line, i) => {
        const y = 256 + (i - lines.length / 2 + 0.5) * 80;
        context.strokeText(line, 512, y);
        context.fillText(line, 512, y);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(scale * 8, scale * 4, 1);

    return sprite;
}

// ... Continue in next message due to length

function createShopUI() {
    const shopContainer = document.createElement('div');
    shopContainer.id = 'shopUI';
    shopContainer.className = 'shop-ui hidden';
    shopContainer.innerHTML = `
        <div class="shop-panel">
            <h2>🛒 UPGRADE SHOP</h2>
            <button class="close-shop" onclick="toggleShop()">✖</button>

            <div class="upgrade-item">
                <div class="upgrade-info">
                    <h3>⚡ Speed</h3>
                    <p>Level: <span id="speedLvl">1</span></p>
                    <p>Current: <span id="speedCurrent">20</span></p>
                </div>
                <button class="upgrade-btn" onclick="buySpeed()">
                    Buy: $<span id="speedCost">100</span>
                </button>
            </div>

            <div class="upgrade-item">
                <div class="upgrade-info">
                    <h3>🎒 Carry Capacity</h3>
                    <p>Level: <span id="carryLvl">1</span></p>
                    <p>Current: <span id="carryCurrent">1</span></p>
                </div>
                <button class="upgrade-btn" onclick="buyCarry()">
                    Buy: $<span id="carryCost">500</span>
                </button>
            </div>

            <div class="upgrade-item">
                <div class="upgrade-info">
                    <h3>🦘 Jump Power</h3>
                    <p>Level: <span id="jumpLvl">1</span></p>
                    <p>Current: <span id="jumpCurrent">15</span></p>
                </div>
                <button class="upgrade-btn" onclick="buyJump()">
                    Buy: $<span id="jumpCost">300</span>
                </button>
            </div>

            <div class="upgrade-item">
                <div class="upgrade-info">
                    <h3>📦 Base Slots</h3>
                    <p>Level: <span id="baseSlotsLvl">1</span></p>
                    <p>Current: <span id="baseSlotsCurrent">10</span></p>
                </div>
                <button class="upgrade-btn" onclick="buyBaseSlots()">
                    Buy: $<span id="baseSlotsCost">1000</span>
                </button>
            </div>

            <div class="rebirth-section">
                <h3>🔄 REBIRTH</h3>
                <p>Requires: <span id="rebirthReq">10</span> Brainrots</p>
                <p>Current Multiplier: <span id="multiplier">1</span>x</p>
                <button class="rebirth-btn" onclick="checkRebirth()">
                    REBIRTH (R)
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(shopContainer);
}

function toggleShop() {
    shopVisible = !shopVisible;
    const shopUI = document.getElementById('shopUI');
    if (shopVisible) {
        shopUI.classList.remove('hidden');
        updateShopUI();
    } else {
        shopUI.classList.add('hidden');
    }
}

function updateShopUI() {
    document.getElementById('speedLvl').textContent = speedLevel;
    document.getElementById('speedCurrent').textContent = playerSpeed.toFixed(1);
    document.getElementById('speedCost').textContent = speedUpgradeCost(speedLevel);

    document.getElementById('carryLvl').textContent = carryLevel;
    document.getElementById('carryCurrent').textContent = carryCapacity;
    document.getElementById('carryCost').textContent = carryUpgradeCost(carryLevel);

    document.getElementById('jumpLvl').textContent = jumpLevel;
    document.getElementById('jumpCurrent').textContent = jumpPower.toFixed(1);
    document.getElementById('jumpCost').textContent = jumpUpgradeCost(jumpLevel);

    document.getElementById('baseSlotsLvl').textContent = baseSlotsLevel;
    document.getElementById('baseSlotsCurrent').textContent = baseSlots;
    document.getElementById('baseSlotsCost').textContent = baseSlotsUpgradeCost(baseSlotsLevel);

    document.getElementById('rebirthReq').textContent = rebirthRequirement();
    document.getElementById('multiplier').textContent = moneyMultiplier;
}

function buySpeed() {
    const cost = speedUpgradeCost(speedLevel);
    if (money >= cost) {
        money -= cost;
        speedLevel++;
        playerSpeed = 20 + speedLevel * 3;
        playSound(upgradeSound);
        updateShopUI();
        updateUI();
    }
}

function buyCarry() {
    const cost = carryUpgradeCost(carryLevel);
    if (money >= cost) {
        money -= cost;
        carryLevel++;
        carryCapacity = carryLevel;
        playSound(upgradeSound);
        updateShopUI();
        updateUI();
    }
}

function buyJump() {
    const cost = jumpUpgradeCost(jumpLevel);
    if (money >= cost) {
        money -= cost;
        jumpLevel++;
        jumpPower = 15 + jumpLevel * 2;
        playSound(upgradeSound);
        updateShopUI();
        updateUI();
    }
}

function buyBaseSlots() {
    const cost = baseSlotsUpgradeCost(baseSlotsLevel);
    if (money >= cost) {
        money -= cost;
        baseSlotsLevel++;
        baseSlots = 10 + baseSlotsLevel * 5;
        playSound(upgradeSound);
        updateShopUI();
        updateUI();
    }
}

function startGame() {
    gameRunning = true;
    tsunamiTimer = 0;
    tsunamiActive = false;
    tsunamiWarningPlayed = false;
    carriedBrainrots = [];
    tsunamiSpeed = tsunamiBaseSpeed;

    // Reset fog
    scene.fog.density = 0.0015;
    scene.fog.color.setHex(0x87ceeb);

    // Reset slow zones
    slowZones.forEach(zone => zone.active = true);

    // Reset camera angle
    cameraAngleH = 0;
    cameraAngleV = 0.35;

    if (!audioInitialized) {
        audioInitialized = true;
        startBackgroundMusic();
    }

    brainrots.forEach(b => scene.remove(b));
    brainrots = [];
    if (tsunamiWave) {
        scene.remove(tsunamiWave);
        if (tsunamiWave.warningText) scene.remove(tsunamiWave.warningText);
        tsunamiWave = null;
    }

    if (player) scene.remove(player);
    createPlayer();

    spawnBrainrots();

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');

    updateUI();
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;

    tsunamiTimer += 1/60;

    if (!tsunamiActive && tsunamiTimer >= nextTsunamiTime - tsunamiWarningTime) {
        if (!tsunamiWave) {
            createTsunami();
        }
        if (tsunamiWave && tsunamiWave.warningText) {
            tsunamiWave.warningText.visible = true;
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

    updatePlayer();

    if (tsunamiWave) {
        updateTsunami();
    }

    if (tsunamiActive && tsunamiWave && tsunamiWave.position.z > 50) {
        scene.remove(tsunamiWave);
        if (tsunamiWave.warningText) scene.remove(tsunamiWave.warningText);
        tsunamiWave = null;
        tsunamiActive = false;
        tsunamiWarningPlayed = false;
        tsunamiTimer = 0;
        nextTsunamiTime = tsunamiInterval;
    }

    updateBrainrots();
    checkBrainrotCollection();
    checkDeposit();
    checkCurrencyPadCollection();
    updateParticles();
    updateClouds();
    updateAnimations();

    if (Math.floor(tsunamiTimer * 60) % 60 === 0) {
        money += passiveIncome * moneyMultiplier;
    }

    // Over-the-shoulder third person camera with rotation
    const cameraDistance = 10;
    const cameraOffsetX = Math.sin(cameraAngleH) * cameraDistance;
    const cameraOffsetZ = Math.cos(cameraAngleH) * cameraDistance;
    const cameraOffsetY = cameraDistance * Math.sin(cameraAngleV);

    // Position camera behind and slightly to the side of player
    camera.position.x = player.position.x + cameraOffsetX * 0.3; // Slight side offset for over-shoulder
    camera.position.z = player.position.z + cameraOffsetZ;
    camera.position.y = player.position.y + cameraOffsetY + 2;

    // Look at point slightly ahead of player
    const lookAtX = player.position.x - cameraOffsetX * 0.2;
    const lookAtZ = player.position.z - cameraOffsetZ * 0.8;
    camera.lookAt(lookAtX, player.position.y + 1.5, lookAtZ);

    updateUI();
    composer.render();
    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    moveDirection.set(0, 0, 0);

    if (keys['w'] || keys['ArrowUp']) moveDirection.z -= 1;
    if (keys['s'] || keys['ArrowDown']) moveDirection.z += 1;
    if (keys['a'] || keys['ArrowLeft']) moveDirection.x -= 1;
    if (keys['d'] || keys['ArrowRight']) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        const speed = playerSpeed * 0.12;
        player.position.x += moveDirection.x * speed;
        player.position.z += moveDirection.z * speed;

        player.position.x = Math.max(-19, Math.min(19, player.position.x));
        player.position.z = Math.max(-700, Math.min(10, player.position.z));

        player.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
    }

    // Jumping physics
    if (isJumping) {
        playerVelocityY -= gravity * 0.05;
        player.position.y += playerVelocityY;
    }

    // Check ground/platform height
    let targetY = 2.5;
    let onPlatform = false;

    // Home base
    if (player.position.z > 5 && player.position.z < 25 &&
        Math.abs(player.position.x) < 16) {
        targetY = 3.75;
        onPlatform = true;
    }

    // Safe zones
    for (let safezone of safezones) {
        const distance = Math.abs(player.position.z - safezone.position.z);
        if (distance < 9 && Math.abs(player.position.x) < 14) {
            targetY = 7;
            onPlatform = true;
            break;
        }
    }

    if (player.position.y <= targetY) {
        player.position.y = targetY;
        playerVelocityY = 0;
        isJumping = false;
    }
}

function updateTsunami() {
    if (!tsunamiActive) return;

    // Check if tsunami is passing through a SLOW zone
    let currentSpeed = tsunamiBaseSpeed;
    slowZones.forEach(zone => {
        if (zone.active) {
            const distanceToZone = Math.abs(tsunamiWave.position.z - zone.position);
            if (distanceToZone < 20) {
                // Wave is passing through SLOW zone
                currentSpeed = tsunamiBaseSpeed * zone.slowFactor;
                zone.active = false; // Deactivate once used
            }
        }
    });
    tsunamiSpeed = currentSpeed;

    tsunamiWave.position.z += tsunamiSpeed;

    // Animate foam and spray particles
    tsunamiWave.children.forEach((child) => {
        if (child.userData.floatSpeed !== undefined) {
            const bobAmount = child.userData.bobAmount || 2;

            if (child.userData.isSpray) {
                // Spray particles bob more dramatically
                const baseY = 40 + 8; // wallHeight/2 + 8
                child.position.y = baseY + Math.sin(tsunamiTimer * child.userData.floatSpeed + child.userData.offset) * 3;
            } else {
                // Regular foam particles
                const baseY = 40; // wallHeight/2
                child.position.y = baseY + Math.sin(tsunamiTimer * child.userData.floatSpeed + child.userData.offset) * bobAmount;
            }
        }
    });

    // Pulse the opacity slightly for dramatic effect
    tsunamiWave.material.opacity = 0.92 + Math.sin(tsunamiTimer * 2) * 0.03;

    // Check if player caught (player is behind the wave and not high enough)
    const waveEdge = tsunamiWave.position.z + 10; // Front edge of wave
    if (player.position.z < waveEdge && player.position.y < 15) {
        // Camera submersion effect
        scene.fog.density = 0.1; // Heavy blue fog
        scene.fog.color.setHex(0x2196F3);

        setTimeout(() => {
            gameOver('Consumed by the tsunami');
        }, 1000);
    }
}

function updateBrainrots() {
    brainrots.forEach(brainrot => {
        if (brainrot.userData.collected) return;

        brainrot.userData.wobble += 0.05;
        brainrot.position.y = 2 + Math.sin(brainrot.userData.wobble) * 0.4;
        brainrot.rotation.y += brainrot.userData.rotationSpeed;

        if (brainrot.ring) {
            brainrot.ring.rotation.z += 0.05;
        }

        if (brainrot.mutationParticles) {
            brainrot.mutationParticles.rotation.y += 0.02;
        }
    });
}

function checkBrainrotCollection() {
    if (carriedBrainrots.length >= carryCapacity) return;

    brainrots.forEach(brainrot => {
        if (brainrot.userData.collected) return;

        const distance = player.position.distanceTo(brainrot.position);
        if (distance < 2.5) {
            brainrot.userData.collected = true;
            carriedBrainrots.push(brainrot.userData);
            scene.remove(brainrot);
            createParticleExplosion(brainrot.position, brainrot.material.color.getHex());
            playSound(collectSound);
        }
    });
}

function checkDeposit() {
    if (carriedBrainrots.length === 0) return;

    const distanceToBase = player.position.distanceTo(new THREE.Vector3(0, 2, 15));
    if (distanceToBase < 10) {
        carriedBrainrots.forEach(brainrotData => {
            const baseValue = brainrotData.rarity.value;
            const mutationMult = brainrotData.mutation.multiplier;
            const finalValue = baseValue * mutationMult * moneyMultiplier;

            money += finalValue;
            passiveIncome += finalValue * 0.1;
            totalBrainrots++;
        });

        carriedBrainrots = [];
        createParticleExplosion(homeBase.position, 0xffff00);
        playSound(depositSound);
    }
}

function checkCurrencyPadCollection() {
    if (!scene.userData.currencyPads) return;

    scene.userData.currencyPads.forEach(pad => {
        if (pad.userData.collected) return;

        const distance = player.position.distanceTo(pad.position);
        if (distance < 4.5) {
            pad.userData.collected = true;
            radioactiveCoins += pad.userData.value;

            // Visual feedback - make pad glow and fade
            pad.material.emissive.setHex(0xffffff);
            pad.material.emissiveIntensity = 2.0;

            setTimeout(() => {
                pad.material.opacity = 0.3;
                pad.material.transparent = true;
            }, 200);

            createParticleExplosion(pad.position, 0x00ff00);
            playSound(collectSound);
        }
    });
}

function createParticleExplosion(position, color) {
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: color });

    for (let i = 0; i < 25; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                Math.random() * 0.6,
                (Math.random() - 0.5) * 0.6
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

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 50) {
            cloud.position.x = -50;
        }
    });
}

function updateAnimations() {
    // Animate deposit ring
    if (homeBase && homeBase.depositRing) {
        homeBase.depositRing.rotation.z += 0.02;
        homeBase.depositRing.material.emissiveIntensity = 1.0 + Math.sin(Date.now() * 0.003) * 0.3;
    }
}

function updateUI() {
    // Top HUD
    document.getElementById('score').textContent = '$' + formatNumber(Math.floor(money));
    document.getElementById('highScore').textContent = totalBrainrots;
    document.getElementById('lives').textContent = carriedBrainrots.length + '/' + carryCapacity;

    // Bottom Left HUD
    document.getElementById('radioactiveCoins').textContent = radioactiveCoins;
    document.getElementById('speedDisplay').textContent = Math.floor(playerSpeed);

    // Bottom Right HUD - Tsunami Countdown
    const tsunamiElement = document.getElementById('tsunamiCountdown');
    const tsunamiTimerElement = document.querySelector('.tsunami-timer');

    if (tsunamiActive) {
        tsunamiElement.textContent = 'ACTIVE!';
        tsunamiTimerElement.classList.add('warning');
    } else {
        const timeLeft = Math.max(0, nextTsunamiTime - tsunamiTimer);
        tsunamiElement.textContent = timeLeft.toFixed(1) + 's';

        if (timeLeft <= 3 && timeLeft > 0) {
            tsunamiTimerElement.classList.add('warning');
        } else {
            tsunamiTimerElement.classList.remove('warning');
        }
    }

    // Beast indicator (placeholder for now)
    document.getElementById('beastStatus').textContent = 'NONE';
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

function checkRebirth() {
    const required = rebirthRequirement();
    if (totalBrainrots >= required) {
        rebirths++;
        moneyMultiplier = 1 + rebirths;
        totalBrainrots -= required;
        alert('Rebirth ' + rebirths + ' Money multiplier now ' + moneyMultiplier + 'x');
        updateUI();
        if (shopVisible) updateShopUI();
    } else {
        alert('Need ' + (required - totalBrainrots) + ' more Brainrots to rebirth');
    }
}

function gameOver(reason) {
    gameRunning = false;
    playSound(deathSound);
    document.getElementById('finalScore').textContent = '$' + Math.floor(money) + ' | ' + totalBrainrots + ' Brainrots';
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize
initThree();

// Animation loop for menu
function animate() {
    requestAnimationFrame(animate);
    if (!gameRunning) {
        composer.render();
    }
}
animate();
