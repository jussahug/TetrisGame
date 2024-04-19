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
let frame = 60;


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


// Dùng vòng lặp trò chơi để vẽ trường chơi và tetromino
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    // Vẽ trường chơi
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                // vẽ 1 px nhỏ hơn gạch tạo một hiệu ứng
                context.fillRect(col * grid, row * grid, grid-1, grid-1);
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
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
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

// start the game
rAF = requestAnimationFrame(loop);