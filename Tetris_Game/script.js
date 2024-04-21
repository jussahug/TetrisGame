// Hàm sinh số ngẫu nhiên trong khoảng từ min đến max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tạo ra một chuỗi mới của các tetromino theo thứ tự ngẫu nhiên

function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// Hàm lấy tetromino tiếp theo từ chuỗi đã tạo
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    // I và O bắt đầu ở giữa, còn lại ở bên trái xíu
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // I bắt đầu ở dòng 21 (-1), còn lại ở dòng 22 (-2)
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,//
        matrix: matrix,
        row: row,
        col: col
    };
}

// Hàm quay ma trận 90 độ
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );

    return result;
}

// Hàm kiểm tra xem việc di chuyển có hợp lệ không
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                // outside the game bounds
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                // collides with another piece
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }

    return true;
}


let score = 0;
let fallingTetromino = null;

// Hàm đặt tetromino vào trường chơi và xử lý khi tetromino chạm đáy hoặc chạm vào tetromino khác
function placeTetromino() {
    let linesCleared = 0;// đếm số dòng đã xóa
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

                if (tetromino.row + row < 0) {
                    return showGameOver();
                }

                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }
    fallingTetromino = tetromino;
    //Kiểm tra xóa dòng bắt đầu từ dưới cùng và làm từ phía dưới
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {
            linesCleared++;
            // thả mọi hàng phía trên xuống
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        }
        else {
            row--;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        console.log(score)
        drawScore();
    }
    tetromino = getNextTetromino();
    drawNextTetromino();
}

function drawScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score.toString()}`;
}


// Hàm hiển thị màn hình kết thúc game
function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;

    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
    // Vẽ nút "Restart"
    drawRestartButton();
}
let restartButtonArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};
function drawRestartButton() {
    // Vẽ nút
    context.fillStyle = 'white';
    context.fillRect(canvas.width / 2 - 50, canvas.height / 2 + 20, 100, 40);

    // Viết văn bản
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText('Restart', canvas.width / 2, canvas.height / 2 + 45);

    // Xác định vùng chứa nút
    restartButtonArea = {
        x: canvas.width / 2 - 50,
        y: canvas.height / 2 + 20,
        width: 100,
        height: 40
    };
}

function restartGame() {
    // Xóa màn hình kết thúc game và nút restart
    const overlay = document.getElementById('overlay');
    while (overlay.firstChild) {
        overlay.removeChild(overlay.firstChild);
    }

    // Reset điểm số
    score = 0;
    drawScore();

    // Reset trạng thái trò chơi
    gameOver = false;
    tetrominoSequence.length = 0;
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }

    // Bắt đầu lại vòng lặp trò chơi
    rAF = requestAnimationFrame(loop);
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];
const playfield = [];


// Tạo trường chơi trống
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}


const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;
let frame = 50;


const nextBlockCanvas = document.getElementById('nextBlockCanvas');
const nextBlockContext = nextBlockCanvas.getContext('2d');

function drawNextTetromino() {
    if (tetrominoSequence.length === 0) {
        return; // Nếu không có tetromino trong chuỗi, thoát khỏi hàm
    }
    const nextTetromino = tetrominoSequence[tetrominoSequence.length - 1];
    const nextMatrix = tetrominos[nextTetromino];
    const blockSize = 20; // Kích thước mỗi khối tetromino

    nextBlockContext.clearRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);
    const startX = (nextBlockCanvas.width - nextMatrix[0].length * blockSize) / 2;
    const startY = (nextBlockCanvas.height - nextMatrix.length * blockSize) / 2;

    // Vẽ tetromino tiếp theo
    for (let row = 0; row < nextMatrix.length; row++) {
        for (let col = 0; col < nextMatrix[row].length; col++) {
            if (nextMatrix[row][col]) {
                nextBlockContext.fillStyle = colors[nextTetromino];
                nextBlockContext.fillRect(startX + col * blockSize, startY + row * blockSize, blockSize - 1, blockSize - 1);
            }
        }
    }
}

let gameStarted = false;
function drawStartMessage() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.textAlign = 'center';
    context.fillText('Vui lòng nhấn nút W A S D hoặc', canvas.width / 2, canvas.height / 2 - 20);
    context.fillText('↑ ↓ ← → để bắt đầu chơi', canvas.width / 2, canvas.height / 2 + 20);
}


function clearStartMessage() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function changeLevel(){
    score = 0;
    gameOver = false;
    tetrominoSequence.length = 0;
    generateSequence();
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }
    fallingTetromino = null;
    gameStarted = false;
}

function startGameLevel1() {
    changeLevel()
}

function startGameLevel2() {
    changeLevel()
}

function startGameLevel3() {
    changeLevel()
}

function startGameLevel4() {
    changeLevel()
}

function startGameLevel5() {
    changeLevel()
}

function startGameLevel6() {
    changeLevel()
}

let gamePaused = false;
const pauseButton = document.getElementById('pauseButton');
function pauseGame() {
    if (!gamePaused) {
        cancelAnimationFrame(rAF);
        gamePaused = true;
    }
}

function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        loop();
    }
}

// Dùng vòng lặp trò chơi để vẽ trường chơi và tetromino
function loop() {
    rAF = requestAnimationFrame(loop);
    if (gamePaused) {
        return; // Dừng vòng lặp nếu trò chơi đã tạm dừng hoặc chưa bắt đầu
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameStarted) {
        drawStartMessage();
        return; // Dừng vòng lặp nếu trò chơi chưa bắt đầu
    } else {
        clearStartMessage();
    }

    // Vẽ trường chơi
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                // vẽ 1 px nhỏ hơn gạch tạo một hiệu ứng
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    // Vẽ tetromino hiện tại
    if (tetromino) {
        // tetromino rơi mỗi frame nhất định
        if (++count > frame) {
            tetromino.row++;
            count = 0;

            // Đặt gạch nếu nó chạy vào bất cứ thứ gì
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {

                    // vẽ 1 px nhỏ hơn gạch tạo một hiệu ứng
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
    // Vẽ tetromino tiếp theo
    drawNextTetromino();
}
// Lắng nghe sự kiện bàn phím để di chuyển tetromino
document.addEventListener('keydown', function(e) {
    if (gameOver) return;

    switch (e.which) {
        case 37: // mũi tên trái (qua trái)
        case 65: // phím a
            const leftCol = tetromino.col - 1;
            if (isValidMove(tetromino.matrix, tetromino.row, leftCol)) {
                tetromino.col = leftCol;
            }
            break;

        case 39: // mũi tên phải (qua phải)
        case 68: // phím d
            const rightCol = tetromino.col + 1;
            if (isValidMove(tetromino.matrix, tetromino.row, rightCol)) {
                tetromino.col = rightCol;
            }
            break;

        case 38: // mũi tên lên (xoay)
        case 87: // phím w
            const rotatedMatrix = rotate(tetromino.matrix);
            if (isValidMove(rotatedMatrix, tetromino.row, tetromino.col)) {
                tetromino.matrix = rotatedMatrix;
            }
            break;

        case 40: // mũi tên xuống
        case 83: // phím s
            const nextRow = tetromino.row + 1;
            if (isValidMove(tetromino.matrix, nextRow, tetromino.col)) {
                tetromino.row = nextRow;
            } else {
                placeTetromino();
            }
            break;

        default:
            break;
    }
});

// Thêm sự kiện click cho nút Restart
canvas.addEventListener('click', function(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Kiểm tra xem click có trong vùng của nút Restart không
    if (
        mouseX >= restartButtonArea.x &&
        mouseX <= restartButtonArea.x + restartButtonArea.width &&
        mouseY >= restartButtonArea.y &&
        mouseY <= restartButtonArea.y + restartButtonArea.height
    ) {
        restartGame();
    }
});

document.addEventListener('keydown', function(e) {
    if (!gameStarted) {
        gameStarted = true;
        clearStartMessage(); // Ẩn thông báo khi trò chơi bắt đầu
        // Bắt đầu vòng lặp trò chơi
        loop();
    } else {
        // Xử lý các phím di chuyển
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                break;
            case 'ArrowDown':
            case 's':
                break;
            case 'ArrowLeft':
            case 'a':
                break;
            case 'ArrowRight':
            case 'd':
                break;
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const levelSelect = document.getElementById('level');

    // Lắng nghe sự kiện khi người chơi thay đổi cấp độ
    levelSelect.addEventListener('change', function() {
        const selectedLevel = parseInt(levelSelect.value); // Lấy giá trị cấp độ đã chọn

        // Thực hiện hành động tương ứng với cấp độ đã chọn
        switch (selectedLevel) {
            case 1:
                startGameLevel1();
                break;
            case 2:
                startGameLevel2();
                break;
            case 3:
                startGameLevel3();
                break;
            case 4:
                startGameLevel4();
                break;
            case 5:
                startGameLevel5();
                break;
            case 6:
                startGameLevel6();
                break;
            default:
                break;
        }
    });
});
pauseButton.addEventListener('click', function() {
    if (gamePaused) {
        resumeGame(); // Nếu trò chơi đang tạm dừng, tiếp tục nó
        pauseButton.textContent = 'Tạm dừng';
    } else {
        pauseGame(); // Nếu trò chơi đang chạy, tạm dừng nó
        pauseButton.textContent = 'Tiếp tục';
    }
});

// start the game
rAF = requestAnimationFrame(loop);

//order
// Hàm mở pop-up
function openPopup() {
    document.getElementById("personalInfoPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// Hàm đóng pop-up
function closePopup() {
    document.getElementById("personalInfoPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}


