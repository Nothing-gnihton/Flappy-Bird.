document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const bird = document.getElementById('bird');
    const scoreDisplay = document.getElementById('score-display');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const startScreen = document.getElementById('start-screen');

    // Game variables
    let gameIsRunning = false;
    let gameOver = false;
    let score = 0;
    let gravity = 0.5;
    let birdVelocity = 0;
    let birdPosition = 250;
    let pipeGap = 150;
    let pipeFrequency = 1500; // milliseconds
    let pipes = [];
    let clouds = [];
    let gameSpeed = 2;
    let gameAreaWidth = 400;
    let gameAreaHeight = 600;
    let birdWidth = 40;
    let birdHeight = 30;
    let pipeWidth = 60;
    let animationId;
    let pipeTimer;
    let cloudTimer;

    // Initialize game
    function initGame() {
        // Reset variables
        gameIsRunning = false;
        gameOver = false;
        score = 0;
        birdVelocity = 0;
        birdPosition = 250;
        pipes = [];
        clouds = [];
        
        // Reset displays
        scoreDisplay.textContent = '0';
        finalScoreDisplay.textContent = '0';
        gameOverScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        
        // Reset bird position
        bird.style.top = birdPosition + 'px';
        bird.style.left = '50px';
        bird.style.transform = 'rotate(0deg)';
        
        // Clear existing pipes and clouds
        document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
        document.querySelectorAll('.cloud').forEach(cloud => cloud.remove());
        
        // Clear any running intervals
        clearInterval(pipeTimer);
        clearInterval(cloudTimer);
        cancelAnimationFrame(animationId);
    }

    // Start game
    function startGame() {
        if (gameIsRunning) return;
        
        gameIsRunning = true;
        gameOver = false;
        score = 0;
        birdVelocity = 0;
        birdPosition = 250;
        pipes = [];
        clouds = [];
        
        scoreDisplay.textContent = '0';
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        
        // Start generating pipes
        pipeTimer = setInterval(createPipe, pipeFrequency);
        
        // Start generating clouds
        cloudTimer = setInterval(createCloud, 3000);
        
        // Start game loop
        gameLoop();
    }

    // Game loop
    function gameLoop() {
        if (gameOver) {
            endGame();
            return;
        }
        
        updateBird();
        updatePipes();
        updateClouds();
        checkCollisions();
        
        animationId = requestAnimationFrame(gameLoop);
    }

    // Update bird position
    function updateBird() {
        birdVelocity += gravity;
        birdPosition += birdVelocity;
        
        // Apply rotation based on velocity
        let rotation = Math.min(Math.max(birdVelocity * 5, -30), 30);
        bird.style.transform = `rotate(${rotation}deg)`;
        
        // Keep bird within bounds
        if (birdPosition < 0) {
            birdPosition = 0;
            birdVelocity = 0;
        } else if (birdPosition > gameAreaHeight - birdHeight) {
            birdPosition = gameAreaHeight - birdHeight;
            birdVelocity = 0;
            gameOver = true;
        }
        
        bird.style.top = birdPosition + 'px';
    }

    // Create a new pipe
    function createPipe() {
        if (!gameIsRunning || gameOver) return;
        
        const minHeight = 50;
        const maxHeight = gameAreaHeight - pipeGap - minHeight;
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        // Top pipe
        const topPipe = document.createElement('div');
        topPipe.className = 'pipe';
        topPipe.style.left = gameAreaWidth + 'px';
        topPipe.style.top = '0';
        topPipe.style.height = pipeHeight + 'px';
        gameBoard.appendChild(topPipe);
        
        // Bottom pipe
        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe';
        bottomPipe.style.left = gameAreaWidth + 'px';
        bottomPipe.style.top = (pipeHeight + pipeGap) + 'px';
        bottomPipe.style.height = (gameAreaHeight - pipeHeight - pipeGap) + 'px';
        gameBoard.appendChild(bottomPipe);
        
        pipes.push({
            element: topPipe,
            x: gameAreaWidth,
            height: pipeHeight,
            top: true,
            passed: false
        });
        
        pipes.push({
            element: bottomPipe,
            x: gameAreaWidth,
            height: gameAreaHeight - pipeHeight - pipeGap,
            top: false,
            passed: false
        });
    }

    // Update pipes position
    function updatePipes() {
        for (let i = 0; i < pipes.length; i++) {
            const pipe = pipes[i];
            pipe.x -= gameSpeed;
            pipe.element.style.left = pipe.x + 'px';
            
            // Check if bird passed the pipe
            if (!pipe.passed && !pipe.top && pipe.x + pipeWidth < 50) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = score;
                
                // Increase difficulty
                if (score % 5 === 0) {
                    gameSpeed += 0.5;
                    pipeFrequency = Math.max(800, pipeFrequency - 100);
                }
            }
            
            // Remove pipes that are off screen
            if (pipe.x + pipeWidth < 0) {
                pipe.element.remove();
                pipes.splice(i, 1);
                i--;
            }
        }
    }

    // Create a cloud
    function createCloud() {
        if (!gameIsRunning || gameOver) return;
        
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.left = gameAreaWidth + 'px';
        cloud.style.top = Math.random() * (gameAreaHeight / 2) + 'px';
        cloud.style.width = (Math.random() * 100 + 50) + 'px';
        cloud.style.height = (Math.random() * 40 + 20) + 'px';
        gameBoard.appendChild(cloud);
        
        clouds.push({
            element: cloud,
            x: gameAreaWidth
        });
    }

    // Update clouds position
    function updateClouds() {
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            cloud.x -= gameSpeed / 2;
            cloud.element.style.left = cloud.x + 'px';
            
            // Remove clouds that are off screen
            if (cloud.x + 150 < 0) {
                cloud.element.remove();
                clouds.splice(i, 1);
                i--;
            }
        }
    }

    // Check for collisions
    function checkCollisions() {
        // Bird boundaries
        const birdLeft = 50;
        const birdRight = birdLeft + birdWidth;
        const birdTop = birdPosition;
        const birdBottom = birdPosition + birdHeight;
        
        // Check collision with pipes
        for (const pipe of pipes) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + pipeWidth;
            const pipeTop = pipe.top ? 0 : pipeHeight + pipeGap;
            const pipeBottom = pipe.top ? pipeHeight : gameAreaHeight;
            
            if (birdRight > pipeLeft && 
                birdLeft < pipeRight && 
                birdBottom > pipeTop && 
                birdTop < pipeBottom) {
                gameOver = true;
                return;
            }
        }
    }

    // End game
    function endGame() {
        gameIsRunning = false;
        clearInterval(pipeTimer);
        clearInterval(cloudTimer);
        cancelAnimationFrame(animationId);
        
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // Jump function
    function jump() {
        if (!gameIsRunning && !gameOver) {
            startGame();
        }
        
        if (gameIsRunning && !gameOver) {
            birdVelocity = -8;
        }
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            jump();
        }
    });

    gameBoard.addEventListener('click', () => {
        jump();
    });

    restartBtn.addEventListener('click', () => {
        initGame();
    });

    // Initialize game on load
    initGame();
});
