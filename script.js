// Game Configuration
const config = {
    width: 800,
    height: 600,
    playerSpeed: 5,
    bulletSpeed: 7,
    enemySpeed: 2,
    enemySpawnRate: 1000, // ms
    maxEnemies: 20,
    lives: 3
};

// Game State
let gameState = {
    score: 0,
    lives: config.lives,
    gameOver: false,
    lastEnemySpawn: 0,
    enemies: [],
    bullets: [],
    keys: {}
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Initialize Game
function init() {
    canvas.width = config.width;
    canvas.height = config.height;
    
    // Player object
    gameState.player = {
        x: config.width / 2 - 25,
        y: config.height - 80,
        width: 50,
        height: 50,
        speed: config.playerSpeed,
        lastShot: 0
    };

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    document.getElementById('saveScoreBtn').addEventListener('click', saveScore);

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(timestamp) {
    if (gameState.gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Draw starfield background
    drawBackground();

    // Spawn enemies
    if (timestamp - gameState.lastEnemySpawn > config.enemySpawnRate && 
        gameState.enemies.length < config.maxEnemies) {
        spawnEnemy();
        gameState.lastEnemySpawn = timestamp;
    }

    // Update and draw game objects
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();

    // Update UI
    updateUI();

    requestAnimationFrame(gameLoop);
}

// Game Object Functions
function drawBackground() {
    // Draw starfield
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Draw some stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * config.width;
        const y = (Math.random() * config.height + (Date.now() * 0.05)) % config.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function updatePlayer() {
    // Handle movement
    if (gameState.keys['ArrowLeft'] && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
    }
    if (gameState.keys['ArrowRight'] && gameState.player.x < config.width - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
    }
    if (gameState.keys[' '] && Date.now() - gameState.player.lastShot > 300) {
        shoot();
        gameState.player.lastShot = Date.now();
    }

    // Draw player
    ctx.fillStyle = '#3498db';
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
}

function shoot() {
    gameState.bullets.push({
        x: gameState.player.x + gameState.player.width / 2 - 2.5,
        y: gameState.player.y,
        width: 5,
        height: 15,
        speed: config.bulletSpeed
    });
}

function updateBullets() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        bullet.y -= bullet.speed;

        // Draw bullet
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullets that are off screen
        if (bullet.y < 0) {
            gameState.bullets.splice(i, 1);
        }
    }
}

function spawnEnemy() {
    const size = 30 + Math.random() * 20;
    gameState.enemies.push({
        x: Math.random() * (config.width - size),
        y: -size,
        width: size,
        height: size,
        speed: config.enemySpeed + Math.random() * 2
    });
}

function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        enemy.y += enemy.speed;

        // Draw enemy
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Remove enemies that are off screen
        if (enemy.y > config.height) {
            gameState.enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Bullet-Enemy collisions
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            if (checkCollision(gameState.bullets[i], gameState.enemies[j])) {
                gameState.score += 10;
                gameState.bullets.splice(i, 1);
                gameState.enemies.splice(j, 1);
                break;
            }
        }
    }

    // Player-Enemy collisions
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        if (checkCollision(gameState.player, gameState.enemies[i])) {
            gameState.lives--;
            gameState.enemies.splice(i, 1);
            updateLivesDisplay();
            
            if (gameState.lives <= 0) {
                gameOver();
            }
            break;
        }
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// UI Functions
function updateUI() {
    scoreElement.textContent = `SCORE: ${gameState.score}`;
}

function updateLivesDisplay() {
    livesElement.innerHTML = '';
    for (let i = 0; i < gameState.lives; i++) {
        livesElement.innerHTML += '<i class="fas fa-heart text-red-500"></i>';
    }
}

function gameOver() {
    gameState.gameOver = true;
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = gameState.score;
}

function resetGame() {
    gameState = {
        score: 0,
        lives: config.lives,
        gameOver: false,
        lastEnemySpawn: 0,
        enemies: [],
        bullets: [],
        keys: {}
    };
    gameOverElement.style.display = 'none';
    init();
}

function saveScore() {
    const highscores = JSON.parse(localStorage.getItem('galacticShooterHighscores') || '[]');
    highscores.push({
        score: gameState.score,
        date: new Date().toISOString()
    });
    
    // Sort and keep top 10
    highscores.sort((a, b) => b.score - a.score);
    if (highscores.length > 10) highscores.length = 10;
    
    localStorage.setItem('galacticShooterHighscores', JSON.stringify(highscores));
    window.location.href = 'highscores.html';
}

// Event Handlers
function handleKeyDown(e) {
    gameState.keys[e.key] = true;
}

function handleKeyUp(e) {
    gameState.keys[e.key] = false;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);