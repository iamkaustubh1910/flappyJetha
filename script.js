const jethalal = document.getElementById('jethalal');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const babitaPopup = document.getElementById('babita-popup');
const gameContainer = document.getElementById('game-container');

// Game constants
const GRAVITY = 0.3;  // Even gentler gravity
const FLAP_FORCE = -6;  // Gentler flap force
const INITIAL_PIPE_SPEED = 0.5;  // Very slow initial speed
const MAX_PIPE_SPEED = 2;
const INITIAL_PIPE_SPAWN_INTERVAL = 4000;  // Very long initial spawn interval
const MIN_PIPE_SPAWN_INTERVAL = 2000;
const INITIAL_PIPE_GAP = 350;  // Very wide initial gap
const MIN_PIPE_GAP = 150;

// Game state
let gameRunning = true;
let score = 0;
let velocity = 0;
let position = 300;
let pipes = [];
let lastPipeSpawn = 0;
let firstPipePassed = false;

// Audio Context
let audioContext;
let sounds = {};

// Initialize Audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Simple beep for flap (using Oscillator)
        function createFlapSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }

        // Score sound (higher pitched beep)
        function createScoreSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        }

        // Hit sound (lower pitched noise)
        function createHitSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }

        sounds = {
            flap: createFlapSound,
            score: createScoreSound,
            hit: createHitSound
        };

        return true;
    } catch (e) {
        console.log('Web Audio API not supported:', e);
        return false;
    }
}

// Play sound function
function playSound(soundName) {
    if (audioContext && sounds[soundName]) {
        // Resume audio context if it's suspended (browser policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        sounds[soundName]();
    }
}

// Calculate current game difficulty based on score
function getCurrentDifficulty() {
    // Make it very easy for first 30 points
    const difficulty = Math.max(0, Math.min((score - 30) / 20, 1));
    return {
        pipeSpeed: INITIAL_PIPE_SPEED + (MAX_PIPE_SPEED - INITIAL_PIPE_SPEED) * difficulty,
        pipeSpawnInterval: INITIAL_PIPE_SPAWN_INTERVAL - (INITIAL_PIPE_SPAWN_INTERVAL - MIN_PIPE_SPAWN_INTERVAL) * difficulty,
        pipeGap: INITIAL_PIPE_GAP - (INITIAL_PIPE_GAP - MIN_PIPE_GAP) * difficulty
    };
}

// Initialize game
function init() {
    initAudio();  // Initialize audio system
    jethalal.style.left = '100px';
    jethalal.style.top = position + 'px';
    
    // Setup click handler to initialize audio (needed for some browsers)
    document.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            flap();
        }
    });
    gameContainer.addEventListener('click', flap);
    restartBtn.addEventListener('click', restartGame);
    
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    updateJethalal();
    updatePipes(timestamp);
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

// Update Jethalal's position
function updateJethalal() {
    velocity += GRAVITY;
    position += velocity;
    jethalal.style.top = position + 'px';

    // Rotate Jethalal based on velocity
    const rotation = Math.min(Math.max(velocity * 3, -90), 45);
    jethalal.style.transform = `rotate(${rotation}deg)`;

    if (position > gameContainer.clientHeight - 60 || position < 0) {
        gameOver();
    }
}

// Create a new pipe
function createPipe() {
    const difficulty = getCurrentDifficulty();
    // For the first pipe, position it in the middle of the screen
    let gapPosition;
    if (!firstPipePassed) {
        gapPosition = (gameContainer.clientHeight - difficulty.pipeGap) / 2;
    } else {
        // For first 30 points, keep pipes more centered
        if (score < 30) {
            const centerRange = 100; // Range around center
            const center = (gameContainer.clientHeight - difficulty.pipeGap) / 2;
            gapPosition = center + (Math.random() * centerRange - centerRange/2);
        } else {
            const minGapFromEdge = 50;
            const maxGapPosition = gameContainer.clientHeight - difficulty.pipeGap - minGapFromEdge;
            gapPosition = Math.random() * (maxGapPosition - minGapFromEdge) + minGapFromEdge;
        }
    }
    
    const pipe = {
        top: document.createElement('div'),
        bottom: document.createElement('div'),
        passed: false
    };

    pipe.top.className = 'pipe top';
    pipe.bottom.className = 'pipe bottom';
    
    pipe.top.style.height = `${gapPosition}px`;
    pipe.bottom.style.top = `${gapPosition + difficulty.pipeGap}px`;
    pipe.bottom.style.height = `${gameContainer.clientHeight - gapPosition - difficulty.pipeGap}px`;
    
    pipe.top.style.left = '400px';
    pipe.bottom.style.left = '400px';
    
    gameContainer.appendChild(pipe.top);
    gameContainer.appendChild(pipe.bottom);
    
    pipes.push(pipe);
}

// Update pipes position
function updatePipes(timestamp) {
    const difficulty = getCurrentDifficulty();
    
    if (timestamp - lastPipeSpawn > difficulty.pipeSpawnInterval) {
        createPipe();
        lastPipeSpawn = timestamp;
    }

    pipes.forEach((pipe, index) => {
        const currentLeft = parseInt(pipe.top.style.left);
        pipe.top.style.left = `${currentLeft - difficulty.pipeSpeed}px`;
        pipe.bottom.style.left = `${currentLeft - difficulty.pipeSpeed}px`;

        if (currentLeft < -60) {
            pipe.top.remove();
            pipe.bottom.remove();
            pipes.splice(index, 1);
        }

        if (!pipe.passed && currentLeft < 90) {
            pipe.passed = true;
            if (!firstPipePassed) {
                firstPipePassed = true;
            }
            score++;
            scoreDisplay.textContent = score;
            showBabitaPopup();
            playSound('score');
        }
    });
}

// Check for collisions
function checkCollisions() {
    const jethalalRect = jethalal.getBoundingClientRect();
    
    pipes.forEach(pipe => {
        const topPipeRect = pipe.top.getBoundingClientRect();
        const bottomPipeRect = pipe.bottom.getBoundingClientRect();

        // More forgiving collision detection for first 30 points
        const collisionBuffer = score < 30 ? 15 : 10;

        if (
            jethalalRect.right - collisionBuffer > topPipeRect.left &&
            jethalalRect.left + collisionBuffer < topPipeRect.right &&
            (jethalalRect.top + collisionBuffer < topPipeRect.bottom ||
             jethalalRect.bottom - collisionBuffer > bottomPipeRect.top)
        ) {
            gameOver();
        }
    });
}

// Show Babita popup
function showBabitaPopup() {
    babitaPopup.style.display = 'block';
    babitaPopup.style.left = '150px';
    babitaPopup.style.top = '200px';
    setTimeout(() => {
        babitaPopup.style.display = 'none';
    }, 1000);
}

// Make Jethalal flap
function flap() {
    if (!gameRunning) return;
    velocity = FLAP_FORCE;
    playSound('flap');
}

// Game over
function gameOver() {
    gameRunning = false;
    playSound('hit');
    
    pipes.forEach(pipe => {
        pipe.top.remove();
        pipe.bottom.remove();
    });
    pipes = [];

    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    velocity = 0;
    position = 300;
    pipes = [];
    lastPipeSpawn = 0;
    firstPipePassed = false;
    scoreDisplay.textContent = '0';

    // Remove all existing pipes
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    jethalal.style.top = position + 'px';
    jethalal.style.transform = 'rotate(0deg)';
    gameOverScreen.style.display = 'none';

    requestAnimationFrame(gameLoop);
}

// Start the game
init();
