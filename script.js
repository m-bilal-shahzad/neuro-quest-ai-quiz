console.log("NeuroQuest");
// import { API_KEY } from "./api-key.js";

// ---- CONSTANTS / DOM REFERENCES ----
// API KEY
// Paste your API Key here!
// const API_KEY = "YOUR_API_KEY";

// API Url to Fetch Quiz Data
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Classes Used Commmonly
const CLASSES = {
  DARK_MODE: "dark-mode",
  SHOW_OVERLAY: "show-overlay",
  DROPDOWN_TOGGLE: "dropdown-toggle",
  LANGUAGE_OPTION: "language-option",
  LEVEL_OPTION: "level-option",
  DISABLED: "disabled",
  CORRECT: "correct",
  INCORRECT: "incorrect",
};

// Quiz Instruction for User Friendly Experience
const quizInstructions = [
  "Select any <b>topic or language</b> (e.g., OOP, DSA, Databases, JavaScript, C++, etc.).",
  "Choose a <b>difficulty level</b>: Beginner, Intermediate, Advanced.",
  "Pick the <b>Number of Questions</b> (up to 30)",
  "Each question will have <b>four answer options</b> & only one is correct.",
  "You will have a <b>limited time per question</b> (countdown timerwill display).",
  "The <b>Next Question</b> button will activate after choosing an answer or when timer goes out.",
  "Your <b>score and summary</b> will be shown at the end.",
  "Press <b>Start Your Journey</b> to begin your journey.",
];

// Topics For Quiz
const topicsOptions = [
  {
    heading: "Core CS Fundamentals:",
    items: [
      "Programming Fundamentals (PF)",
      "Object Oriented Programming (OOP)",
      "Data Structures & Algorithms (DSA)",
      "Database Systems",
      "Operating Systems",
      "Computer Networks",
      "Software Engineering",
    ],
  },
  {
    heading: "Programming Languages:",
    items: ["C++", "C#", "Java", "Python"],
  },
  {
    heading: "Web Development:",
    items: [
      "HTML & CSS",
      "JavaScript (Core + Advanced)",
      "React.js",
      "Node.js",
      "MongoDB",
      "Next.js",
    ],
  },
];

// Difficulty Levels For Quiz
const levelsOptions = [
  {
    heading: "Choose Difficulty:",
    items: ["Beginner", "Intermediate", "Advanced"],
  },
];

// Answers Labels
const answerLabels = ["A", "B", "C", "D"];

// DOM REFERENCES

// Quiz Main Section
const quizMainSection = document.querySelector(".quiz-main-section");

// For PopUps / Notifications
const infoDiv = document.querySelector(".info-div");

// Toggle Light/Dark Mode
const toggleModeContainer = document.querySelector(".toggle-mode");
// Switch Light/Dark Mode
const toggleBtn = document.querySelector(".toggle-btn");
const modeIcon = document.querySelector(".mode-icon");

// Quiz Instruction Container
const quizInstructionContainer = document.querySelector(
  ".quiz-instructions-container"
);
const startQuizJourneyBtn = document.querySelector(".start-your-journey");

// Quiz Title Container(Icon + Heading)
const quizTitleContainer = document.querySelector(".quiz-title-container");

// Quiz Loading Container
const quizLoadingState = document.querySelector(".quiz-loading-container");

// Quiz Wrapper
const quizWrapper = document.querySelector(".quiz-wrapper");

// Quiz Configuration Container
const quizConfigurationContainer = document.querySelector(
  ".quiz-configuration"
);
// User Preferances on Selecting Topic and Difficulty Level
const userChoices = document.querySelector(".user-choices");
const langaguesDropdown = document.querySelector(".languages-dropdown");
const levelsDropdown = document.querySelector(".levels-dropdown");
// Questions Input Container
const questionsInputContainer = document.querySelector(
  ".questions-input-container"
);
const questionsNumber = document.querySelector(".question-input");
// Add Questions Number
const addQuestionsNumber = document.querySelector(".submit-questions-btn");
// Start Quiz Btn
const startQuizBtn = document.querySelector(".start-quiz-btn");

