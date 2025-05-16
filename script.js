const board = document.getElementById('board');
const diceResult = document.getElementById('dice-result');
const rollBtn = document.getElementById('roll-btn');
const turnInfo = document.getElementById('turn-info');

const questionModal = document.getElementById('question-modal');
const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');

const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const restartBtn = document.getElementById('restart-btn');

const rows = 10;
const cols = 10;
const totalCells = rows * cols;

// Buat papan 100 kotak
let cells = [];

function createBoard() {
    board.innerHTML = '';
    // Kotak nomor 1 sampai 100 dengan pola zigzag
    for (let row = rows - 1; row >= 0; row--) {
        let rowCells = [];
        for (let col = 0; col < cols; col++) {
            let cellNum;
            if (row % 2 === 0) {
                cellNum = row * cols + col + 1;
            } else {
                cellNum = row * cols + (cols - col);
            }
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cell = cellNum;
            cell.innerText = cellNum;
            board.appendChild(cell);
            rowCells.push(cell);
        }
        cells.push(rowCells);
    }
}
createBoard();

// Posisi ular dan tangga (key = start posisi, value = posisi tujuan)
const snakes = {
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    99: 78
};

const ladders = {
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91
};

// Tampilkan ular dan tangga di papan (bisa ditambah dengan gambar/warna)
function markSnakesAndLadders() {
    for (const start in snakes) {
        let cell = getCellElement(parseInt(start));
        if(cell) {
            cell.style.backgroundColor = '#f8d7da'; // merah muda untuk ular
        }
    }
    for (const start in ladders) {
        let cell = getCellElement(parseInt(start));
        if(cell) {
            cell.style.backgroundColor = '#d4edda'; // hijau muda untuk tangga
        }
    }
}
markSnakesAndLadders();

function getCellElement(position) {
    // Dapatkan elemen cell berdasarkan posisi 1-100
    // Karena cells disusun per baris dan kolom
    const row = Math.floor((position - 1) / cols);
    const colInRow = (row % 2 === 0) ? (position - 1) % cols : cols - 1 - ((position - 1) % cols);
    const invertedRow = rows - 1 - row;
    return cells[invertedRow][colInRow];
}

// Pion pemain (lingkaran merah dan kuning)
const pawn1 = document.createElement('div');
pawn1.id = 'pawn1';
pawn1.classList.add('pawn');
board.appendChild(pawn1);

const pawn2 = document.createElement('div');
pawn2.id = 'pawn2';
pawn2.classList.add('pawn');
board.appendChild(pawn2);

// Posisi awal pemain (mulai di 1)
let playerPositions = [1, 1];

// Giliran pemain (0 = pemain1, 1 = pemain2)
let currentPlayer = 0;
let isRolling = false;

// Pertanyaan pilihan ganda
const questions = [
    {
        question: "Apa ibu kota Indonesia?",
        options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
        answer: 0
    },
    {
        question: "Pahlawan nasional yang dijuluki 'Bapak Proklamator' adalah?",
        options: ["Sukarno", "Mohammad Hatta", "Sutan Sjahrir", "Ki Hajar Dewantara"],
        answer: 0
    },
    {
        question: "Gunung tertinggi di Indonesia adalah?",
        options: ["Gunung Bromo", "Gunung Rinjani", "Puncak Jaya", "Gunung Merapi"],
        answer: 2
    },
    {
        question: "Hari Kemerdekaan Indonesia jatuh pada tanggal?",
        options: ["17 Agustus", "1 Juni", "20 Mei", "28 Oktober"],
        answer: 0
    },
    {
        question: "Bahasa resmi Indonesia adalah?",
        options: ["Jawa", "Sunda", "Indonesia", "Melayu"],
        answer: 2
    },
    {
        question: "Lambang negara Indonesia adalah?",
        options: ["Garuda Pancasila", "Burung Merpati", "Macan", "Badak"],
        answer: 0
    },
    {
        question: "Pulau terbesar di Indonesia adalah?",
        options: ["Sumatera", "Kalimantan", "Jawa", "Sulawesi"],
        answer: 1
    },
    {
        question: "Sungai terpanjang di Indonesia adalah?",
        options: ["Sungai Kapuas", "Sungai Musi", "Sungai Barito", "Sungai Mahakam"],
        answer: 0
    },
    {
        question: "Lagu kebangsaan Indonesia berjudul?",
        options: ["Indonesia Raya", "Tanah Airku", "Garuda Pancasila", "Rayuan Pulau Kelapa"],
        answer: 0
    },
    {
        question: "Presiden Indonesia pertama adalah?",
        options: ["Soeharto", "BJ Habibie", "Sukarno", "Megawati"],
        answer: 2
    }
];

// Titik-titik pertanyaan (10 titik acak berbeda di board selain 1 dan 100)
const questionPoints = [5, 12, 23, 37, 42, 56, 68, 74, 88, 97];

