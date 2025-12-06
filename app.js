// DOM Elements
const card1Elem = document.getElementById('card1');
const card2Elem = document.getElementById('card2');
const resultMessageElem = document.getElementById('result-message');
const correctAnswerElem = document.getElementById('correct-answer');
const nextButton = document.getElementById('next-button');
const actionsContainer = document.querySelector('.action-grid');
const actionButtons = document.querySelectorAll('.action-grid button');
const chartContainer = document.getElementById('chart-container');

// --- Game Data and State ---
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['s', 'h', 'd', 'c'];

const handStrengthMatrix = [
    //A    K    Q    J    T    9    8    7    6    5    4    3    2
    ['A', 'A', 'B', 'B', 'B', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'], // A
    ['A', 'A', 'B', 'C', 'D', 'D', 'F', 'F', 'F', 'F', 'F', 'F', 'F'], // K
    ['B', 'C', 'A', 'C', 'D', 'E', 'F', 'F', 'F', 'G', 'G', 'G', 'G'], // Q
    ['C', 'D', 'E', 'B', 'C', 'E', 'F', 'F', 'G', 'H', 'H', 'H', 'H'], // J
    ['D', 'E', 'F', 'E', 'B', 'F', 'E', 'G', 'H', 'H', 'H', 'H', 'I'], // T
    ['E', 'F', 'F', 'F', 'F', 'B', 'E', 'F', 'G', 'H', 'I', 'I', 'I'], // 9
    ['F', 'H', 'H', 'H', 'H', 'G', 'C', 'F', 'G', 'H', 'I', 'I', 'I'], // 8
    ['F', 'H', 'H', 'I', 'I', 'H', 'H', 'C', 'F', 'G', 'H', 'I', 'I'], // 7
    ['G', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'D', 'F', 'G', 'H', 'I'], // 6
    ['H', 'H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'D', 'G', 'H', 'I'], // 5
    ['H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'E', 'H', 'I'], // 4
    ['H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'E', 'I'], // 3
    ['H', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'E']  // 2
];

let deck = [];
let currentQuestion = {};

// --- Core Functions ---

function getHandKey(hand) {
    const card1 = { rank: hand[0].slice(0, -1), suit: hand[0].slice(-1) };
    const card2 = { rank: hand[1].slice(0, -1), suit: hand[1].slice(-1) };
    const rank1Index = RANKS.indexOf(card1.rank);
    const rank2Index = RANKS.indexOf(card2.rank);
    const [r1, r2] = rank1Index < rank2Index ? [card1, card2] : [card2, card1];
    if (r1.rank === r2.rank) return `${r1.rank}${r2.rank}`;
    else if (r1.suit === r2.suit) return `${r1.rank}${r2.rank}s`;
    else return `${r1.rank}${r2.rank}o`;
}

function renderHandRangeChart() {
    chartContainer.innerHTML = ''; // Clear previous chart
    const chartGrid = document.createElement('div');
    chartGrid.id = 'hand-range-chart';

    // Add headers (top row)
    chartGrid.appendChild(document.createElement('div')); // Top-left empty cell
    for (const rank of RANKS) {
        const headerCell = document.createElement('div');
        headerCell.classList.add('chart-cell', 'chart-header');
        headerCell.textContent = rank;
        chartGrid.appendChild(headerCell);
    }

    // Add main grid with side headers
    for (let i = 0; i < RANKS.length; i++) {
        // Side header
        const headerCell = document.createElement('div');
        headerCell.classList.add('chart-cell', 'chart-header');
        headerCell.textContent = RANKS[i];
        chartGrid.appendChild(headerCell);

        for (let j = 0; j < RANKS.length; j++) {
            const cell = document.createElement('div');
            const rank = handStrengthMatrix[i][j];
            cell.classList.add('chart-cell', `rank-${rank.toLowerCase()}`);
            
            let handName;
            if (i === j) { // Pairs
                handName = RANKS[i] + RANKS[j];
            } else if (i < j) { // Suited
                handName = RANKS[i] + RANKS[j] + 's';
            } else { // Offsuit
                handName = RANKS[j] + RANKS[i] + 'o';
            }
            cell.textContent = handName;
            chartGrid.appendChild(cell);
        }
    }
    chartContainer.appendChild(chartGrid);
}

function getSuitSymbol(suit) {
    const symbols = { s: '♠', h: '♥', d: '♦', c: '♣' };
    return symbols[suit] || '';
}

function generateAndShowQuestion() {
    // Reset UI
    chartContainer.style.display = 'none';
    resultMessageElem.textContent = '';
    correctAnswerElem.textContent = '';
    nextButton.style.display = 'none';

    actionButtons.forEach(button => {
        button.classList.remove('selected-button');
        button.disabled = false;
    });

    // Generate question
    deck = [];
    for (const rank of RANKS) {
        for (const suit of SUITS) {
            deck.push(rank + suit);
        }
    }

    let card1 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    let card2 = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    const rank1Value = RANKS.indexOf(card1.slice(0, -1));
    const rank2Value = RANKS.indexOf(card2.slice(0, -1));
    if (rank2Value < rank1Value) {
        [card1, card2] = [card2, card1];
    }

    const hand = [card1, card2];
    const handKey = getHandKey(hand);

    const card1Rank = hand[0].slice(0, -1), card2Rank = hand[1].slice(0, -1);
    const card1Suit = hand[0].slice(-1), card2Suit = hand[1].slice(-1);
    const index1 = RANKS.indexOf(card1Rank), index2 = RANKS.indexOf(card2Rank);
    
    let correctAnswer;
    if (index1 === index2) correctAnswer = handStrengthMatrix[index1][index2];
    else if (card1Suit === card2Suit) correctAnswer = handStrengthMatrix[Math.min(index1, index2)][Math.max(index1, index2)];
    else correctAnswer = handStrengthMatrix[Math.max(index1, index2)][Math.min(index1, index2)];

    currentQuestion = { hand, handKey, correctAnswer };

    const suit1Symbol = getSuitSymbol(card1Suit);
    const suit2Symbol = getSuitSymbol(card2Suit);

    card1Elem.innerHTML = `<span class="suit-${card1Suit}">${card1Rank}</span><span class="suit-${card1Suit}">${suit1Symbol}</span>`;
    card2Elem.innerHTML = `<span class="suit-${card2Suit}">${card2Rank}</span><span class="suit-${card2Suit}">${suit2Symbol}</span>`;
}

function checkAnswer(userChoice, clickedButton) {
    const { correctAnswer, handKey } = currentQuestion;
    const isCorrect = userChoice === correctAnswer;

    clickedButton.classList.add('selected-button');

    resultMessageElem.textContent = isCorrect ? '正解！' : '不正解';
    resultMessageElem.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
    if (!isCorrect) {
        correctAnswerElem.textContent = `正解はランク「${correctAnswer}」でした。(ハンド: ${handKey})`;
        renderHandRangeChart();
        chartContainer.style.display = 'block';
    }

    actionButtons.forEach(button => button.disabled = true);
    nextButton.style.display = 'block';
}

// --- Event Listeners ---
actionButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const choice = event.target.textContent;
        checkAnswer(choice, event.target);
    });
});
nextButton.addEventListener('click', generateAndShowQuestion);

// --- Initial Load ---
generateAndShowQuestion();