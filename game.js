// ============================================================
// COLOR DASH
// Endless Colorful Arcade Game
// ============================================================


// ============================================================
// CANVAS SETUP
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameContainer = document.querySelector(".game-container");

// ============================================================
// AUDIO SYSTEM
// ============================================================

let audioContext = null;
let soundEnabled = true;
let youtubeAudioEnabled = true;
function updateYouTubeAudioState() {
    if (
        typeof ytgame !== "undefined" &&
        ytgame.system &&
        typeof ytgame.system.isAudioEnabled === "function"
    ) {
        youtubeAudioEnabled = ytgame.system.isAudioEnabled();
    }
}
function initAudio() {
    if (!audioContext) {
        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.08,
    slideTo = null
) {
    if (!soundEnabled || !youtubeAudioEnabled) return;

    initAudio();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    if (slideTo !== null) {
        oscillator.frequency.linearRampToValueAtTime(
            slideTo,
            audioContext.currentTime + duration
        );
    }

    gain.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


// ============================================================
// GAME SOUNDS
// ============================================================

function coinSound() {
    playTone(
        700,
        0.08,
        "sine",
        0.08,
        1100
    );
}


function shieldSound() {
    playTone(
        350,
        0.15,
        "sine",
        0.09,
        700
    );
}


function magnetSound() {
    playTone(
        250,
        0.25,
        "triangle",
        0.08,
        650
    );
}


function speedSound() {
    playTone(
        500,
        0.15,
        "square",
        0.06,
        1000
    );

    setTimeout(() => {
        playTone(
            800,
            0.15,
            "square",
            0.05,
            1400
        );
    }, 100);
}


function hitSound() {
    playTone(
        180,
        0.25,
        "sawtooth",
        0.09,
        80
    );
}


function lifeLostSound() {
    playTone(
        250,
        0.2,
        "triangle",
        0.08,
        120
    );
}


function gameOverSound() {

    playTone(
        500,
        0.15,
        "sine",
        0.08,
        350
    );

    setTimeout(() => {

        playTone(
            350,
            0.15,
            "sine",
            0.08,
            200
        );

    }, 150);

    setTimeout(() => {

        playTone(
            200,
            0.25,
            "sine",
            0.08,
            100
        );

    }, 300);
}


// ============================================================
// UI ELEMENTS
// ============================================================

const scoreElement =
    document.getElementById("score");

const livesElement =
    document.getElementById("lives");

const finalScoreElement =
    document.getElementById("finalScore");

const finalBestElement =
    document.getElementById("finalBest");


const startScreen =
    document.getElementById("startScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");


const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const resumeButton =
    document.getElementById("resumeButton");

const restartButton =
    document.getElementById("restartButton");


const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");


const soundButton =
    document.getElementById("soundButton");


// ============================================================
// GAME VARIABLES
// ============================================================

let gameRunning = false;
let gamePaused = false;
// Screen shake
let screenShake = 0;
let screenShakeIntensity = 0;

let score = 0;
let bestScore = 0;

let lives = 3;

let animationId = null;

let gameSpeed = 3;

let obstacleTimer = 0;
let coinTimer = 0;
let powerUpTimer = 0;

let difficultyTimer = 0;

// Playables-safe power-up timers
let magnetTimer = 0;
let speedBoostTimer = 0;

// ============================================================
// PLAYER
// ============================================================

const player = {

    x: 0,
    y: 0,

    width: 55,
    height: 55,

    speed: 6,

    movingLeft: false,
    movingRight: false,

    invincible: false,

    invincibleTimer: 0,

    shieldActive: false,

    magnetActive: false,

    speedBoostActive: false

};


// ============================================================
// OBJECT ARRAYS
// ============================================================

let obstacles = [];
let coins = [];
let powerUps = [];
let particles = [];
let clouds = [];


// ============================================================
// OBSTACLE COLORS
// ============================================================

const obstacleColors = [

    "#ff4757",
    "#ff6b81",
    "#ffa502",
    "#ff7f50",
    "#ff3f34",
    "#e84393"

];


// ============================================================
// RESIZE CANVAS
// ============================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.y =
        canvas.height - 130;

    if (player.x === 0) {

        player.x =
            canvas.width / 2 -
            player.width / 2;

    }

}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// CLOUD CREATION
// ============================================================

function createClouds() {

    clouds = [];

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        clouds.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height *
                0.5,

            width:
                80 +
                Math.random() *
                100,

            height:
                30 +
                Math.random() *
                30,

            speed:
                0.2 +
                Math.random() *
                0.5

        });

    }

}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {

    score = 0;

    lives = 3;

    gameSpeed = 3;

obstacleTimer = 0;
coinTimer = 0;
powerUpTimer = 0;
difficultyTimer = 0;

// Reset power-up timers
magnetTimer = 0;
speedBoostTimer = 0;

    obstacles = [];

    coins = [];

    powerUps = [];

    particles = [];

    player.x =
        canvas.width / 2 -
        player.width / 2;

    player.y =
        canvas.height - 130;

    player.invincible = false;

    player.invincibleTimer = 0;

    player.shieldActive = false;

    player.magnetActive = false;

    player.speedBoostActive = false;

    updateUI();

}


