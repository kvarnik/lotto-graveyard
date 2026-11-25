// Simplified Lotto Graveyard App - No Fortune Generation
class LottoGraveyardApp {
    constructor() {
        this.input = new InputModule();
        this.analysis = new HistoricalAnalysis();
        this.tombstone = new TombstoneRenderer();
        this.tarot = new TarotModule();
        this.currentLotteryNumbers = null;
        this.currentCards = null;
    }
    
    async init() {
        try {
            this.showLoading('Loading historical data...');
            await this.analysis.loadData();
            this.hideLoading();
            this.input.init(document.getElementById('input-section'));
            this.input.onNumbersValidated((numbers) => this.handleNumbersValidated(numbers));
        } catch (error) {
            this.hideLoading();
            alert('Failed to load application.');
        }
    }
    
    async handleNumbersValidated(numbers) {
        this.currentLotteryNumbers = numbers;
        this.showLoading('Analyzing numbers...');
        const result = this.analysis.analyze(numbers);
        this.hideLoading();
        document.getElementById('input-section').classList.add('hidden');
        this.tombstone.render(result, document.getElementById('tombstone-container'));
        document.getElementById('tombstone-section').classList.remove('hidden');
        this.showTarotPrompt();
    }
    
    showTarotPrompt() {
        const container = document.getElementById('tarot-prompt-container');
        container.innerHTML = '<div class="prompt-container"><h2>Mystical Tarot Reading</h2><p>See the tarot cards based on your lottery numbers</p><button id="reveal-cards-btn" class="btn-primary">Reveal My Cards</button></div>';
        document.getElementById('reveal-cards-btn').onclick = () => this.showCards();
        document.getElementById('tarot-prompt-section').classList.remove('hidden');
    }
    
    showCards() {
        document.getElementById('tarot-prompt-section').classList.add('hidden');
        const cards = this.tarot.selectCards(this.currentLotteryNumbers, "What do my numbers reveal?");
        const container = document.getElementById('card-display-container');
        this.tarot.displayReading(cards, '', container);
        const interp = document.createElement('div');
        interp.innerHTML = '<div class="interpretation-container"><h3>Your Cards</h3><p>Past: ' + cards[0].name + '</p><p>Present: ' + cards[1].name + '</p><p>Future: ' + cards[2].name + '</p><button id="start-over-btn" class="btn-primary">Start Over</button></div>';
        container.appendChild(interp);
        document.getElementById('start-over-btn').onclick = () => location.reload();
        document.getElementById('card-display-section').classList.remove('hidden');
    }
    
    showLoading(msg) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.querySelector('.loading-status').textContent = msg;
            overlay.classList.add('visible');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('visible');
    }
}
document.addEventListener('DOMContentLoaded', () => new LottoGraveyardApp().init());