// Quiz Main Container(Quiz Data)
const quizMainContainer = document.querySelector(".quiz-main-container");
// Topic Selected by User
const quizSelectedTopic = document.querySelector(".topic-text");
// Level Selected by User
const quizSelectedLevel = document.querySelector(".level-text");
// Quiz Timer Container
const quizTimeDisplay = document.querySelector(".quiz-timer-text");
const quizTime = document.querySelector(".quiz-time");

// Quiz Data(Questions+Answers)
const quizMainData = document.querySelector(".quiz-main-data");
// Questions Count (1 out of 10)
const questionsCount = document.querySelector(".question-count");
// Next Question Btn
const nextQuestionBtn = document.querySelector(".next-question-btn");
// Submit Quiz Btn
const submitQuizBtn = document.querySelector(".submit-quiz-btn");

// Quiz Result Container
const quizResultContainer = document.querySelector(".quiz-result");
// Your Quiz Result
const resultMessage = document.querySelector(".result-message");
// Try Again Btn
const tryAgainBtn = document.querySelector(".try-again-btn");

// ----   STATE VARIABLES ----
// For Quiz Topic/Language
let topicName = null;
// For Quiz Difficulty Level
let levelName = null;
// For Number of Questions in Quiz
let noOfQuestions = null;
// For Loading State while Fetching Data
let loading = true;
// To Store Main Quiz Data(Questions+Answers)
let quizData = null;
// To Check Current Question Number
let currentQuestionIndex = 0;
// To Store Total Correct Answers
let correctAnswerIndex = 0;
// For Quiz Timer
const quizTimeLimit = 15;
let currentTime = quizTimeLimit;
let timer = null;

// ----   UTILITY FUNCTIONS ----

// Start Quiz after Reading Instructions
const startYourQuizJourney = () => {
  quizInstructionContainer.classList.add("quiz-instruction-hide");
  quizInstructionContainer.classList.remove("show-instruction-container");
  quizTitleContainer.style.display = "flex";
  quizWrapper.style.display = "block";
  quizMainSection.classList.remove(CLASSES.SHOW_OVERLAY);
};

// Creating Quiz Instructions for User
const createQuizInstructions = () => {
  const quizInstructionsList = quizInstructionContainer.querySelector(
    ".quiz-instructions-list"
  );
  quizInstructionsList.innerHTML = "";
  quizInstructions.forEach((instruction) => {
    const quizInstruction = document.createElement("li");
    quizInstruction.className = "quiz-instruction";
    quizInstruction.innerHTML = instruction;
    quizInstructionsList.append(quizInstruction);
  });
};

// For Switching Modes
const toggleLightDarkMode = (e) => {
  if (e.target.innerText === "toggle_off") {
    quizMainSection.classList.add(CLASSES.DARK_MODE);
    toggleMode("var(--color-card)", "toggle_on", "var(--text-main)");
  } else if (e.target.innerText === "toggle_on") {
    toggleMode("var(--color-card)", "toggle_off", "var(--text-main)");
    quizMainSection.classList.remove(CLASSES.DARK_MODE);
  }
};

const toggleMode = (background, text, color) => {
  toggleModeContainer.style.background = background;
  toggleBtn.innerText = text;
  modeIcon.style.color = color;
  toggleBtn.style.color = color;
};

// For PopUps/Notifications
const toggleInfoDiv = (container, text) => {
  container.innerText = text;

  container.style.display = "block";
  setTimeout(() => {
    container.style.display = "none";
  }, 2500);
};

// Reset Timer(For Correct Answer or New Question)
const resetTimer = () => {
  // Clear interval and all timings
  clearInterval(timer);
  currentTime = quizTimeLimit;
  quizTime.innerText = `${currentTime}s`;
};

