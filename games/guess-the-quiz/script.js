const quizData = [
    { category: "Animal", emoji: "🐶", question: "What animal is this?", options: ["Dog", "Cat", "Bird", "Fish"], correct: 0 },
    { category: "Animal", emoji: "🐱", question: "What animal is this?", options: ["Dog", "Cat", "Mouse", "Tiger"], correct: 1 },
    { category: "Animal", emoji: "🐭", question: "What animal is this?", options: ["Rat", "Mouse", "Hamster", "Rabbit"], correct: 1 },
    { category: "Animal", emoji: "🐹", question: "What animal is this?", options: ["Dog", "Hamster", "Mouse", "Squirrel"], correct: 1 },
    { category: "Animal", emoji: "🐰", question: "What animal is this?", options: ["Rabbit", "Cat", "Dog", "Fox"], correct: 0 },
    { category: "Animal", emoji: "🦊", question: "What animal is this?", options: ["Wolf", "Dog", "Fox", "Tiger"], correct: 2 },
    { category: "Animal", emoji: "🐻", question: "What animal is this?", options: ["Lion", "Bear", "Dog", "Cat"], correct: 1 },
    { category: "Animal", emoji: "🐼", question: "What animal is this?", options: ["Panda", "Bear", "Dog", "Koala"], correct: 0 },
    { category: "Animal", emoji: "🐨", question: "What animal is this?", options: ["Koala", "Bear", "Dog", "Monkey"], correct: 0 },
    { category: "Animal", emoji: "🦁", question: "What animal is this?", options: ["Tiger", "Lion", "Leopard", "Jaguar"], correct: 1 },
    { category: "Color", emoji: "🍎", question: "What color is this apple?", options: ["Blue", "Red", "Yellow", "Green"], correct: 1 },
    { category: "Color", emoji: "🍏", question: "What color is this apple?", options: ["Green", "Red", "Purple", "Blue"], correct: 0 },
    { category: "Color", emoji: "🌻", question: "What color is this sunflower?", options: ["Red", "Blue", "Yellow", "Purple"], correct: 2 },
    { category: "Color", emoji: "🌊", question: "What color is the ocean?", options: ["Red", "Green", "Blue", "Yellow"], correct: 2 },
    { category: "Color", emoji: "🍋", question: "What color is this lemon?", options: ["Yellow", "Orange", "Green", "Red"], correct: 0 },
    { category: "Color", emoji: "🍇", question: "What color are grapes usually?", options: ["Red", "Green", "Purple", "Blue"], correct: 2 },
    { category: "Color", emoji: "🥕", question: "What color is this carrot?", options: ["Orange", "Green", "Red", "Yellow"], correct: 0 },
    { category: "Fruit", emoji: "🍌", question: "What fruit is this?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1 },
    { category: "Fruit", emoji: "🍊", question: "What fruit is this?", options: ["Banana", "Apple", "Orange", "Grape"], correct: 2 },
    { category: "Fruit", emoji: "🍉", question: "What fruit is this?", options: ["Watermelon", "Apple", "Pear", "Peach"], correct: 0 },
    { category: "Fruit", emoji: "🍍", question: "What fruit is this?", options: ["Pineapple", "Banana", "Orange", "Mango"], correct: 0 },
    { category: "Fruit", emoji: "🥭", question: "What fruit is this?", options: ["Mango", "Apple", "Banana", "Papaya"], correct: 0 },
    { category: "Fruit", emoji: "🍒", question: "What fruit is this?", options: ["Apple", "Cherry", "Strawberry", "Grape"], correct: 1 },
    { category: "Fruit", emoji: "🍓", question: "What fruit is this?", options: ["Cherry", "Strawberry", "Apple", "Raspberry"], correct: 1 },
    { category: "Food", emoji: "🍔", question: "What food is this?", options: ["Burger", "Pizza", "Sandwich", "Hotdog"], correct: 0 },
    { category: "Food", emoji: "🍕", question: "What food is this?", options: ["Pizza", "Burger", "Taco", "Sandwich"], correct: 0 },
    { category: "Food", emoji: "🌭", question: "What food is this?", options: ["Burger", "Hotdog", "Sandwich", "Pizza"], correct: 1 },
    { category: "Food", emoji: "🍟", question: "What food is this?", options: ["Noodles", "French Fries", "Chips", "Rice"], correct: 1 },
    { category: "Food", emoji: "🍩", question: "What food is this?", options: ["Cake", "Cookie", "Donut", "Bread"], correct: 2 },
    { category: "Food", emoji: "🎂", question: "What food is this?", options: ["Cookie", "Cake", "Pie", "Donut"], correct: 1 },
    { category: "Flag", emoji: "🇺🇸", question: "Which country's flag is this?", options: ["USA", "UK", "Canada", "France"], correct: 0 },
    { category: "Flag", emoji: "🇮🇳", question: "Which country's flag is this?", options: ["India", "Italy", "Ireland", "Iran"], correct: 0 },
    { category: "Flag", emoji: "🇯🇵", question: "Which country's flag is this?", options: ["China", "Japan", "Korea", "Thailand"], correct: 1 },
    { category: "Flag", emoji: "🇧🇷", question: "Which country's flag is this?", options: ["Brazil", "Mexico", "Argentina", "Portugal"], correct: 0 },
    { category: "Flag", emoji: "🇬🇧", question: "Which country's flag is this?", options: ["USA", "Australia", "UK", "Canada"], correct: 2 },
    { category: "Weather", emoji: "☀️", question: "What weather is this?", options: ["Rainy", "Sunny", "Snowy", "Cloudy"], correct: 1 },
    { category: "Weather", emoji: "🌧️", question: "What weather is this?", options: ["Rainy", "Sunny", "Snowy", "Cloudy"], correct: 0 },
    { category: "Weather", emoji: "❄️", question: "What weather is this?", options: ["Rainy", "Sunny", "Snowy", "Windy"], correct: 2 },
    { category: "Weather", emoji: "🌪️", question: "What weather is this?", options: ["Tornado", "Rain", "Hurricane", "Wind"], correct: 0 },
    { category: "Emotion", emoji: "😀", question: "What emotion is this?", options: ["Happy", "Sad", "Angry", "Scared"], correct: 0 },
    { category: "Emotion", emoji: "😢", question: "What emotion is this?", options: ["Happy", "Sad", "Angry", "Scared"], correct: 1 },
    { category: "Emotion", emoji: "😡", question: "What emotion is this?", options: ["Happy", "Sad", "Angry", "Shy"], correct: 2 },
    { category: "Emotion", emoji: "😱", question: "What emotion is this?", options: ["Happy", "Sad", "Scared", "Angry"], correct: 2 },
    { category: "Emotion", emoji: "😍", question: "What emotion is this?", options: ["Love", "Angry", "Scared", "Happy"], correct: 0 },
    { category: "Emotion", emoji: "😴", question: "What emotion is this?", options: ["Awake", "Sleepy", "Scared", "Happy"], correct: 1 },
    { category: "Activity", emoji: "⚽", question: "What sport is this?", options: ["Basketball", "Football", "Tennis", "Golf"], correct: 1 },
    { category: "Activity", emoji: "🏀", question: "What sport is this?", options: ["Basketball", "Football", "Tennis", "Baseball"], correct: 0 },
    { category: "Activity", emoji: "🎾", question: "What sport is this?", options: ["Basketball", "Football", "Tennis", "Golf"], correct: 2 },
    { category: "Activity", emoji: "🏓", question: "What sport is this?", options: ["Hockey", "Tennis", "Table Tennis", "Golf"], correct: 2 },
    { category: "Activity", emoji: "🏏", question: "What sport is this?", options: ["Cricket", "Baseball", "Golf", "Football"], correct: 0 },
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

window.addEventListener('load', function () {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('hidden');
        document.getElementById('gameContainer').style.display = 'flex';
        shuffleArray(quizData); 
        loadQuestion();
    }, 1200);
});

