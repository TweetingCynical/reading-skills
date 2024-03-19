const setsDropdown = (setsData) => {
  const setsElement = document.createElement("select");
  Array.from(setsData.sets).forEach((set) => {
    const option = document.createElement("option");
    option.value = set;
    option.textContent = set;
    setsElement.appendChild(option);
  });
  choices[0].appendChild(setsElement);
};

const createSpeedSounds = (speedsoundsData) => {
  Array.from(speedsoundsData).forEach((set) => {
    const cardParent = document.createElement("div");
    cardParent.className = `speed-sounds-set ${set.type} d-flex`;
    const cardHeader = document.createElement("h2");
    cardHeader.innerText = set.type;
    cardParent.appendChild(cardHeader);
    Array.from(set.sounds).forEach((sound) => {
      const card = document.createElement("div");
      card.id = sound;
      card.className =
        "card d-flex shadow m-2 p-2 rounded border border-dark border-2 sound-card";
      const cardSound = document.createElement("p");
      // Display oo instead of ooo for the look sound
      cardSound.textContent = sound === "ooo" ? sound.substring(0, 2) : sound;
      const cardImg = document.createElement("img");
      cardImg.src = `assets/images/${set.ref}/${sound}.png`;
      cardImg.className = "soundImg p-1 m-1";
      card.appendChild(cardSound);
      card.appendChild(cardImg);
      cardParent.appendChild(card);
    });
    speedSoundsSection[0].appendChild(cardParent);
  });
};

const createBooks = (booksData) => {
  const bookSection = document.createElement("section");
  bookSection.className =
    "card d-flex shadow m-2 p-2 rounded border border-dark border-2";
  Array.from(booksData).forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.className =
      "card d-flex shadow m-2 p-2 rounded border border-dark border-2";
    const bookTitle = document.createElement("h2");
    bookTitle.innerText = `${book.title} (${book.type} - ${book.book})`;
    const newRedWords = document.createElement("h3");
    newRedWords.innerText = "New Red Words:";
    const redWords = document.createElement("h3");
    redWords.innerText = "Red Words:";
    const greenWords = document.createElement("h3");
    greenWords.innerText = "Green Words:";
    bookCard.appendChild(bookTitle);

    // Conditionally append newRedWords
    if (book.new_red_words && book.new_red_words.length > 0) {
      const newRedWords = document.createElement("h3");
      newRedWords.innerText = "New Red Words:";
      bookCard.appendChild(newRedWords);
      const newRedWordsContainer = document.createElement("div");
      newRedWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.new_red_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card shadow m-2 p-2 rounded border border-danger border-2 red-word word-card";
        wordCard.innerText = word;
        newRedWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(newRedWordsContainer);
    }

    // Conditionally append redWords
    if (book.red_words && book.red_words.length > 0) {
      const redWords = document.createElement("h3");
      redWords.innerText = "Red Words:";
      bookCard.appendChild(redWords);
      const redWordsContainer = document.createElement("div");
      redWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.red_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card shadow m-2 p-2 rounded border border-danger border-2 red-word word-card";
        wordCard.innerText = word;
        redWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(redWordsContainer);
    }

    // Conditionally append greenWords
    if (book.green_words && book.green_words.length > 0) {
      const greenWords = document.createElement("h3");
      greenWords.innerText = "Green Words:";
      bookCard.appendChild(greenWords);
      const greenWordsContainer = document.createElement("div");
      greenWordsContainer.className = "d-flex flex-wrap";
      Array.from(book.green_words).forEach((word) => {
        const wordCard = document.createElement("h4");
        wordCard.className =
          "card d-flex shadow m-2 p-2 rounded border border-success border-2 green-word word-card";
        wordCard.innerText = word;
        greenWordsContainer.appendChild(wordCard);
      });
      bookCard.appendChild(greenWordsContainer);
    }

    bookSection.appendChild(bookCard);
  });
  booksSection[0].appendChild(bookSection);
};

setsDropdown(setsData);
createSpeedSounds(speedsoundsData);
createBooks(booksData);