// ============================================================
// UPDATE UI
// ============================================================

function updateUI() {

    if (scoreElement) {

        scoreElement.textContent =
            Math.floor(score);

    }

    if (livesElement) {

        livesElement.textContent =
            "❤️".repeat(lives);

    }

}


// ============================================================
// START GAME
// ============================================================
function startGame() {
    initAudio();

    resetGame();

    // Remove start-screen state
    if (gameContainer) {
        gameContainer.classList.remove("starting");
    }

    gameRunning = true;
    gamePaused = false;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");

    pauseButton.classList.remove("hidden");

    requestAnimationFrame(gameLoop);
}


// ============================================================
// PAUSE GAME
// ============================================================

function pauseGame() {

    if (!gameRunning) return;

    gamePaused = true;

    if (pauseScreen) {

        pauseScreen.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// RESUME GAME
// ============================================================

function resumeGame() {

    if (!gameRunning) return;

    gamePaused = false;

    if (pauseScreen) {

        pauseScreen.classList.add(
            "hidden"
        );

    }

    requestAnimationFrame(gameLoop);

}

// ============================================================
// YOUTUBE PLAYABLES PAUSE / RESUME
// ============================================================

if (
    typeof ytgame !== "undefined" &&
    ytgame.system
) {
    if (typeof ytgame.system.onPause === "function") {
        ytgame.system.onPause(() => {
            if (gameRunning && !gamePaused) {
                pauseGame();
            }
        });
    }

    if (typeof ytgame.system.onResume === "function") {
        ytgame.system.onResume(() => {
            if (gameRunning && gamePaused) {
                resumeGame();
            }
        });
    }
}

// ============================================================
// END GAME
// ============================================================

function endGame() {

    gameRunning = false;

    gamePaused = false;

        // Send final score to YouTube Playables
    if (
        typeof ytgame !== "undefined" &&
        ytgame.engagement &&
        typeof ytgame.engagement.sendScore === "function"
    ) {
        ytgame.engagement.sendScore({
            value: Math.floor(score)
        });
    }

    if (score > bestScore) {

        bestScore = Math.floor(score);

    }

    gameOverSound();

    if (finalScoreElement) {

        finalScoreElement.textContent =
            Math.floor(score);

    }

    if (finalBestElement) {

        finalBestElement.textContent =
            bestScore;

    }

    if (gameOverScreen) {

        gameOverScreen.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// PLAYER HIT
// ============================================================

function playerHit() {

    if (player.invincible) return;

    hitSound();

    if (player.shieldActive) {

        player.shieldActive = false;

        player.invincible = true;

        player.invincibleTimer = 50;

        createExplosion(
            player.x +
            player.width / 2,

            player.y +
            player.height / 2,

            "#4dabf7"
        );

        // Small shake when shield absorbs the hit
        triggerScreenShake(6);

        return;

    }

    lives--;

    lifeLostSound();

    createExplosion(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2,

        "#ff4757"
    );

    // Stronger shake when player loses a life
    triggerScreenShake(10);

    updateUI();

    player.invincible = true;

    player.invincibleTimer = 90;

    if (lives <= 0) {

        endGame();

    }

}


// ============================================================
// CREATE OBSTACLE
// ============================================================

function createObstacle() {

    const size =
        35 +
        Math.random() * 30;

    const x =
        Math.random() *
        (canvas.width - size);

    obstacles.push({

        x: x,

        y: -size,

        width: size,

        height: size,

        speed:
            gameSpeed +
            Math.random() * 2,

        color:
            obstacleColors[
                Math.floor(
                    Math.random() *
                    obstacleColors.length
                )
            ],

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            -0.05 +
            Math.random() * 0.1

    });

}


// ============================================================
// CREATE COIN
// ============================================================

function createCoin() {

    const size = 28;

    coins.push({

        x:
            20 +
            Math.random() *
            (canvas.width - 40),

        y: -size,

        width: size,

        height: size,

        speed:
            gameSpeed +
            0.5,

        rotation: 0

    });

}


// ============================================================
// CREATE POWER-UP
// ============================================================

function createPowerUp() {

    const types = [

        "shield",
        "magnet",
        "speed"

    ];

    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];

    powerUps.push({

        x:
            30 +
            Math.random() *
            (canvas.width - 60),

        y: -45,

        width: 42,

        height: 42,

        speed:
            gameSpeed,

        type: type,

        rotation: 0

    });

}


// ============================================================
// CREATE PARTICLE
// ============================================================

function createParticle(
    x,
    y,
    color
) {

    particles.push({

        x: x,

        y: y,

        size:
            2 +
            Math.random() * 5,

        speedX:
            -3 +
            Math.random() * 6,

        speedY:
            -3 +
            Math.random() * 6,

        life: 1,

        color: color

    });

}


// ============================================================
// CREATE EXPLOSION
// ============================================================

function createExplosion(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        createParticle(
            x,
            y,
            color
        );

    }

}


// ============================================================
// MOVE PLAYER
// ============================================================

function updatePlayer() {

    let currentSpeed =
        player.speed;

    if (player.speedBoostActive) {

        currentSpeed *= 1.7;

    }

    if (player.movingLeft) {

        player.x -= currentSpeed;

    }

    if (player.movingRight) {

        player.x += currentSpeed;

    }

    if (
        player.x < 0
    ) {

        player.x = 0;

    }

    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;

    }

    if (player.invincible) {

        player.invincibleTimer--;

        if (
            player.invincibleTimer <= 0
        ) {

            player.invincible =
                false;

        }

    }

}


// ============================================================
// UPDATE OBJECTS
// ============================================================

function updateObjects() {

    // -------------------------
    // Obstacles
    // -------------------------

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];

        obstacle.y +=
            obstacle.speed;

        obstacle.rotation +=
            obstacle.rotationSpeed;

        if (
            obstacle.y >
            canvas.height + 100
        ) {

            obstacles.splice(
                i,
                1
            );

        }

    }


    // -------------------------
    // Coins
    // -------------------------

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];

        coin.y +=
            coin.speed;

        coin.rotation +=
            0.08;


        // Magnet

        if (player.magnetActive) {

            const dx =
                player.x +
                player.width / 2 -
                (
                    coin.x +
                    coin.width / 2
                );

            const dy =
                player.y +
                player.height / 2 -
                (
                    coin.y +
                    coin.height / 2
                );

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance < 220) {

                coin.x +=
                    dx * 0.08;

                coin.y +=
                    dy * 0.08;

            }

        }


        if (
            coin.y >
            canvas.height + 50
        ) {

            coins.splice(
                i,
                1
            );

        }

    }


    // -------------------------
    // Power Ups
    // -------------------------

    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const powerUp =
            powerUps[i];

        powerUp.y +=
            powerUp.speed;

        powerUp.rotation +=
            0.05;

        if (
            powerUp.y >
            canvas.height + 60
        ) {

            powerUps.splice(
                i,
                1
            );

        }

    }


    // -------------------------
    // Particles
    // -------------------------

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x +=
            particle.speedX;

        particle.y +=
            particle.speedY;

        particle.life -=
            0.025;

        particle.size *=
            0.97;

        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }


    // -------------------------
    // Clouds
    // -------------------------

    for (
        const cloud of clouds
    ) {

        cloud.x -=
            cloud.speed;

        if (
            cloud.x +
            cloud.width <
            0
        ) {

            cloud.x =
                canvas.width;

        }

    }

}


