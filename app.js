let boxes = [];
const x = 9;
const y = 9;
const numberOfMines = 10;
let numberOfFlags = numberOfMines;

const nums = {
    1: 'n1',
    2: 'n2',
    3: 'n3',
    4: 'n4',
    5: 'n5',
    6: 'n6',
    7: 'n7',
    8: 'n8',
};

let isGameStarted = false;
let timerInterval;

const genStruct = () => {
    for (let i = 0; i < y; i++) {
        boxes[i] = [];
        for (let j = 0; j < x; j++) {
            boxes[i][j] = {
                id: `${i}-${j}`,
                isOpened: false,
                isFlagged: false,
                content: '',
                isMine: false,
            };
        }
    }
};

const genBoxes = () => {
    const boxesContainer = document.querySelector('.boxes');
    boxesContainer.innerHTML = '';

    let content = '';

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            const box = boxes[i][j];
            const color = box.content ? nums[box.content] : '';

            content += `
                <div class="box ${box.isOpened ? '' : 'closed'} ${box.isFlagged && !box.isOpened ? 'flagged' : ''}" id="${box.id}" onclick="openBox('${box.id}')" oncontextmenu="flagBox(event, '${box.id}')">
                    <span class="${color}">${box.isMine ? '💣' : box.content}</span>
                </div>
            `;
        }
    }

    boxesContainer.innerHTML = content;
};

const genMines = () => {
    let poses = [];

    while (poses.length < numberOfMines) {
        const i = Math.floor(Math.random() * y);
        const j = Math.floor(Math.random() * x);
        const pos = `${i}-${j}`;

        if (!poses.includes(pos)) {
            poses.push(pos);
            boxes[i][j].isMine = true;
        }
    }
};

const setContent = () => {
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            const box = boxes[i][j];
            if (box.isMine) continue;

            let mineCount = 0;

            const poses = [
                [i - 1, j - 1], [i, j - 1], [i + 1, j - 1],
                [i - 1, j], [i + 1, j],
                [i - 1, j + 1], [i, j + 1], [i + 1, j + 1]
            ];

            for (const [xPos, yPos] of poses) {
                if (xPos >= 0 && xPos < y && yPos >= 0 && yPos < x && boxes[xPos][yPos].isMine) mineCount++;
            }

            box.content = mineCount > 0 ? mineCount : '';
        }
    }
};

const startTimer = () => {
    let seconds = 0;
    let minutes = 0;

    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        document.querySelector('#timer').textContent = `${formattedMinutes}:${formattedSeconds}`;
    }, 1000);
}

const showLogs = () => {
    const logs = (localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : []).reverse();
    const logsContainer = document.querySelector('#logs');
    logsContainer.innerHTML = '';

    let content = '';

    for (const log of logs) {
        content += `
            <li class="${log.status === 1 ? 'win' : 'lose'}">
                ${log.status === 1 ? 'Win' : 'Lose'} - ${log.numberOfMines} Mines - ${log.time} Mins
                <span>${log.date}</span>
            </li>
        `;
    }

    if (logs.length === 0) {
        content = '<p>There are no logs.</p>'
    }

    logsContainer.innerHTML = content;
}

const addLog = (status, time, numberOfMines) => {
    const logs = localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [];

    logs.push({
        status,
        time,
        numberOfMines,
        date: new Date().toLocaleString()
    });

    localStorage.setItem('logs', JSON.stringify(logs));
    showLogs();
}

const clearLogs = () => {
    if (confirm('Are you sure you want to clear the logs?')) {
        localStorage.removeItem('logs');
        showLogs();
    }
}

const setNumberOfFlags = () => {
    const noMines = document.querySelector('#mines-n');
    noMines.textContent = numberOfFlags < 10 ? `0${numberOfFlags}` : numberOfFlags;
};

const checkWinOrGameOver = (posX, posY, checkGameOver = true) => {
    if (boxes[posX][posY].isMine && checkGameOver) {
        alert('Game Over! You hit a mine!');
        addLog(0, document.querySelector('#timer').textContent, numberOfMines);
        resetGame();
        return;
    }

    let nF = 0;

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            const box = boxes[i][j];

            if (box.isMine && box.isFlagged && !box.isOpened) nF++;

            if (!box.isMine && !box.isOpened) return;
        }
    }

    if (nF == numberOfMines) {
        alert(`Congratulations! You won the game! in ${document.querySelector('#timer').textContent}`);
        addLog(1, document.querySelector('#timer').textContent, numberOfMines);
        resetGame();
        return;
    }
}

const openBox = (id) => {
    if (!isGameStarted) {
        isGameStarted = true;
        startTimer();
    }

    const posX = parseInt(id.split('-')[0]);
    const posY = parseInt(id.split('-')[1]);

    boxes[posX][posY].isOpened = true;

    if (boxes[posX][posY].isFlagged) numberOfFlags++;
    setNumberOfFlags();

    boxes[posX][posY].isFlagged = false;

    genBoxes();
    setTimeout(() => checkWinOrGameOver(posX, posY), 150);
};

const flagBox = (e, id) => {
    e.preventDefault();

    const posX = parseInt(id.split('-')[0]);
    const posY = parseInt(id.split('-')[1]);

    if ((numberOfFlags <= 0 && !boxes[posX][posY].isFlagged) || boxes[posX][posY].isOpened) return;

    boxes[posX][posY].isFlagged = !boxes[posX][posY].isFlagged;

    if (boxes[posX][posY].isFlagged) {
        numberOfFlags--;
    } else {
        numberOfFlags++;
    }

    setNumberOfFlags();
    genBoxes();
    setTimeout(() => checkWinOrGameOver(posX, posY, false), 150);
};

const resetGame = () => {
    clearInterval(timerInterval);
    isGameStarted = false;
    numberOfFlags = numberOfMines;
    document.querySelector('#timer').textContent = '00:00';
    main();
};

const main = () => {
    setNumberOfFlags();
    showLogs();

    genStruct();
    genMines();
    setContent();
    genBoxes();
};

main();