// Fungsi tampilkan pion di posisi sesuai
function updatePawnPosition(player) {
    const pos = playerPositions[player];
    const cell = getCellElement(pos);
    if (!cell) return;
    const pawn = player === 0 ? pawn1 : pawn2;

    // Position pion relatif terhadap cell
    const rect = cell.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

    // Koordinat relatif board
    const x = cell.offsetLeft;
    const y = cell.offsetTop;

    // Karena pion posisi absolute di dalam board
    // Untuk menghindari tumpang tindih, posisikan pion1 di kiri atas cell, pion2 kanan atas
    if (player === 0) {
        pawn.style.left = (x + 5) + 'px';
        pawn.style.top = (y + 5) + 'px';
    } else {
        pawn.style.left = (x + 30) + 'px';
        pawn.style.top = (y + 5) + 'px';
    }
}

// Animasi pindah pion dengan delay
async function movePawn(player, steps) {
    for(let i = 0; i < steps; i++) {
        if (playerPositions[player] < 100) {
            playerPositions[player]++;
            updatePawnPosition(player);
            await sleep(300);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkSnakesAndLadders(player) {
    let pos = playerPositions[player];
    if (snakes[pos]) {
        playerPositions[player] = snakes[pos];
        alert(`Pemain ${player+1} terkena ular! Mundur ke ${snakes[pos]}`);
    } else if (ladders[pos]) {
        playerPositions[player] = ladders[pos];
        alert(`Pemain ${player+1} naik tangga! Maju ke ${ladders[pos]}`);
    }
    updatePawnPosition(player);
}

// Tampilkan pertanyaan secara acak dari list pertanyaan
function showQuestion(player) {
    return new Promise(resolve => {
        questionModal.classList.remove('hidden');
        turnInfo.textContent = '';

        // Pilih pertanyaan acak
        const qIndex = Math.floor(Math.random() * questions.length);
        const q = questions[qIndex];

        questionText.textContent = q.question;

        optionsDiv.innerHTML = '';
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.classList.add('option-btn');
            btn.onclick = () => {
                questionModal.classList.add('hidden');
                if(i === q.answer) {
                    alert('Jawaban benar!');
                    resolve(true);
                } else {
                    alert('Jawaban salah! Mundur 3 langkah.');
                    resolve(false);
                }
            };
            optionsDiv.appendChild(btn);
        });
    });
}

// Cek apakah posisi pemain ada di titik pertanyaan
function isQuestionPoint(pos) {
    return questionPoints.includes(pos);
}

// Cek jika ada pemenang
function checkWinner() {
    for(let i=0; i<2; i++) {
        if(playerPositions[i] >= 100) {
            return i;
        }
    }
    return -1;
}

async function playerTurn() {
    if (isRolling) return;
    isRolling = true;

    diceResult.textContent = 'Lempar Dadu...';
    const roll = Math.floor(Math.random() * 6) + 1;
    diceResult.textContent = `Hasil Dadu: ${roll}`;

    await movePawn(currentPlayer, roll);

    // Cek ular dan tangga
    checkSnakesAndLadders(currentPlayer);

    // Cek titik pertanyaan
    if(isQuestionPoint(playerPositions[currentPlayer])) {
        const correct = await showQuestion(currentPlayer);
        if (!correct) {
            // Mundur 3 langkah, tapi tidak kurang dari 1
            playerPositions[currentPlayer] = Math.max(1, playerPositions[currentPlayer] - 3);
            updatePawnPosition(currentPlayer);
        }
    }

    // Cek pemenang
    const winner = checkWinner();
    if (winner !== -1) {
        winnerText.textContent = `Pemain ${winner + 1} Menang! 🎉`;
        winnerModal.classList.remove('hidden');
        rollBtn.disabled = true;
        turnInfo.textContent = '';
        isRolling = false;
        return;
    }

    // Ganti giliran
    currentPlayer = (currentPlayer + 1) % 2;
    turnInfo.textContent = `Giliran Pemain ${currentPlayer + 1} (${currentPlayer === 0 ? 'Merah' : 'Kuning'})`;
    isRolling = false;
}

// Event tombol lempar dadu
rollBtn.addEventListener('click', playerTurn);

// Event tombol restart
restartBtn.addEventListener('click', () => {
    playerPositions = [1, 1];
    currentPlayer = 0;
    updatePawnPosition(0);
    updatePawnPosition(1);
    diceResult.textContent = 'Lempar Dadu: -';
    turnInfo.textContent = `Giliran Pemain 1 (Merah)`;
    winnerModal.classList.add('hidden');
    rollBtn.disabled = false;
});

// Init posisi pion
updatePawnPosition(0);
updatePawnPosition(1);
turnInfo.textContent = `Giliran Pemain 1 (Merah)`;