// Start Timer when Quiz Starts
const startTimer = () => {
  timer = setInterval(() => {
    currentTime--;
    quizTime.innerText = `${currentTime}s`;

    const questionIndexTimer = currentQuestionIndex - 1;
    const questionsLength = quizData.quiz.questions.length - 1;

    // If times end show correct answer
    if (currentTime === 0) {
      clearInterval(timer);
      highlightCorrectAnswer(questionIndexTimer);
    }

    // On last question hide Next Button
    if (questionIndexTimer === questionsLength) {
      nextQuestionBtn.style.display = "none";
    }
  }, 1000);
};

// Quiz Configuration Functions

// Toggle Dropdowns Visibility
const toggleDropdownVisibility = (element) => {
  element.classList.toggle(CLASSES.DROPDOWN_TOGGLE);
};

// Building Dropdwons for Topics and Levels
const createDropdown = (container, options, newclass) => {
  container.innerHTML = "";

  options.forEach((group) => {
    const dropdownHeading = document.createElement("h2");
    dropdownHeading.className = "dropdown-heading";
    dropdownHeading.textContent = group.heading;
    container.append(dropdownHeading);

    group.items.forEach((option) => {
      const dropdownOption = document.createElement("li");
      dropdownOption.className = "dropdown-options";
      dropdownOption.classList.add(newclass);
      dropdownOption.textContent = option;
      container.append(dropdownOption);
    });
  });

  container.querySelectorAll(`.${newclass}`).forEach((item) => {
    item.addEventListener("click", (e) => {
      if (item.classList.contains(CLASSES.LANGUAGE_OPTION)) {
        topicName = e.target.innerText;
        toggleInfoDiv(infoDiv, `Topic Selected: ${topicName}`);
        toggleDropdownVisibility(langaguesDropdown);
      } else if (item.classList.contains(CLASSES.LEVEL_OPTION)) {
        levelName = e.target.innerText;
        toggleInfoDiv(infoDiv, `Level Selected: ${levelName}`);
        toggleDropdownVisibility(levelsDropdown);
      }
    });
  });
};

// Toggle Dropdown on Click
const toggleDropdown = (e) => {
  if (e.target.closest(".topic-dropdown")) {
    toggleDropdownVisibility(langaguesDropdown);

    if (levelsDropdown.classList.contains(CLASSES.DROPDOWN_TOGGLE)) {
      toggleDropdownVisibility(levelsDropdown);
    }
    createDropdown(langaguesDropdown, topicsOptions, CLASSES.LANGUAGE_OPTION);
  } else if (e.target.closest(".level-dropdown")) {
    toggleDropdownVisibility(levelsDropdown);

    if (langaguesDropdown.classList.contains(CLASSES.DROPDOWN_TOGGLE)) {
      toggleDropdownVisibility(langaguesDropdown);
    }
    createDropdown(levelsDropdown, levelsOptions, CLASSES.LEVEL_OPTION);
  }
};

// Questions Input by User for Quiz
const quizQuestionsInput = (e) => {
  // Subtract in questions number
  if (e.target.closest(".minus-btn")) {
    questionsNumber.value >= 1
      ? questionsNumber.value--
      : toggleInfoDiv(infoDiv, "Value must be Greater than 0");
  }
  // Subtract in questions number
  else if (e.target.closest(".add-btn")) {
    questionsNumber.value < 30
      ? questionsNumber.value++
      : toggleInfoDiv(infoDiv, "You've Reached Max Limit");
  }
};

// Add Question Number for Quiz
const addQuizQuestionsInput = () => {
  if (questionsNumber.value > 0) {
    noOfQuestions = questionsNumber.value.trim();
    toggleInfoDiv(infoDiv, `No. of Questions: ${noOfQuestions}`);
  } else {
    toggleInfoDiv(infoDiv, "Enter Number Again!");
  }
  questionsNumber.value = "0";
};

// Validating Empty Fields in Quiz Configuration Container
const validatePrompt = (topic, level, question) => {
  if (!topic && !level && !question)
    return "Select Topic, Difficulty Level and No. of Questions";
  if (!topic && !level) return "Select Topic & Difficulty Level";
  if (!topic && !question) return "Select Topic & No. of Questions";
  if (!level && !question) return "Select Difficulty Level & No. of Questions";
  if (!topic) return "Select Topic";
  if (!level) return "Select Difficulty Level";
  if (!question) return "Select No. of Questions";
  return null;
};

