// Tarot Module
// Generates deterministic tarot card selections and coordinates fortune generation

class TarotModule {
    constructor() {
        this.deck = TAROT_DECK;
    }
    
    /**
     * Initialize with tarot deck data
     * @param {Array} deckData - Optional deck data to override default
     */
    init(deckData) {
        if (deckData) {
            this.deck = deckData;
        }
    }
    
    /**
     * Show tarot reading prompt after tombstone
     * @param {Object} lotteryNumbers - The lottery numbers object
     * @param {HTMLElement} containerElement - Container to display the prompt
     */
    showPrompt(lotteryNumbers, containerElement) {
        // Store lottery numbers for later use
        this.currentLotteryNumbers = lotteryNumbers;
        
        // Clear existing content
        containerElement.innerHTML = '';
        
        // Create prompt container
        const promptDiv = document.createElement('div');
        promptDiv.className = 'prompt-container';
        
        // Create prompt message
        const message = document.createElement('p');
        message.textContent = 'Your numbers have been laid to rest. Would you like to receive a mystical tarot reading based on your lottery numbers?';
        promptDiv.appendChild(message);
        
        // Display lottery numbers in the prompt
        const numbersDisplay = document.createElement('div');
        numbersDisplay.className = 'prompt-numbers';
        numbersDisplay.innerHTML = `
            <p><strong>Your Numbers:</strong> ${lotteryNumbers.whiteBalls.join(', ')} + Powerball ${lotteryNumbers.powerball}</p>
        `;
        promptDiv.appendChild(numbersDisplay);
        
        // Create action buttons container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'prompt-actions';
        
        // Accept button with Rider-Waite styling
        const acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.id = 'accept-tarot-btn';
        acceptBtn.textContent = 'Accept Reading';
        acceptBtn.className = 'btn-primary';
        acceptBtn.addEventListener('click', () => this.handleAccept());
        
        // Decline button with Rider-Waite styling
        const declineBtn = document.createElement('button');
        declineBtn.type = 'button';
        declineBtn.id = 'decline-tarot-btn';
        declineBtn.textContent = 'Decline';
        declineBtn.className = 'btn-secondary';
        declineBtn.addEventListener('click', () => this.handleDecline());
        
        actionsDiv.appendChild(acceptBtn);
        actionsDiv.appendChild(declineBtn);
        promptDiv.appendChild(actionsDiv);
        
        // Append to container
        containerElement.appendChild(promptDiv);
    }
    
    /**
     * Handle accept button click
     */
    handleAccept() {
        // Hide the prompt section
        const promptSection = document.getElementById('tarot-prompt-section');
        if (promptSection) {
            promptSection.classList.add('hidden');
        }
        
        // Show the question section
        const questionSection = document.getElementById('question-section');
        if (questionSection) {
            questionSection.classList.remove('hidden');
        }
        
        // Render the question collection form
        this.renderQuestionForm();
    }
    
    /**
     * Handle decline button click
     */
    handleDecline() {
        // Hide the prompt section
        const promptSection = document.getElementById('tarot-prompt-section');
        if (promptSection) {
            promptSection.classList.add('hidden');
        }
        
        // Reset to input section
        const inputSection = document.getElementById('input-section');
        if (inputSection) {
            inputSection.classList.remove('hidden');
        }
        
        // Hide tombstone section
        const tombstoneSection = document.getElementById('tombstone-section');
        if (tombstoneSection) {
            tombstoneSection.classList.add('hidden');
        }
    }
    