// ============================================================
// COLLISION DETECTION
// ============================================================

function isColliding(
    a,
    b
) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y

    );

}


// ============================================================
// ACTIVATE POWER UP
// ============================================================

function activatePowerUp(
    type
) {

    if (type === "shield") {

        player.shieldActive =
            true;

        shieldSound();

        createExplosion(
            player.x +
            player.width / 2,

            player.y +
            player.height / 2,

            "#4dabf7"
        );

    }


    if (type === "magnet") {

        player.magnetActive =
            true;

        magnetSound();

        createExplosion(
            player.x +
            player.width / 2,

            player.y +
            player.height / 2,

            "#9b59b6"
        );

     magnetTimer = 8000;

    }


    if (type === "speed") {

        player.speedBoostActive =
            true;

        speedSound();

        createExplosion(
            player.x +
            player.width / 2,

            player.y +
            player.height / 2,

            "#ffd43b"
        );

       speedBoostTimer = 5000;

    }

}


// ============================================================
// CHECK COLLISIONS
// ============================================================

function checkCollisions() {

    // -------------------------
    // Obstacles
    // -------------------------

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        if (
            isColliding(
                player,
                obstacles[i]
            )
        ) {

            obstacles.splice(
                i,
                1
            );

            playerHit();

        }

    }


    // -------------------------
    // Coins
    // -------------------------

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        if (
            isColliding(
                player,
                coins[i]
            )
        ) {

            const coin =
                coins[i];

            score += 25;

            coinSound();

            createExplosion(
                coin.x +
                coin.width / 2,

                coin.y +
                coin.height / 2,

                "#ffd43b"
            );

            coins.splice(
                i,
                1
            );

            updateUI();

        }

    }


    // -------------------------
    // Power Ups
    // -------------------------

    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        if (
            isColliding(
                player,
                powerUps[i]
            )
        ) {

            activatePowerUp(
                powerUps[i].type
            );

            powerUps.splice(
                i,
                1
            );

        }

    }

}