// Enable Loading State while Generating Quiz Data
const loadingState = () => {
  if (loading) {
    quizLoadingState.style.display = "block";
    quizMainSection.classList.add(CLASSES.SHOW_OVERLAY);
    quizWrapper.style.display = "none";
    quizTitleContainer.style.opacity = "0";
  }
};

// Reset Old Data while Generating Next Quiz Data
const clearOldData = () => {
  topicName = null;
  levelName = null;
  noOfQuestions = null;
  loading = true;
  quizData = null;
  currentQuestionIndex = 0;
  correctAnswerIndex = 0;

  currentTime = quizTimeLimit;
  if (timer) clearInterval(timer);
  timer = null;
  quizConfigurationContainer.style.display = "none";
  submitQuizBtn.style.display = "none";
};

// ----   CORE FUNCTIONS ----

// Quiz Main Data Functions

// Generating Quiz Data According to User Inputs
const generateQuizData = async () => {
  // Validating user input
  const errorMsg = validatePrompt(topicName, levelName, noOfQuestions);
  if (errorMsg) {
    toggleInfoDiv(infoDiv, errorMsg);
    return;
  }

  // Clearing old data if any
  // clearOldData();

  // Enabling loading state until quiz data generated
  loadingState();

  // Prompt to generate data in a specific format
  let userPrompt = `Generate a quiz in pure JSON format only (no Markdown, no extra text, no explanations). The JSON must always follow this exact structure:
  {
  "quiz": {
      "topic": "${topicName}",
      "level": "${levelName}",
      "questions": [
        {
         "id": 1,
         "question": "Your question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Correct Option"
        }
      ]
    }
  }
  Rules (must always be followed):
    The root key must be "quiz".
  Inside "quiz", the keys must strictly be: "topic", "level", "questions".
  Each question object must strictly contain: "id", "question", "options", "answer".
  "id" must be numeric (1, 2, 3 …).
  "question" length must be between 80 to 100 characters.
  "options" must contain exactly 4 strings. Each option length must be between 10 to 50 characters.
  "answer" must exactly match one of the 4 "options".
  The number of questions must be exactly ${noOfQuestions}.
  Important: If the topic is related to HTML, CSS, or any code snippet, then all special characters must be escaped:
  < → &lt;
  > → &gt;
  & → &amp;
  This ensures answers/options render properly in the DOM.
  Do not add any other keys, metadata, explanations, or formatting outside the JSON.`;

  // Try Catch Block to Fetch Data
  try {
    const responce = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    });

    const data = await responce.json();

    const rawResponce = data.candidates[0]?.content.parts[0]?.text
      .replace(/^```json|^```|\n```$/gm, "")
      .trim();

    quizData = JSON.parse(rawResponce);

    // Checking  if quizData is valid
    if (
      quizData &&
      quizData.quiz &&
      quizData.quiz.questions &&
      quizData.quiz.questions[0].answer
    ) {
      loading = false;
      handleQuizData();

      // Switch to quiz view only on when quiz data is there
      quizLoadingState.style.display = "none";
      quizWrapper.style.display = "block";
      quizMainSection.classList.remove(CLASSES.SHOW_OVERLAY);
      quizTitleContainer.style.opacity = "1";

      quizConfigurationContainer.style.display = "none";
      quizMainContainer.style.display = "flex";
    } else {
      throw new Error("invalid Quiz Data Format!");
    }
  } catch (error) {
    toggleInfoDiv(infoDiv, "Error while Fetching Quiz Data. Try Again!");

    // If error reset UI back to configuration container
    quizLoadingState.style.display = "none";
    quizWrapper.style.display = "block";
    quizMainContainer.style.display = "none";

    quizConfigurationContainer.style.display = "flex";
    quizMainSection.classList.remove(CLASSES.SHOW_OVERLAY);
    quizTitleContainer.style.opacity = "1";
  }
};

// Setting User Selected Preferances
const setUserPreferances = () => {
  quizSelectedTopic.innerText = quizData.quiz.topic;
  quizSelectedLevel.innerText = quizData.quiz.level;
};

// Handling Quiz Generated Data(Creating Question & Answer Elements)
const handleQuizData = () => {
  setUserPreferances();
  resetTimer();
  startTimer();

  const quizQuestions = quizData.quiz.questions;
  quizMainData.innerHTML = "";

  // To wrap all questions + answer once then append them in quiz main data container
  const fragment = document.createDocumentFragment();

  if (currentQuestionIndex >= quizQuestions.length) {
    quizMainContainer.style.display = "none";
    toggleInfoDiv(infoDiv, "Questions Completed");
    return;
  }

  // Create and Add Question Title
  const quizQuestion = document.createElement("h2");
  quizQuestion.className = "quiz-question";
  quizQuestion.innerText = quizQuestions[currentQuestionIndex].question;
  fragment.append(quizQuestion);

  // Create and Add Answer Options List
  const answerOptions = document.createElement("ul");
  answerOptions.className = "answer-options";

  // Create Li Element for Answer Options
  quizQuestions[currentQuestionIndex].options.forEach((option, labelID) => {
    // Creating Li Element
    const answerOption = document.createElement("li");
    answerOption.className = "ans-option";
    answerOption.setAttribute("data-index", currentQuestionIndex);
    answerOption.setAttribute("data-answer", option);
    answerOption.innerHTML = `<span class="answer-text"> <span>${answerLabels[labelID]}) </span>${option}</span>`;

    answerOptions.append(answerOption);
  });

  fragment.append(answerOptions);

  // Append the whole fragment at once
  quizMainData.append(fragment);

  // Questions Status(User is on which Question No.)
  questionsCount.innerHTML = `Question: <span> ${quizQuestions[currentQuestionIndex].id}</span> of <span>${quizQuestions.length}</span>`;

  // When User is on Last Question Change Next Button to Submit Quiz Button
  if (currentQuestionIndex === quizQuestions.length - 1) {
    submitQuizBtn.style.display = "block";
    nextQuestionBtn.style.display = "none";
    submitQuizBtn.classList.add(CLASSES.DISABLED);
  }

  currentQuestionIndex++;
  nextQuestionBtn.classList.add(CLASSES.DISABLED);
};

// Handle User Click on Any Answer Option
const handleAnswerClick = (event) => {
  // Get the Clicked Option and Check If it's Valid
  const ansOption = event.target.closest(".ans-option");
  if (!ansOption || ansOption.classList.contains(CLASSES.DISABLED)) return;

  // Get the Answer Data
  const questionIndex = ansOption.getAttribute("data-index");
  const selectedAnswer = ansOption.getAttribute("data-answer");
  const correctAnswer = quizData.quiz.questions[questionIndex].answer;

  // Checking User is Clicking on Wrong Option or Right Option
  if (selectedAnswer === correctAnswer) {
    // Create Icon for Correct or Incorrect Option
    const correctIcon = document.createElement("span");
    correctIcon.className = "material-symbols-sharp answer-icon";
    // User was Correct
    correctIcon.innerText = "check";
    ansOption.append(correctIcon);
    ansOption.classList.add(CLASSES.CORRECT);

    correctAnswerIndex++;

    // Disable all options once user answers correctly
    const allOptions = ansOption.parentElement.querySelectorAll(".ans-option");
    allOptions.forEach((opt) => opt.classList.add(CLASSES.DISABLED));

    // Reset Timer when User Clicks on Any Option
    resetTimer();
  } else {
    ansOption.classList.add(CLASSES.INCORRECT);
    // Reset Timer when User Clicks on Any Option
    resetTimer();
    // Highlight Right Answer if User Clicks on Wrong Option
    highlightCorrectAnswer(questionIndex, ansOption);
  }

  // Show Next Button After User Selects any Answer Option
  if (Number(questionIndex) === quizData.quiz.questions.length - 1) {
    nextQuestionBtn.style.display = "none";
  } else {
    nextQuestionBtn.style.display = "block";
  }

  nextQuestionBtn.classList.remove(CLASSES.DISABLED);
  submitQuizBtn.classList.remove(CLASSES.DISABLED);
};

// Highlight Right Answer(For Wrong Answer+ When Times Out)
const highlightCorrectAnswer = (questionIndex, wrongOption = null) => {
  const correctAnswer = quizData.quiz.questions[questionIndex].answer;

  const allOptions = quizMainData.querySelectorAll(".ans-option");

  allOptions.forEach((option) => {
    option.classList.add(CLASSES.DISABLED);

    // Remove old icons if any before adding
    option.querySelectorAll(".answer-icon").forEach((icon) => icon.remove());

    if (option.getAttribute("data-answer") === correctAnswer) {
      const correctIcon = document.createElement("span");
      correctIcon.className = "material-symbols-sharp answer-icon";
      correctIcon.innerText = "check";
      option.append(correctIcon);
      option.classList.add(CLASSES.CORRECT);
    }
  });

  if (wrongOption) {
    const wrongIcon = document.createElement("span");
    wrongIcon.className = "material-symbols-sharp answer-icon";
    wrongIcon.innerText = "close";
    wrongOption.append(wrongIcon);
    wrongOption.classList.add(CLASSES.INCORRECT);
  }

  // Show Next Button
  nextQuestionBtn.style.display = "block";
  nextQuestionBtn.classList.remove(CLASSES.DISABLED);
  submitQuizBtn.classList.remove(CLASSES.DISABLED);
};

// Quiz Result Functions

// Generating Quiz Result
const quizResult = () => {
  const totalQuestions = quizData.quiz.questions.length;
  quizMainContainer.style.display = "none";
  quizResultContainer.style.display = "flex";
  resultMessage.querySelector(".correct-answers").innerText =
    correctAnswerIndex;
  resultMessage.querySelector(".total-questions").innerText = totalQuestions;
};

// Try Again Quiz
const tryAgainQuiz = () => {
  // Clearing old data if any
  clearOldData();
  resetTimer();
  quizResultContainer.style.display = "none";
  quizConfigurationContainer.style.display = "flex";
  correctAnswerIndex = 0;
};

// ----   EVENT LISTENERS ----

// For Start Quiz after Reading Instructions
startQuizJourneyBtn.addEventListener("click", () => {
  startYourQuizJourney();
});

// For Switching Modes
toggleModeContainer.addEventListener("click", (event) => {
  toggleLightDarkMode(event);
});

// To Toggle Dropdown on User Choice Click
userChoices.addEventListener("click", (event) => {
  toggleDropdown(event);
});

// For Questions Input by User
questionsInputContainer.addEventListener("click", (event) =>
  quizQuestionsInput(event)
);

// Add Question Number for Quiz Set by User
addQuestionsNumber.addEventListener("click", () => {
  addQuizQuestionsInput();
});

// Quiz Main Data Container (Using Event Delegation)
quizMainData.addEventListener("click", (event) => {
  handleAnswerClick(event);
});

// Start Quiz after Generating Quiz Data
startQuizBtn.addEventListener("click", () => {
  generateQuizData();
});

// Move on to Next Question
nextQuestionBtn.addEventListener("click", () => {
  if (quizData) {
    handleQuizData();
  }
});

// Submit Quiz for Results
submitQuizBtn.addEventListener("click", () => {
  quizResult();
});

// After Seeing Results Try Again Quiz
tryAgainBtn.addEventListener("click", () => {
  tryAgainQuiz();
});

// Load Instruction Container on Window Load
window.addEventListener("DOMContentLoaded", () => {
  createQuizInstructions();
  quizInstructionContainer.classList.add("show-instruction-container");
  quizMainSection.classList.add(CLASSES.SHOW_OVERLAY);
});
