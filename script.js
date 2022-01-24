const menuBlock = document.getElementById('menu');
const playGameBlock = document.getElementById('play');
const endGameBlock = document.getElementById('end');
const gameRulesBlock = document.getElementById('rules');
const gameSettingsBlock = document.getElementById('settings');

const goToRulesButton = document.getElementById('rules-button');
const goBackFromRules = document.getElementById('rules-back-button');

const goToSettingsButton = document.getElementById('settings-button');
const goBackFromSettings = document.getElementById('settings-back-button');
const digitsSettings = document.getElementById('digits');
const digitsControls = document.getElementById('digits-arrows');
const difficultySettings = document.getElementById('difficulty');
const difficultyControls = document.getElementById('difficulty-arrows');
const difficultyDescription = document.getElementById('level-description');
const resetSettingsButton = document.getElementById('reset-settings');

const startGameButton = document.getElementById('start-button');
const checkAnswerButton = document.getElementById('check-answer-button');
const giveUpButton = document.getElementById('give-up-button');

const playAgainButton = document.getElementById('play-again-button');
const goBackToMenuButton = document.getElementById('back-to-menu-button');

const inputNumber = document.getElementById('player-input');
const inputErrorMessage = document.getElementById('error-message');
const previousTriesTable = document.getElementById('previous-tries-table');
const hintsBlock = document.getElementById('hints');
const hintsContentBlock = document.getElementById('hints-content');

const endGameText = document.getElementById('end-game-text');
const triesTable = document.getElementById('tries-table');
const gameData = document.getElementById('game-data');

const STATUSES = {
  notInGame: 'not-in-game',
  inGame: 'in-game',
  won: 'won',
  lost: 'lost',
  gaveUp: 'gave-up',
};

const difficultyLevels = {
  levels: ['Легкий', 'Средний', 'Сложный'],
  descriptions: [
    'Есть подсказки, количество ходов не ограничено',
    'Нет подсказок, количество ходов не ограничено',
    'Нет подсказок, количество ходов ограничено',
  ],
};

const DEFAULT_NUMBER_OF_DIGITS = 4;

const possibleDigits = [];

const gameState = {
  numberOfDigits: DEFAULT_NUMBER_OF_DIGITS,
  difficulty: difficultyLevels.levels[1],
  numberToGuess: [],
  maxNumberOfTries: Infinity,
  numberOfTriesUsed: 0,
  status: STATUSES.notInGame,
};

/*************** SCREENS **************/

function loadScreen(blockToLoad) {
  menuBlock.classList.add('hidden');
  playGameBlock.classList.add('hidden');
  endGameBlock.classList.add('hidden');
  gameRulesBlock.classList.add('hidden');
  gameSettingsBlock.classList.add('hidden');

  blockToLoad.classList.remove('hidden');
}

/************** GAME FUNCTIONS ***************/

function generateNumber(numberOfDigits) {
  const number = [];
  let digit;

  number.push(Math.floor(Math.random() * 9) + 1);

  while (number.length !== numberOfDigits) {
    digit = Math.floor(Math.random() * 10);
    if (!number.includes(digit)) {
      number.push(digit);
    }
  }

  return number;
}

function isInputNumberCorrect(numberString) {
  const regex = new RegExp(`^\\d{${gameState.numberOfDigits}}$`);

  if (numberString.match(regex) === null) {
    inputErrorMessage.innerText = 'Введено некорректное число';
    return false;
  }
  const digitsSet = new Set(numberString.split(''));

  if (digitsSet.size !== numberString.length) {
    inputErrorMessage.innerText = 'Введено некорректное число';
    return false;
  }
  return true;
}

function compareNumbers(numberToGuess, inputNumber) {
  const bullsAndCows = [0, 0];

  for (let i = 0; i < numberToGuess.length; i++) {
    if (inputNumber[i] === numberToGuess[i]) {
      bullsAndCows[0] += 1;
      continue;
    }

    if (numberToGuess.includes(inputNumber[i])) {
      bullsAndCows[1] += 1;
    }
  }

  return bullsAndCows;
}