    /**
     * Render the question collection form
     */
    renderQuestionForm() {
        const questionContainer = document.getElementById('question-container');
        if (!questionContainer) return;
        
        // Clear existing content
        questionContainer.innerHTML = '';
        
        // Create form
        const form = document.createElement('form');
        form.id = 'question-form';
        form.className = 'question-form';
        form.noValidate = true;
        
        // Create form group
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        // Create label
        const label = document.createElement('label');
        label.htmlFor = 'tarot-question';
        label.textContent = 'What question would you like the cards to illuminate?';
        formGroup.appendChild(label);
        
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.id = 'tarot-question';
        textarea.name = 'tarot-question';
        textarea.maxLength = 200;
        textarea.required = true;
        textarea.setAttribute('aria-required', 'true');
        textarea.setAttribute('aria-invalid', 'false');
        textarea.setAttribute('aria-describedby', 'question-error character-count');
        textarea.placeholder = 'Enter your question (200 characters max)';
        formGroup.appendChild(textarea);
        
        // Create character count display
        const charCount = document.createElement('div');
        charCount.id = 'character-count';
        charCount.className = 'character-count';
        charCount.textContent = '0 / 200 characters';
        formGroup.appendChild(charCount);
        
        // Create error message element
        const errorMsg = document.createElement('span');
        errorMsg.id = 'question-error';
        errorMsg.className = 'error-message';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.setAttribute('aria-live', 'polite');
        formGroup.appendChild(errorMsg);
        
        form.appendChild(formGroup);
        
        // Create submit button
        const submitGroup = document.createElement('div');
        submitGroup.className = 'form-group text-center';
        
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.id = 'submit-question-btn';
        submitBtn.textContent = 'Reveal My Cards';
        submitBtn.className = 'btn-primary';
        
        submitGroup.appendChild(submitBtn);
        form.appendChild(submitGroup);
        
        // Add event listeners
        textarea.addEventListener('input', (e) => this.updateCharacterCount(e.target));
        form.addEventListener('submit', (e) => this.handleQuestionSubmit(e));
        
        questionContainer.appendChild(form);
    }
    
    /**
     * Update character count display
     * @param {HTMLTextAreaElement} textarea - The textarea element
     */
    updateCharacterCount(textarea) {
        const charCountEl = document.getElementById('character-count');
        if (charCountEl) {
            const count = textarea.value.length;
            charCountEl.textContent = `${count} / 200 characters`;
        }
    }
    