function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        showFinalScore();
        return;
    }

    const question = quizData[currentQuestion];
    answered = false;

    
    document.getElementById('category').textContent = question.category;
    document.getElementById('questionEmoji').textContent = question.emoji;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionNum').textContent = currentQuestion + 1;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'interaction-feedback';
    document.getElementById('nextBtn').classList.add('hidden');

    
    const optionBtns = document.querySelectorAll('.quiz-option');
    optionBtns.forEach((btn, index) => {
        btn.textContent = question.options[index];
        btn.className = 'quiz-option';
        btn.disabled = false;
        btn.onclick = () => { playSound('click'); selectAnswer(index); };
    });
}

function selectAnswer(selectedIndex) {
    if (answered) return;

    answered = true;
    const question = quizData[currentQuestion];
    const optionBtns = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('feedback');

    
    optionBtns.forEach(btn => btn.disabled = true);

    if (selectedIndex === question.correct) {
        
        optionBtns[selectedIndex].classList.add('correct');
        feedback.textContent = '✨ Magnificent! That\'s correct!';
        feedback.className = 'interaction-feedback correct';
        score++;
        document.getElementById('score').textContent = score;

        
        playSound('correct');

        
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    } else {
        
        optionBtns[selectedIndex].classList.add('incorrect');
        optionBtns[question.correct].classList.add('correct');
        feedback.textContent = '🎯 Almost! The correct answer is now highlighted.';
        feedback.className = 'interaction-feedback incorrect';

        
        playSound('incorrect');

        
        document.getElementById('nextBtn').classList.remove('hidden');
    }
}

function nextQuestion() {
    currentQuestion++;
    loadQuestion();
}

function showFinalScore() {
    
    document.getElementById('questionArea').classList.add('hidden');
    document.getElementById('optionsGrid').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    document.getElementById('feedback').classList.add('hidden');

    const finalScore = document.getElementById('finalScore');
    const encouragement = document.getElementById('encouragement');

    document.getElementById('finalScoreText').textContent = score;

    
    playSound('gameComplete');

    if (score >= 40) {
        encouragement.textContent = '👑 Absolute Legend! You are a quiz master!';
    } else if (score >= 30) {
        encouragement.textContent = '🌟 Incredible Performance! Top tier skills!';
    } else if (score >= 15) {
        encouragement.textContent = '👏 Great Job! You have a sharp mind!';
    } else {
        encouragement.textContent = '🌈 Good effort! Keep playing to learn more!';
    }

    finalScore.classList.remove('hidden');
}

function restartGame() {
    currentQuestion = 0;
    score = 0;
    answered = false;

    shuffleArray(quizData); 
    document.getElementById('score').textContent = '0';
    document.getElementById('questionArea').classList.remove('hidden');
    document.getElementById('optionsGrid').classList.remove('hidden');
    document.getElementById('feedback').classList.remove('hidden');
    document.getElementById('finalScore').classList.add('hidden');

    loadQuestion();
}

function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (type === 'correct') {
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, index * 100);
            });
        } else if (type === 'incorrect') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(110, audioContext.currentTime + 0.4);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else if (type === 'gameComplete') {
            const melody = [523.25, 659.25, 783.99, 1046.50];
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = 'triangle';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                }, index * 150);
            });
        } else if (type === 'click') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    } catch (error) {
        
    }
}