function updatePossibleDigits(bulls, cows, playerInputNumber) {
  let digitIndex;
  if (bulls === 0) {
    for (let i = 0; i < gameState.numberOfDigits; i++) {
      digitIndex = possibleDigits[i].indexOf(+playerInputNumber[i]);
      if (digitIndex !== -1) {
        possibleDigits[i].splice(digitIndex, 1);
      }
    }
  }

  if (cows === 0) {
    for (let i = 0; i < gameState.numberOfDigits; i++) {
      for (let j = 0; j < gameState.numberOfDigits; j++) {
        if (j !== i) {
          digitIndex = possibleDigits[j].indexOf(+playerInputNumber[i]);
          if (digitIndex !== -1) {
            possibleDigits[j].splice(digitIndex, 1);
          }
        }
      }
    }
  }

  if (bulls + cows === gameState.numberOfDigits) {
    for (let item of possibleDigits) {
      for (let i = 0; i < gameState.numberOfDigits; i++) {
        digitIndex = item.indexOf(+playerInputNumber[i]);
        if (digitIndex === -1) {
          item.splice(digitIndex, 1);
        }
      }
    }
  }
}

function addLineToPreviousTriesTable(infoToAdd) {
  const newTableLine = document.createElement('li');
  newTableLine.classList.add('ingame-output__line');

  previousTriesTable.appendChild(newTableLine);

  for (let i = 0; i < infoToAdd.length; i++) {
    const newTableCell = document.createElement('p');
    newTableCell.classList.add('ingame-output__cell');
    newTableCell.innerText = infoToAdd[i];
    newTableLine.appendChild(newTableCell);
  }
}

function startGame() {
  const start = Date.now();

  gameState.status = STATUSES.inGame;
  gameState.numberToGuess = generateNumber(gameState.numberOfDigits);

  addLineToPreviousTriesTable(['Ход', 'Число', 'Быки', 'Коровы']);

  possibleDigits[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 1; i < gameState.numberOfDigits; i++) {
    possibleDigits[i] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }

  if (gameState.difficulty === difficultyLevels.levels[0]) {
    fillHints();
    hintsBlock.style.display = 'block';
  }

  console.log('game started = ' + (Date.now() - start));
}

function guess() {
  const start = Date.now();

  const playerInputNumber = inputNumber.value;
  if (!isInputNumberCorrect(playerInputNumber)) {
    return;
  }

  const bullsAndCows = compareNumbers(
    gameState.numberToGuess,
    playerInputNumber.split('').map(Number)
  );
  gameState.numberOfTriesUsed += 1;

  updatePossibleDigits(bullsAndCows[0], bullsAndCows[1], playerInputNumber);

  addLineToPreviousTriesTable([
    gameState.numberOfTriesUsed,
    playerInputNumber,
    bullsAndCows[0],
    bullsAndCows[1],
  ]);

  console.log('guessed = ' + (Date.now() - start));

  if (bullsAndCows[0] === gameState.numberOfDigits) {
    gameState.status = STATUSES.won;
    endGame();
    return;
  }

  if (gameState.numberOfTriesUsed === gameState.maxNumberOfTries) {
    gameState.status = STATUSES.lost;
    endGame();
    return;
  }

  if (gameState.difficulty === difficultyLevels.levels[0]) {
    hintsContentBlock.innerHTML = '';
    fillHints();
  }
}

function endGame() {
  triesTable.innerHTML = previousTriesTable.innerHTML;
  if (gameState.numberOfTriesUsed === 0) {
    gameData.style.display = 'none';
  } else {
    gameData.style.display = 'block';
  }

  switch (gameState.status) {
    case STATUSES.won:
      showWinMessage();
      break;
    case STATUSES.lost:
      showLoseMessage();
      break;
    case STATUSES.gaveUp:
      showGiveUpMessage();
      break;
  }
  loadScreen(endGameBlock);
}

function fillHints() {
  for (let i = 0; i < gameState.numberOfDigits; i++) {
    const line = document.createElement('p');
    line.classList.add('text');
    line.innerText = `${i + 1}: ${possibleDigits[i].join(', ')}`;
    hintsContentBlock.appendChild(line);
  }
}

function showWinMessage() {
  const congratsBlock = document.createElement('p');
  congratsBlock.innerText = 'Поздравляем! Вы победили!';

  const gameInfoBlock = document.createElement('p');
  gameInfoBlock.innerText = `Было загадано число ${gameState.numberToGuess.join('')}`;

  const resultInfoBlock = document.createElement('p');

  let wordEnd = '';
  if (
    (gameState.numberOfTriesUsed >= 5 && gameState.numberOfTriesUsed < 20) ||
    (gameState.numberOfTriesUsed - 1) % 10 >= 4
  ) {
    wordEnd = 'ов';
  } else if (gameState.numberOfTriesUsed % 10 !== 1) {
    wordEnd = 'a';
  }

  resultInfoBlock.innerText = `Вы угадали его за ${gameState.numberOfTriesUsed} ход${wordEnd}`;

  endGameText.appendChild(congratsBlock);
  endGameText.appendChild(gameInfoBlock);
  endGameText.appendChild(resultInfoBlock);
}

