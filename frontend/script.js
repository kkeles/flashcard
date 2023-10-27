const cardsContainer = document.getElementById('cards-container');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const currentEl = document.getElementById('current');
const showBtn = document.getElementById('show');
const hideBtn = document.getElementById('hide');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const addCardBtn = document.getElementById('add-card');
const deleteBtn = document.getElementById('delete');
const addContainer = document.getElementById('add-container');

let currentActiveCard = 0;
const cardsEl = [];
let cardsData = []; // Declare it here and populate it after fetching

function createCards() {
  cardsData.forEach((data, index) => createCard(data, index));
}

function createCard(data, index) {
  const card = document.createElement('div');
  card.classList.add('card');

  if (index === 0) {
    card.classList.add('active');
  }

  card.innerHTML = `
    <div class="inner-card">
      <div class="inner-card-front">
        <p>${data.question}</p>
      </div>
      <div class="inner-card-back">
        <p>${data.answer}</p>
      </div>
    </div>
  `;

  card.addEventListener('click', () => card.classList.toggle('show-answer'));
  cardsEl.push(card);
  cardsContainer.appendChild(card);
  updateCurrentText();
}

function updateCurrentText() {
  currentEl.innerText = `${currentActiveCard + 1}/${cardsEl.length}`;
}

function getCardsData() {
  return fetch('http://localhost:3000/questions')
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .catch(error => {
      console.warn("Fetch error: " + error.message);
      return [];
    });
}

getCardsData().then(data => {
  cardsData = data;  // Populate cardsData with fetched data
  createCards();
});

function setCardsData(cards) {
  localStorage.setItem('cards', JSON.stringify(cards));
  cardsContainer.innerHTML = '';
  cardsEl.length = 0; // Reset the cardsEl array
  createCards(); // Recreate the cards based on updated cardsData
}


// Next button
nextBtn.addEventListener('click', () => {
  cardsEl[currentActiveCard].className = 'card left';

  currentActiveCard = currentActiveCard + 1;

  if (currentActiveCard > cardsEl.length - 1) {
    currentActiveCard = cardsEl.length - 1;
  }

  cardsEl[currentActiveCard].className = 'card active';

  updateCurrentText();
});

// Prev button
prevBtn.addEventListener('click', () => {
  cardsEl[currentActiveCard].className = 'card right';

  currentActiveCard = currentActiveCard - 1;

  if (currentActiveCard < 0) {
    currentActiveCard = 0;
  }

  cardsEl[currentActiveCard].className = 'card active';

  updateCurrentText();
});

// Show add container
showBtn.addEventListener('click', () => addContainer.classList.add('show'));
// Hide add container
hideBtn.addEventListener('click', () => addContainer.classList.remove('show'));

// Function to add new question to the backend
function addQuestionToBackend(newCard) {
  return fetch('http://localhost:3000/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCard),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

// Add new card
addCardBtn.addEventListener('click', () => {
  const question = questionEl.value;
  const answer = answerEl.value;

  if (question.trim() && answer.trim()) {
    const newCard = { question, answer };

    addQuestionToBackend(newCard)
      .then(() => {
        // Once the new question is successfully added, fetch the updated questions
        getCardsData().then(data => {
          cardsData = data;
          setCardsData(cardsData);
        });
      })
      .catch(error => console.error('Error adding question:', error));

    questionEl.value = '';
    answerEl.value = '';
    addContainer.classList.remove('show');
  }
});



// Delete current card button
deleteBtn.addEventListener('click', () => {
  if (cardsData.length > 0 && currentActiveCard < cardsData.length) {
    // Send DELETE request to server
    fetch(`http://localhost:3000/questions/${currentActiveCard}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.text();
    })
    .then(() => {
      // Remove the active card from the array and update UI
      cardsData.splice(currentActiveCard, 1);
      setCardsData(cardsData);
      cardsContainer.innerHTML = '';
      createCards();

      // Update currentActiveCard index if needed
      if (currentActiveCard >= cardsData.length) {
        currentActiveCard = Math.max(0, cardsData.length - 1);
      }
      updateCurrentText();
    })
    .catch(error => console.error('Error deleting question:', error));
  }
});

