// Tarot Deck Data
// 78-card tarot deck with 1909 Rider-Waite imagery

const TAROT_DECK = [
    // Major Arcana (0-21) - 22 cards
    { id: 0, name: 'The Fool', arcana: 'major', imageUrl: 'assets/tarot/major-00.jpg' },
    { id: 1, name: 'The Magician', arcana: 'major', imageUrl: 'assets/tarot/major-01.jpg' },
    { id: 2, name: 'The High Priestess', arcana: 'major', imageUrl: 'assets/tarot/major-02.jpg' },
    { id: 3, name: 'The Empress', arcana: 'major', imageUrl: 'assets/tarot/major-03.jpg' },
    { id: 4, name: 'The Emperor', arcana: 'major', imageUrl: 'assets/tarot/major-04.jpg' },
    { id: 5, name: 'The Hierophant', arcana: 'major', imageUrl: 'assets/tarot/major-05.jpg' },
    { id: 6, name: 'The Lovers', arcana: 'major', imageUrl: 'assets/tarot/major-06.jpg' },
    { id: 7, name: 'The Chariot', arcana: 'major', imageUrl: 'assets/tarot/major-07.jpg' },
    { id: 8, name: 'Strength', arcana: 'major', imageUrl: 'assets/tarot/major-08.jpg' },
    { id: 9, name: 'The Hermit', arcana: 'major', imageUrl: 'assets/tarot/major-09.jpg' },
    { id: 10, name: 'Wheel of Fortune', arcana: 'major', imageUrl: 'assets/tarot/major-10.jpg' },
    { id: 11, name: 'Justice', arcana: 'major', imageUrl: 'assets/tarot/major-11.jpg' },
    { id: 12, name: 'The Hanged Man', arcana: 'major', imageUrl: 'assets/tarot/major-12.jpg' },
    { id: 13, name: 'Death', arcana: 'major', imageUrl: 'assets/tarot/major-13.jpg' },
    { id: 14, name: 'Temperance', arcana: 'major', imageUrl: 'assets/tarot/major-14.jpg' },
    { id: 15, name: 'The Devil', arcana: 'major', imageUrl: 'assets/tarot/major-15.jpg' },
    { id: 16, name: 'The Tower', arcana: 'major', imageUrl: 'assets/tarot/major-16.jpg' },
    { id: 17, name: 'The Star', arcana: 'major', imageUrl: 'assets/tarot/major-17.jpg' },
    { id: 18, name: 'The Moon', arcana: 'major', imageUrl: 'assets/tarot/major-18.jpg' },
    { id: 19, name: 'The Sun', arcana: 'major', imageUrl: 'assets/tarot/major-19.jpg' },
    { id: 20, name: 'Judgement', arcana: 'major', imageUrl: 'assets/tarot/major-20.jpg' },
    { id: 21, name: 'The World', arcana: 'major', imageUrl: 'assets/tarot/major-21.jpg' },
    
    // Minor Arcana - Wands (22-35) - 14 cards
    { id: 22, name: 'Ace of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-01.jpg' },
    { id: 23, name: 'Two of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-02.jpg' },
    { id: 24, name: 'Three of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-03.jpg' },
    { id: 25, name: 'Four of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-04.jpg' },
    { id: 26, name: 'Five of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-05.jpg' },
    { id: 27, name: 'Six of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-06.jpg' },
    { id: 28, name: 'Seven of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-07.jpg' },
    { id: 29, name: 'Eight of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-08.jpg' },
    { id: 30, name: 'Nine of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-09.jpg' },
    { id: 31, name: 'Ten of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-10.jpg' },
    { id: 32, name: 'Page of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-11.jpg' },
    { id: 33, name: 'Knight of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-12.jpg' },
    { id: 34, name: 'Queen of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-13.jpg' },
    { id: 35, name: 'King of Wands', arcana: 'minor', suit: 'wands', imageUrl: 'assets/tarot/wands-14.jpg' },
    
    // Minor Arcana - Cups (36-49) - 14 cards
    { id: 36, name: 'Ace of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-01.jpg' },
    { id: 37, name: 'Two of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-02.jpg' },
    { id: 38, name: 'Three of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-03.jpg' },
    { id: 39, name: 'Four of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-04.jpg' },
    { id: 40, name: 'Five of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-05.jpg' },
    { id: 41, name: 'Six of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-06.jpg' },
    { id: 42, name: 'Seven of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-07.jpg' },
    { id: 43, name: 'Eight of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-08.jpg' },
    { id: 44, name: 'Nine of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-09.jpg' },
    { id: 45, name: 'Ten of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-10.jpg' },
    { id: 46, name: 'Page of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-11.jpg' },
    { id: 47, name: 'Knight of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-12.jpg' },
    { id: 48, name: 'Queen of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-13.jpg' },
    { id: 49, name: 'King of Cups', arcana: 'minor', suit: 'cups', imageUrl: 'assets/tarot/cups-14.jpg' },
    
    // Minor Arcana - Swords (50-63) - 14 cards
    { id: 50, name: 'Ace of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-01.jpg' },
    { id: 51, name: 'Two of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-02.jpg' },
    { id: 52, name: 'Three of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-03.jpg' },
    { id: 53, name: 'Four of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-04.jpg' },
    { id: 54, name: 'Five of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-05.jpg' },
    { id: 55, name: 'Six of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-06.jpg' },
    { id: 56, name: 'Seven of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-07.jpg' },
    { id: 57, name: 'Eight of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-08.jpg' },
    { id: 58, name: 'Nine of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-09.jpg' },
    { id: 59, name: 'Ten of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-10.jpg' },
    { id: 60, name: 'Page of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-11.jpg' },
    { id: 61, name: 'Knight of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-12.jpg' },
    { id: 62, name: 'Queen of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-13.jpg' },
    { id: 63, name: 'King of Swords', arcana: 'minor', suit: 'swords', imageUrl: 'assets/tarot/swords-14.jpg' },
    
    // Minor Arcana - Pentacles (64-77) - 14 cards
    { id: 64, name: 'Ace of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-01.jpg' },
    { id: 65, name: 'Two of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-02.jpg' },
    { id: 66, name: 'Three of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-03.jpg' },
    { id: 67, name: 'Four of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-04.jpg' },
    { id: 68, name: 'Five of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-05.jpg' },
    { id: 69, name: 'Six of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-06.jpg' },
    { id: 70, name: 'Seven of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-07.jpg' },
    { id: 71, name: 'Eight of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-08.jpg' },
    { id: 72, name: 'Nine of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-09.jpg' },
    { id: 73, name: 'Ten of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-10.jpg' },
    { id: 74, name: 'Page of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-11.jpg' },
    { id: 75, name: 'Knight of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-12.jpg' },
    { id: 76, name: 'Queen of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-13.jpg' },
    { id: 77, name: 'King of Pentacles', arcana: 'minor', suit: 'pentacles', imageUrl: 'assets/tarot/pentacles-14.jpg' }
];

// Make deck available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TAROT_DECK };
}
