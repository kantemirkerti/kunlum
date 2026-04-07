/**
 * Family Cards Expansion Handler
 * Makes expanded cards feel like modals while keeping horizontal scroll for closed cards
 */

class FamilyCardsHandler {
  constructor() {
    this.familyCards = document.querySelectorAll('.familyCard--compact');
    this.init();
  }

  init() {
    this.familyCards.forEach(card => {
      card.addEventListener('toggle', (e) => {
        if (e.newState === 'open') {
          this.handleCardOpen(card);
        } else {
          this.handleCardClose(card);
        }
      });
    });
  }

  handleCardOpen(card) {
    // Close any other open cards
    this.familyCards.forEach(c => {
      if (c !== card && c.open) {
        c.open = false;
      }
    });

    // Scroll the expanded card into view
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  handleCardClose(card) {
    // Any cleanup if needed
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FamilyCardsHandler();
});