// ============================================================
// SCORE / DIFFICULTY
// ============================================================
function updateScore() {

    score += 0.1;

    difficultyTimer++;

    if (difficultyTimer >= 600) {

        difficultyTimer = 0;

        gameSpeed += 0.25;

        if (gameSpeed > 8) {
            gameSpeed = 8;
        }
    }

    updateUI();

}
// ============================================================
// SPAWN OBJECTS
// ============================================================

function spawnObjects() {

    obstacleTimer++;

    coinTimer++;

    powerUpTimer++;


    // Obstacles

    const obstacleDelay =
        Math.max(
            25,
            65 -
            Math.floor(
                score / 100
            )
        );

    if (
        obstacleTimer >=
        obstacleDelay
    ) {

        obstacleTimer = 0;

        createObstacle();

    }


    // Coins

    if (
        coinTimer >= 45
    ) {

        coinTimer = 0;

        createCoin();

    }


    // Power Ups

    if (
        powerUpTimer >= 700
    ) {

        powerUpTimer = 0;

        createPowerUp();

    }

}


// ============================================================
// DRAW BACKGROUND
// ============================================================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#74c0fc"
    );

    gradient.addColorStop(
        0.45,
        "#a5d8ff"
    );

    gradient.addColorStop(
        1,
        "#d0ebff"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Sun

    ctx.beginPath();

    ctx.arc(
        canvas.width - 90,
        90,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffe066";

    ctx.fill();


    // Clouds

    for (
        const cloud of clouds
    ) {

        ctx.fillStyle =
            "rgba(255,255,255,0.85)";

        ctx.beginPath();

        ctx.arc(
            cloud.x + 25,
            cloud.y + 25,
            25,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + 55,
            cloud.y + 15,
            32,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + 90,
            cloud.y + 25,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


// ============================================================
// DRAW PLAYER
// ============================================================

function drawPlayer() {

    const x =
        player.x;

    const y =
        player.y;


    // Invincibility blink

    if (
        player.invincible &&
        Math.floor(
            player.invincibleTimer / 6
        ) % 2 === 0
    ) {

        return;

    }


    // Shield

    if (
        player.shieldActive
    ) {

        ctx.beginPath();

        ctx.arc(
            x +
            player.width / 2,

            y +
            player.height / 2,

            42,

            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#4dabf7";

        ctx.lineWidth = 5;

        ctx.stroke();

        ctx.fillStyle =
            "rgba(77,171,247,0.15)";

        ctx.fill();

    }


    // Body

    ctx.fillStyle =
        "#ff6b6b";

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        player.width,
        player.height,
        15
    );

    ctx.fill();


    // Ears

    ctx.fillStyle =
        "#ff8787";

    ctx.beginPath();

    ctx.arc(
        x + 10,
        y + 8,
        10,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x +
        player.width -
        10,

        y + 8,

        10,

        0,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        x + 18,
        y + 24,
        7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 37,
        y + 24,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pupils

    ctx.fillStyle =
        "#222";

    ctx.beginPath();

    ctx.arc(
        x + 18,
        y + 24,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 37,
        y + 24,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Smile

    ctx.strokeStyle =
        "#222";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
        x +
        player.width / 2,

        y + 28,

        12,

        0,

        Math.PI
    );

    ctx.stroke();

}


// ============================================================
// DRAW OBSTACLES
// ============================================================

function drawObstacles() {

    for (
        const obstacle of obstacles
    ) {

        ctx.save();

        ctx.translate(
            obstacle.x +
            obstacle.width / 2,

            obstacle.y +
            obstacle.height / 2
        );

        ctx.rotate(
            obstacle.rotation
        );

        ctx.fillStyle =
            obstacle.color;

        ctx.beginPath();

        ctx.roundRect(
            -obstacle.width / 2,
            -obstacle.height / 2,
            obstacle.width,
            obstacle.height,
            10
        );

        ctx.fill();


        // Highlight

        ctx.fillStyle =
            "rgba(255,255,255,0.35)";

        ctx.beginPath();

        ctx.arc(
            -obstacle.width / 4,
            -obstacle.height / 4,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}


// ============================================================
// DRAW COINS
// ============================================================

function drawCoins() {

    for (
        const coin of coins
    ) {

        ctx.save();

        ctx.translate(
            coin.x +
            coin.width / 2,

            coin.y +
            coin.height / 2
        );

        ctx.rotate(
            coin.rotation
        );


        ctx.fillStyle =
            "#ffd43b";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#f08c00";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle =
            "#fff3bf";

        ctx.font =
            "bold 16px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "$",
            0,
            1
        );


        ctx.restore();

    }

}


// ============================================================
// DRAW POWER UPS
// ============================================================

function drawPowerUps() {

    for (
        const powerUp of powerUps
    ) {

        ctx.save();

        ctx.translate(
            powerUp.x +
            powerUp.width / 2,

            powerUp.y +
            powerUp.height / 2
        );

        ctx.rotate(
            powerUp.rotation
        );


        let color =
            "#4dabf7";

        let symbol =
            "🛡";


        if (
            powerUp.type ===
            "magnet"
        ) {

            color =
                "#cc5de8";

            symbol =
                "🧲";

        }


        if (
            powerUp.type ===
            "speed"
        ) {

            color =
                "#ffd43b";

            symbol =
                "⚡";

        }


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            powerUp.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            color;

        ctx.fill();


        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.font =
            "24px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillStyle =
            "#ffffff";

        ctx.fillText(
            symbol,
            0,
            1
        );


        ctx.restore();

    }

}


// ============================================================
// DRAW PARTICLES
// ============================================================

function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.globalAlpha =
            particle.life;

        ctx.fillStyle =
            particle.color;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

}
function triggerScreenShake(intensity = 8) {
    screenShake = 12;
    screenShakeIntensity = intensity;
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {
        return;
    }
        // --------------------------------
    // Power-up timers
    // --------------------------------

    // These timers only decrease while
    // the game loop is running.
    // Therefore they automatically pause
    // when Playables pauses the game.

    if (player.magnetActive) {

        magnetTimer -= 16.67;

        if (magnetTimer <= 0) {

            player.magnetActive = false;
            magnetTimer = 0;

        }
    }

    if (player.speedBoostActive) {

        speedBoostTimer -= 16.67;

        if (speedBoostTimer <= 0) {

            player.speedBoostActive = false;
            speedBoostTimer = 0;

        }
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // -----------------------------
    // Screen Shake
    // -----------------------------

    ctx.save();

    if (screenShake > 0) {

        const shakeX =
            (Math.random() - 0.5) *
            screenShakeIntensity;

        const shakeY =
            (Math.random() - 0.5) *
            screenShakeIntensity;

        ctx.translate(
            shakeX,
            shakeY
        );

        screenShake--;

        screenShakeIntensity *= 0.9;

        // Prevent tiny floating values
        if (screenShakeIntensity < 0.1) {
            screenShakeIntensity = 0;
        }
    }


    // -----------------------------
    // Background
    // -----------------------------

    drawBackground();


    // -----------------------------
    // Game Logic
    // -----------------------------

    updatePlayer();

    spawnObjects();

    updateObjects();

    checkCollisions();

    updateScore();


    // -----------------------------
    // Drawing
    // -----------------------------

    drawObstacles();

    drawCoins();

    drawPowerUps();

    drawParticles();

    drawPlayer();


    // -----------------------------
    // End Screen Shake
    // -----------------------------

    ctx.restore();


    // -----------------------------
    // Continue Game Loop
    // -----------------------------

    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "ArrowLeft" ||
            event.key.toLowerCase() ===
            "a"
        ) {

            player.movingLeft =
                true;

        }


        if (
            event.key ===
            "ArrowRight" ||
            event.key.toLowerCase() ===
            "d"
        ) {

            player.movingRight =
                true;

        }


        if (
            event.key ===
            "Escape"
        ) {

            if (
                gameRunning &&
                !gamePaused
            ) {

                pauseGame();

            }

            else if (
                gameRunning &&
                gamePaused
            ) {

                resumeGame();

            }

        }

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        if (
            event.key ===
            "ArrowLeft" ||
            event.key.toLowerCase() ===
            "a"
        ) {

            player.movingLeft =
                false;

        }


        if (
            event.key ===
            "ArrowRight" ||
            event.key.toLowerCase() ===
            "d"
        ) {

            player.movingRight =
                false;

        }

    }
);


// ============================================================
// MOBILE CONTROLS
// ============================================================

if (leftButton) {

    leftButton.addEventListener(
        "pointerdown",
        () => {

            player.movingLeft =
                true;

        }
    );


    leftButton.addEventListener(
        "pointerup",
        () => {

            player.movingLeft =
                false;

        }
    );


    leftButton.addEventListener(
        "pointerleave",
        () => {

            player.movingLeft =
                false;

        }
    );

}


if (rightButton) {

    rightButton.addEventListener(
        "pointerdown",
        () => {

            player.movingRight =
                true;

        }
    );


    rightButton.addEventListener(
        "pointerup",
        () => {

            player.movingRight =
                false;

        }
    );


    rightButton.addEventListener(
        "pointerleave",
        () => {

            player.movingRight =
                false;

        }
    );

}


// ============================================================
// BUTTONS
// ============================================================

if (startButton) {

    startButton.addEventListener(
        "click",
        () => {

            initAudio();

            startGame();

        }
    );

}


if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            initAudio();

            startGame();

        }
    );

}


if (pauseButton) {

    pauseButton.addEventListener(
        "click",
        () => {

            pauseGame();

        }
    );

}


if (resumeButton) {

    resumeButton.addEventListener(
        "click",
        () => {

            resumeGame();

        }
    );

}


// ============================================================
// SOUND BUTTON
// ============================================================

if (soundButton) {

    soundButton.textContent =
        "🔊";


    soundButton.addEventListener(
        "click",
        () => {

            initAudio();

            soundEnabled =
                !soundEnabled;


            soundButton.textContent =
                soundEnabled
                    ? "🔊"
                    : "🔇";


            if (soundEnabled) {

                playTone(
                    600,
                    0.08,
                    "sine",
                    0.05,
                    900
                );

            }

        }
    );

}
if (
    typeof ytgame !== "undefined" &&
    ytgame.IN_PLAYABLES_ENV &&
    soundButton
) {
    soundButton.style.display = "none";
}
if (
    typeof ytgame !== "undefined" &&
    ytgame.IN_PLAYABLES_ENV &&
    pauseButton
) {
    pauseButton.style.display = "none";
}

// ============================================================
// YOUTUBE PLAYABLES AUDIO
// ============================================================

if (
    typeof ytgame !== "undefined" &&
    ytgame.system
) {
    updateYouTubeAudioState();

    if (typeof ytgame.system.onAudioEnabledChange === "function") {
        ytgame.system.onAudioEnabledChange((enabled) => {
            youtubeAudioEnabled = enabled;
        });
    }
}
// ============================================================
// INITIALIZATION
// ============================================================

resizeCanvas();

createClouds();

resetGame();

if (gameContainer) {
    gameContainer.classList.add("starting");
}


// Initial screen

if (pauseScreen) {

    pauseScreen.classList.add(
        "hidden"
    );

}

if (gameOverScreen) {

    gameOverScreen.classList.add(
        "hidden"
    );

}