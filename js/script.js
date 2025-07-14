import { words as INITIAL_WORDS } from './data.js';

const $time = document.querySelector('#time');
const $paragraph = document.querySelector('p');
const $input = document.querySelector('#input');
const $ppm = document.querySelector('#results-wpm');

const $game = document.querySelector('#game');
const $results = document.querySelector('#results');
const $exactitud = $results.querySelector('#results-exactitud');
const $button = document.querySelector('#reload-button');

const INITIAL_TIME = 30;

let words = [];
let currentTime = INITIAL_TIME;
let intervalId;

initGame();
initEvents();

function initGame() {
  clearInterval(intervalId);
  $game.style.display = 'flex';
  $results.style.display = 'none';
  $input.value = '';
  $input.focus();

  words = INITIAL_WORDS.sort(() => Math.random() - 0.5).slice(0, 10);

  currentTime = INITIAL_TIME;
  $time.textContent = currentTime;

  $paragraph.innerHTML = words.map(word => {
    const letters = word.split('');
    return `<span class="word">
      ${letters.map(letter => `<span class="letter">${letter}</span>`).join('')}
    </span>`;
  }).join(' ');

  const $firstWord = $paragraph.querySelector('.word');
  $firstWord.classList.add('active');
  $firstWord.querySelector('.letter').classList.add('active');

  intervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 1000);
}

function initEvents() {
  document.addEventListener('keydown', () => $input.focus());
  $input.addEventListener('keydown', onKeyDown);
  $input.addEventListener('keyup', onKeyUp);
  $button.addEventListener('click', initGame);
}

function onKeyDown(event) {
  const $currentWord = $paragraph.querySelector('.word.active');
  const $currentLetter = $currentWord.querySelector('.letter.active');
  const { key } = event;

  if (key === ' ') {
    event.preventDefault();

    const hasMissedLetters = $currentWord.querySelectorAll('.letter:not(.correct)').length > 0;

    $currentWord.classList.remove('active');
    $currentWord.classList.add(hasMissedLetters ? 'marked' : 'correct');

    const $nextWord = $currentWord.nextElementSibling;
    if ($nextWord) {
      $nextWord.classList.add('active');
      $nextWord.querySelector('.letter').classList.add('active');
      $input.value = '';
    }
    return;
  }

  if (key === 'Backspace') {
    const $prevLetter = $currentLetter.previousElementSibling;
    if ($prevLetter) {
      $currentLetter.classList.remove('active');
      $prevLetter.classList.add('active');
    }
  }
}

function onKeyUp() {
  const $currentWord = $paragraph.querySelector('.word.active');
  const $letters = $currentWord.querySelectorAll('.letter');

  const currentWordText = [...$letters].map($l => $l.textContent).join('');
  $input.maxLength = currentWordText.length;

  $letters.forEach($l => $l.classList.remove('correct', 'incorrect'));

  [...$input.value].forEach((char, index) => {
    const $letter = $letters[index];
    if (!$letter) return;

    if (char === $letter.textContent) {
      $letter.classList.add('correct');
    } else {
      $letter.classList.add('incorrect');
    }
  });

  $letters.forEach($l => $l.classList.remove('active'));
  const nextIndex = $input.value.length;
  const $nextLetter = $letters[nextIndex];

  if ($nextLetter) {
    $nextLetter.classList.add('active');
  } else {
    $letters[$letters.length - 1].classList.add('active', 'is-last');
  }
}

function gameOver() {
  $game.style.display = 'none';
  $results.style.display = 'flex';

  const correctWords = $paragraph.querySelectorAll('.word.correct').length;
  const correctLetter = $paragraph.querySelectorAll('.letter.correct').length;
  const incorrectLetter = $paragraph.querySelectorAll('.letter.incorrect').length;

  const totalLetters = correctLetter + incorrectLetter;
  const exactitud = totalLetters > 0 ? (correctLetter / totalLetters) * 100 : 0;

  const ppm = correctWords * (60 / INITIAL_TIME);
  $ppm.textContent = ppm.toFixed(2);
  $exactitud.textContent = `${exactitud.toFixed(2)}%`;
}