function showLoseMessage() {
  const youLostBlock = document.createElement('p');
  youLostBlock.innerText = 'Вы проиграли :(';

  const gameInfoBlock = document.createElement('p');
  gameInfoBlock.innerText = `Было загадано число ${gameState.numberToGuess.join('')}`;

  endGameText.appendChild(youLostBlock);
  endGameText.appendChild(gameInfoBlock);
}

function showGiveUpMessage() {
  const gameInfoBlock = document.createElement('p');
  gameInfoBlock.innerText = `Было загадано число ${gameState.numberToGuess.join('')}`;

  endGameText.appendChild(gameInfoBlock);
}

function clearLastGameData() {
  gameState.status = STATUSES.notInGame;
  gameState.numberToGuess = [];
  gameState.numberOfTriesUsed = 0;

  endGameText.textContent = '';
  inputNumber.value = '';
  inputErrorMessage.innerText = '';
  hintsContentBlock.textContent = '';
  hintsBlock.style.display = 'none';
  previousTriesTable.textContent = '';
  triesTable.textContent = '';

  for (item of possibleDigits) {
    item = [];
  }
}

/*************** LISTENERS **************/
/********** SETTINGS ************/

goToRulesButton.addEventListener('click', () => {
  loadScreen(gameRulesBlock);
});

goBackFromRules.addEventListener('click', () => {
  loadScreen(menuBlock);
});

goToSettingsButton.addEventListener('click', () => {
  loadScreen(gameSettingsBlock);
});

goBackFromSettings.addEventListener('click', () => {
  if (gameState.difficulty === difficultyLevels.levels[2]) {
    gameState.maxNumberOfTries = 4 + gameState.numberOfDigits;
  } else {
    gameState.maxNumberOfTries = Infinity;
  }
  loadScreen(menuBlock);
});

digitsControls.addEventListener('click', (event) => {
  const targetId = event.target.id;
  if (!targetId || targetId === digitsControls.id) {
    return;
  }

  if (targetId === 'digits-up') {
    if (digitsSettings.innerText < '5') {
      digitsSettings.innerText = +digitsSettings.innerText + 1;
    }
  }

  if (targetId === 'digits-down') {
    if (digitsSettings.innerText > '2') {
      digitsSettings.innerText = +digitsSettings.innerText - 1;
    }
  }

  gameState.numberOfDigits = +digitsSettings.innerText;
});

difficultyControls.addEventListener('click', (event) => {
  const targetId = event.target.id;
  if (!targetId || targetId === difficultyControls.id) {
    return;
  }

  let itemNumber;
  for (itemNumber in difficultyLevels.levels) {
    if (difficultySettings.innerText === difficultyLevels.levels[itemNumber]) {
      break;
    }
  }
  itemNumber = +itemNumber;

  if (targetId === 'difficulty-up' && itemNumber < difficultyLevels.levels.length - 1) {
    itemNumber += 1;
  }

  if (targetId === 'difficulty-down' && itemNumber > 0) {
    itemNumber -= 1;
  }

  difficultySettings.innerText = difficultyLevels.levels[itemNumber];
  difficultyDescription.innerText = difficultyLevels.descriptions[itemNumber];

  gameState.difficulty = difficultySettings.innerText;
});

resetSettingsButton.addEventListener('click', () => {
  gameState.numberOfDigits = DEFAULT_NUMBER_OF_DIGITS;
  digitsSettings.innerText = DEFAULT_NUMBER_OF_DIGITS;

  gameState.difficulty = difficultyLevels.levels[1];
  difficultySettings.innerText = difficultyLevels.levels[1];
  difficultyDescription.innerText = difficultyLevels.descriptions[1];

  gameState.maxNumberOfTries = Infinity;
});

/********** INGAME ************/

startGameButton.addEventListener('click', () => {
  startGame();
  loadScreen(playGameBlock);
});

inputNumber.addEventListener('click', () => {
  inputErrorMessage.innerText = '';
  inputNumber.value = '';
});

checkAnswerButton.addEventListener('click', () => {
  guess();
});

giveUpButton.addEventListener('click', () => {
  gameState.status = STATUSES.gaveUp;
  endGame();
  loadScreen(endGameBlock);
});

/********** AFTER ************/

goBackToMenuButton.addEventListener('click', () => {
  gameState.status = STATUSES.notInGame;
  loadScreen(menuBlock);
  clearLastGameData();
});

playAgainButton.addEventListener('click', () => {
  clearLastGameData();
  loadScreen(playGameBlock);
  startGame();
});
