// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // UI elements
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const scoreLeftEl = document.getElementById('scoreLeft');
    const scoreRightEl = document.getElementById('scoreRight');
    const modeSelect = document.getElementById('gameMode');
    const difficultySelect = document.getElementById('difficulty');

    // Colors (match CSS vars)
    const colors = {
        left: getCssVar('--paddle-left') || '#22c55e',
        right: getCssVar('--paddle-right') || '#ef4444',
        ball: getCssVar('--ball') || '#f59e0b',
        net: '#334155'
    };

    function getCssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // Game constants
    const W = canvas.width;
    const H = canvas.height;
    const PADDLE_WIDTH = 14;
    const PADDLE_HEIGHT = 90;
    const PADDLE_MARGIN = 24;
    const BALL_SIZE = 12;
    const MAX_SCORE = 10;

    // State
    let mode = 'single'; // 'single' | 'two'
    let difficulty = 'medium'; // 'easy' | 'medium' | 'hard'
    let running = false;
    let paused = false;
    let lastTime = 0;
    let scoreLeft = 0;
    let scoreRight = 0;

    const leftPaddle = { x: PADDLE_MARGIN, y: (H - PADDLE_HEIGHT) / 2, vy: 0, speed: 360 };
    const rightPaddle = { x: W - PADDLE_MARGIN - PADDLE_WIDTH, y: (H - PADDLE_HEIGHT) / 2, vy: 0, speed: 360 };

    const ball = {
        x: W / 2, y: H / 2,
        vx: 280, vy: 180,
        speedInc: 1.04 // speed-up factor on paddle hit
    };

    // Input
    const keys = {
        w: false, s: false, o: false, l: false, p: false
    };

    window.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 'w': keys.w = true; break;
            case 's': keys.s = true; break;
            case 'o': keys.o = true; break;
            case 'l': keys.l = true; break;
            case 'p': togglePause(); break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch (e.key.toLowerCase()) {
            case 'w': keys.w = false; break;
            case 's': keys.s = false; break;
            case 'o': keys.o = false; break;
            case 'l': keys.l = false; break;
        }
    });

    // UI events
    startBtn.addEventListener('click', () => {
        mode = modeSelect.value;
        difficulty = difficultySelect.value;
        resetGame(false);
        running = true;
        paused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        requestAnimationFrame(loop);
    });

    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', () => resetGame(true));

    function togglePause() {
        if (!running) return;
        paused = !paused;
        pauseBtn.textContent = paused ? 'Sürdür' : 'Duraklat';
        if (!paused) requestAnimationFrame(loop);
    }

    function resetGame(full = true) {
        scoreLeft = full ? 0 : scoreLeft;
        scoreRight = full ? 0 : scoreRight;
        scoreLeftEl.textContent = scoreLeft;
        scoreRightEl.textContent = scoreRight;

        leftPaddle.y = (H - PADDLE_HEIGHT) / 2;
        rightPaddle.y = (H - PADDLE_HEIGHT) / 2;

        ball.x = W / 2;
        ball.y = H / 2;

        // Randomize initial direction
        const dirX = Math.random() < 0.5 ? -1 : 1;
        const dirY = Math.random() < 0.5 ? -1 : 1;
        const baseSpeed = 280;
        ball.vx = baseSpeed * dirX;
        ball.vy = (baseSpeed * 0.65) * dirY;

        running = full ? false : running;
        paused = false;
        startBtn.disabled = !full;
        pauseBtn.disabled = full;
        resetBtn.disabled = !running;
        pauseBtn.textContent = 'Duraklat';
        draw(); // immediate refresh
    }

    function loop(ts) {
        if (!running || paused) return;
        const dt = Math.min((ts - lastTime) / 1000, 0.02); // clamp dt
        lastTime = ts;

        update(dt);
        draw();

        requestAnimationFrame(loop);
    }

    function update(dt) {
        // Player input
        leftPaddle.vy = 0;
        rightPaddle.vy = 0;

        // Left paddle (Player 1)
        if (keys.w) leftPaddle.vy -= leftPaddle.speed;
        if (keys.s) leftPaddle.vy += leftPaddle.speed;

        // Right paddle: Player 2 or AI
        if (mode === 'two') {
            if (keys.o) rightPaddle.vy -= rightPaddle.speed;
            if (keys.l) rightPaddle.vy += rightPaddle.speed;
        } else {
            aiUpdate(dt);
        }

        // Move paddles
        leftPaddle.y += leftPaddle.vy * dt;
        rightPaddle.y += rightPaddle.vy * dt;

        clampPaddle(leftPaddle);
        clampPaddle(rightPaddle);

        // Move ball
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Collide with top/bottom
        if (ball.y <= BALL_SIZE || ball.y >= H - BALL_SIZE) {
            ball.vy = -ball.vy;
            ball.y = Math.max(BALL_SIZE, Math.min(H - BALL_SIZE, ball.y));
        }

        // Collide with paddles
        // Left paddle collision
        if (ball.x - BALL_SIZE <= leftPaddle.x + PADDLE_WIDTH &&
            ball.y >= leftPaddle.y &&
            ball.y <= leftPaddle.y + PADDLE_HEIGHT &&
            ball.vx < 0) {
            collideWithPaddle(leftPaddle, 1);
        }

        // Right paddle collision
        if (ball.x + BALL_SIZE >= rightPaddle.x &&
            ball.y >= rightPaddle.y &&
            ball.y <= rightPaddle.y + PADDLE_HEIGHT &&
            ball.vx > 0) {
            collideWithPaddle(rightPaddle, -1);
        }

        // Score
        if (ball.x < -BALL_SIZE) {
            scoreRight++;
            scoreRightEl.textContent = scoreRight;
            afterScore(-1);
        } else if (ball.x > W + BALL_SIZE) {
            scoreLeft++;
            scoreLeftEl.textContent = scoreLeft;
            afterScore(1);
        }

        // End game
        if (scoreLeft >= MAX_SCORE || scoreRight >= MAX_SCORE) {
            running = false;
            paused = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }

    function aiUpdate(dt) {
        // AI difficulty parameters
        let followSpeed, reactionDelay, aimVariance;

        switch (difficulty) {
            case 'easy':
                followSpeed = 240;       // slower paddle
                reactionDelay = 0.12;    // slower reaction
                aimVariance = 0.35;      // more randomness
                break;
            case 'medium':
                followSpeed = 320;
                reactionDelay = 0.06;
                aimVariance = 0.22;
                break;
            case 'hard':
                followSpeed = 440;       // fast paddle
                reactionDelay = 0.02;    // near-instant
                aimVariance = 0.08;      // minimal randomness
                break;
        }

        // Adjust right paddle speed smoothly
        const targetY = predictBallY(reactionDelay);
        const delta = targetY - (rightPaddle.y + PADDLE_HEIGHT / 2);
        const dir = Math.sign(delta);
        rightPaddle.vy = dir * followSpeed;

        // Slight jitter to avoid perfect tracking
        rightPaddle.vy += (Math.random() - 0.5) * followSpeed * aimVariance;

        // Limit overshoot
        if (Math.abs(delta) < 6) rightPaddle.vy *= 0.4;
    }

    function predictBallY(delay) {
        // Simple linear prediction: where will the ball be after `delay`?
        const predictedY = ball.y + ball.vy * delay;
        // Reflect off bounds to approximate bounces during delay window
        let y = predictedY;
        let top = BALL_SIZE, bottom = H - BALL_SIZE;
        while (y < top || y > bottom) {
            if (y < top) y = top + (top - y);
            else if (y > bottom) y = bottom - (y - bottom);
        }
        return y;
    }

    function collideWithPaddle(paddle, dirX) {
        // Place ball at collision edge
        ball.x = dirX > 0 ? (paddle.x + PADDLE_WIDTH + BALL_SIZE) : (paddle.x - BALL_SIZE);
        ball.vx = Math.abs(ball.vx) * dirX * ball.speedInc;

        // Add angle based on hit position
        const hitPos = (ball.y - paddle.y) / PADDLE_HEIGHT; // 0..1
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // tilt up/down
        const speed = Math.hypot(ball.vx, ball.vy) * 1.02; // slight speed increase
        ball.vx = Math.cos(angle) * speed * dirX;
        ball.vy = Math.sin(angle) * speed;

        // Small randomization to avoid loops
        ball.vy += (Math.random() - 0.5) * 20;
    }

    function afterScore(dirX) {
        // Reset ball to center heading towards the scorer
        ball.x = W / 2;
        ball.y = H / 2;
        const base = 260;
        ball.vx = base * dirX;
        ball.vy = (Math.random() - 0.5) * base;

        // Brief pause effect (visual only)
        for (let i = 0; i < 2; i++) draw();
    }

    function clampPaddle(p) {
        p.y = Math.max(0, Math.min(H - PADDLE_HEIGHT, p.y));
    }

    function draw() {
        // Clear
        ctx.clearRect(0, 0, W, H);

        // Draw center net
        ctx.fillStyle = colors.net;
        const dashH = 16, gap = 10;
        for (let y = 0; y < H; y += dashH + gap) {
            ctx.fillRect((W / 2) - 2, y, 4, dashH);
        }

        // Draw paddles
        ctx.fillStyle = colors.left;
        ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.fillStyle = colors.right;
        ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball
        ctx.fillStyle = colors.ball;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Optional: glow
        ctx.save();
        ctx.shadowColor = colors.ball;
        ctx.shadowBlur = 18;
        ctx.fillStyle = colors.ball;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Initial render
    draw();
})();