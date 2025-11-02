// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameStatusElement = document.getElementById('game-status');
const restartButton = document.getElementById('restart-btn');
const pauseButton = document.getElementById('pause-btn');

// Control buttons
const upButton = document.getElementById('up-btn');
const downButton = document.getElementById('down-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');

// Game constants
const GRID_SIZE = 20;
const GAME_SPEED = 200; // milliseconds

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Initialize game
function init() {
    // Set high score
    highScoreElement.textContent = highScore;
    
    // Create initial snake
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    // Generate first food
    generateFood();
    
    // Draw initial state
    draw();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Control buttons
    upButton.addEventListener('click', () => changeDirection('up'));
    downButton.addEventListener('click', () => changeDirection('down'));
    leftButton.addEventListener('click', () => changeDirection('left'));
    rightButton.addEventListener('click', () => changeDirection('right'));
    
    // Game control buttons
    restartButton.addEventListener('click', resetGame);
    pauseButton.addEventListener('click', togglePause);
    
    // Start game with spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameRunning) {
                startGame();
            } else {
                togglePause();
            }
        }
    });
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            changeDirection('up');
            break;
        case 'ArrowDown':
            changeDirection('down');
            break;
        case 'ArrowLeft':
            changeDirection('left');
            break;
        case 'ArrowRight':
            changeDirection('right');
            break;
    }
}

// Change direction with validation (no 180-degree turns)
function changeDirection(newDirection) {
    if (
        (newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')
    ) {
        nextDirection = newDirection;
    }
}

// Generate food at random position
function generateFood() {
    const maxX = canvas.width / GRID_SIZE - 1;
    const maxY = canvas.height / GRID_SIZE - 1;
    
    let newFood;
    let onSnake;
    
    do {
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        
        onSnake = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    } while (onSnake);
    
    food = newFood;
}

// Main game loop
function gameUpdate() {
    if (gamePaused) return;
    
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // Check for collisions with walls
    if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= canvas.width / GRID_SIZE || 
        head.y >= canvas.height / GRID_SIZE
    ) {
        gameOver();
        return;
    }
    
    // Check for collisions with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Generate new food
        generateFood();
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Draw updated game state
    draw();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a2a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw head with different color
            ctx.fillStyle = '#4CAF50';
        } else {
            // Draw body
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE, 
            segment.y * GRID_SIZE, 
            GRID_SIZE - 1, 
            GRID_SIZE - 1
        );
        
        // Add eyes to the head
        if (index === 0) {
            ctx.fillStyle = '#000';
            
            // Eye positions based on direction
            let eye1X, eye1Y, eye2X, eye2Y;
            
            switch(direction) {
                case 'up':
                    eye1X = segment.x * GRID_SIZE + 4;
                    eye1Y = segment.y * GRID_SIZE + 4;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - 8;
                    eye2Y = segment.y * GRID_SIZE + 4;
                    break;
                case 'down':
                    eye1X = segment.x * GRID_SIZE + 4;
                    eye1Y = segment.y * GRID_SIZE + GRID_SIZE - 8;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - 8;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - 8;
                    break;
                case 'left':
                    eye1X = segment.x * GRID_SIZE + 4;
                    eye1Y = segment.y * GRID_SIZE + 4;
                    eye2X = segment.x * GRID_SIZE + 4;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - 8;
                    break;
                case 'right':
                    eye1X = segment.x * GRID_SIZE + GRID_SIZE - 8;
                    eye1Y = segment.y * GRID_SIZE + 4;
                    eye2X = segment.x * GRID_SIZE + GRID_SIZE - 8;
                    eye2Y = segment.y * GRID_SIZE + GRID_SIZE - 8;
                    break;
            }
            
            ctx.fillRect(eye1X, eye1Y, 4, 4);
            ctx.fillRect(eye2X, eye2Y, 4, 4);
        }
    });
    
    // Draw food
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    gameStatusElement.textContent = 'Game Running';
    pauseButton.textContent = 'Pause';
    
    gameLoop = setInterval(gameUpdate, GAME_SPEED);
}

// Toggle pause state
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        gameStatusElement.textContent = 'Game Paused';
        pauseButton.textContent = 'Resume';
    } else {
        gameStatusElement.textContent = 'Game Running';
        pauseButton.textContent = 'Pause';
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    gameStatusElement.textContent = `Game Over! Final Score: ${score}`;
    
    // Draw game over text on canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Reset game
function resetGame() {
    // Clear game loop
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // Reset game state
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gamePaused = false;
    gameStatusElement.textContent = 'Press SPACE to start';
    pauseButton.textContent = 'Pause';
    
    // Generate new food
    generateFood();
    
    // Draw initial state
    draw();
}

// Initialize the game when the page loads
window.addEventListener('load', init);