    /**
     * Validate a question string
     * @param {string} question - The question to validate
     * @returns {Object} Validation result { valid: boolean, error: string }
     */
    validateQuestion(question) {
        // Check for at least 1 non-whitespace character
        if (!question || !/\S/.test(question)) {
            return { 
                valid: false, 
                error: 'A question is required' 
            };
        }
        
        // Check length (max 200 characters)
        if (question.length > 200) {
            return { 
                valid: false, 
                error: 'Question must be 200 characters or less' 
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Handle question form submission
     * @param {Event} event - Form submit event
     */
    handleQuestionSubmit(event) {
        event.preventDefault();
        
        const textarea = document.getElementById('tarot-question');
        const errorEl = document.getElementById('question-error');
        
        if (!textarea || !errorEl) return;
        
        const question = textarea.value;
        
        // Validate the question
        const validation = this.validateQuestion(question);
        
        if (!validation.valid) {
            // Display error
            errorEl.textContent = validation.error;
            textarea.setAttribute('aria-invalid', 'true');
            return;
        }
        
        // Clear error
        errorEl.textContent = '';
        textarea.setAttribute('aria-invalid', 'false');
        
        // Store the question
        this.currentQuestion = question;
        
        // Resolve the promise if collectQuestion was called
        if (this.questionResolver) {
            this.questionResolver(question);
            this.questionResolver = null;
        }
        
        // Trigger the next step (card selection and display)
        // This will be handled by the calling code
        if (this.onQuestionSubmitted) {
            this.onQuestionSubmitted(question);
        }
    }
    
    /**
     * Collect user question
     * @returns {Promise<string>} The user's question
     */
    async collectQuestion() {
        // Return a promise that resolves when the question is submitted
        return new Promise((resolve) => {
            this.questionResolver = resolve;
        });
    }
    
    /**
     * Set callback for question submission
     * @param {Function} callback - Callback function that receives the question
     */
    onQuestionSubmit(callback) {
        this.onQuestionSubmitted = callback;
    }
    
    /**
     * Create a deterministic seed from lottery numbers and question
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @param {string} question - The user's question
     * @returns {string} A deterministic seed string
     */
    createSeed(lotteryNumbers, question) {
        // Combine lottery numbers and question into deterministic seed
        const numberPart = lotteryNumbers.whiteBalls.join(',') + '|' + lotteryNumbers.powerball;
        const questionPart = question.toLowerCase().trim();
        return `${numberPart}::${questionPart}`;
    }
    
    /**
     * Select 3 unique cards deterministically using Fisher-Yates shuffle
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @param {string} question - The user's question
     * @returns {Array} Array of 3 card objects with positions ['past', 'present', 'future']
     */
    selectCards(lotteryNumbers, question) {
        // Validate inputs
        if (!lotteryNumbers || !lotteryNumbers.whiteBalls || !lotteryNumbers.powerball) {
            throw new Error('Invalid lottery numbers');
        }
        
        if (!question || typeof question !== 'string') {
            throw new Error('Invalid question');
        }
        
        // Create seed from lottery numbers and question
        const seed = this.createSeed(lotteryNumbers, question);
        
        // Initialize seeded RNG using seedrandom library
        const rng = new Math.seedrandom(seed);
        
        // Create a copy of the deck to shuffle
        const deck = [...this.deck];
        
        // Fisher-Yates shuffle with seeded RNG
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Select first 3 unique cards (they're guaranteed unique by the shuffle)
        const selectedCards = [
            { ...deck[0], position: 'past' },
            { ...deck[1], position: 'present' },
            { ...deck[2], position: 'future' }
        ];
        
        return selectedCards;
    }
    
    /**
     * Request fortune from Lambda
     * @param {Array} cards - Array of 3 selected cards
     * @param {string} question - The user's question
     * @returns {Promise<string>} The generated fortune
     */
    async generateFortune(cards, question) {
        // Create FortuneClient instance
        const fortuneClient = new FortuneClient();
        
        // Request fortune from Lambda
        const fortune = await fortuneClient.generateFortune(question, cards);
        
        return fortune;
    }
    
    /**
     * Display complete reading
     * @param {Array} cards - Array of 3 selected cards
     * @param {string} fortune - The generated fortune text
     * @param {HTMLElement} containerElement - Container to display the reading
     */
    displayReading(cards, fortune, containerElement) {
        // Clear existing content
        containerElement.innerHTML = '';
        
        // Create card container with responsive layout
        const cardContainer = document.createElement('div');
        cardContainer.className = 'tarot-card-container';
        cardContainer.setAttribute('role', 'region');
        cardContainer.setAttribute('aria-label', 'Three-card tarot spread');
        
        // Display each card with its position
        cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'tarot-card';
            cardDiv.setAttribute('role', 'article');
            cardDiv.setAttribute('aria-labelledby', `card-name-${index}`);
            
            // Card image
            const cardImage = document.createElement('img');
            cardImage.src = card.imageUrl;
            cardImage.alt = `${card.name} tarot card`;
            cardImage.loading = 'lazy';
            cardImage.setAttribute('aria-describedby', `card-position-${index}`);
            
            // Handle image loading errors
            cardImage.onerror = () => {
                cardImage.alt = `${card.name} (image unavailable)`;
                cardImage.style.display = 'none';
                const errorMsg = document.createElement('p');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Image unavailable';
                cardDiv.insertBefore(errorMsg, cardDiv.firstChild);
            };
            
            cardDiv.appendChild(cardImage);
            
            // Card name
            const cardName = document.createElement('div');
            cardName.className = 'tarot-card-name';
            cardName.id = `card-name-${index}`;
            cardName.textContent = card.name;
            cardDiv.appendChild(cardName);
            
            // Card position (past, present, future)
            const cardPosition = document.createElement('div');
            cardPosition.className = 'tarot-card-position';
            cardPosition.id = `card-position-${index}`;
            cardPosition.textContent = card.position.charAt(0).toUpperCase() + card.position.slice(1);
            cardDiv.appendChild(cardPosition);
            
            cardContainer.appendChild(cardDiv);
        });
        
        containerElement.appendChild(cardContainer);
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TarotModule;
}
