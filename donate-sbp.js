/**
 * SBP (Система быстрых платежей) Donation System
 * Fast Russian bank payment system integration
 * 
 * Usage:
 * const sbp = new SBPDonationSystem({
 *   phoneNumber: '+79991234567',
 *   organizationName: 'Фонд «Кюнлюм Эль»'
 * });
 */

class SBPDonationSystem {
  constructor(options = {}) {
    // Organization settings
    this.phoneNumber = options.phoneNumber || '+79991234567';
    this.organizationName = options.organizationName || 'Фонд «Кюнлюм Эль»';
    this.merchantId = options.merchantId || '';
    
    // Payment state
    this.currentAmount = 500;
    this.donorName = '';
    this.donateComment = '';
    
    // DOM elements
    this.elements = {};
    
    // Initialize
    this.initElements();
    this.attachEventListeners();
    this.generateInitialQR();
  }

  /**
   * Initialize all DOM elements
   */
  initElements() {
    this.elements = {
      // Amount selection
      chipButtons: document.querySelectorAll('.chip'),
      customAmountInput: document.getElementById('customAmount'),
      
      // Donor information
      donorNameInput: document.getElementById('donorName'),
      donateCommentInput: document.getElementById('donateComment'),
      
      // QR code display
      sbpQrImage: document.getElementById('sbpQr'),
      qrAmountDisplay: document.getElementById('qrAmount'),
      qrContainer: document.getElementById('sbpQrContainer'),
      
      // Buttons
      downloadQrBtn: document.getElementById('downloadQrBtn'),
      
      // Success message
      successMessage: document.getElementById('donateSuccess')
    };
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Amount selection buttons
    if (this.elements.chipButtons) {
      this.elements.chipButtons.forEach(chip => {
        chip.addEventListener('click', (e) => this.selectAmount(e));
      });
    }

    // Custom amount input
    if (this.elements.customAmountInput) {
      this.elements.customAmountInput.addEventListener('input', (e) => {
        const amount = parseInt(e.target.value);
        if (amount > 0) {
          this.updateAmount(amount);
        }
      });
    }

    // Donor information inputs
    if (this.elements.donorNameInput) {
      this.elements.donorNameInput.addEventListener('input', (e) => {
        this.donorName = e.target.value;
      });
    }

    if (this.elements.donateCommentInput) {
      this.elements.donateCommentInput.addEventListener('input', (e) => {
        this.donateComment = e.target.value;
        // Regenerate QR with new description
        this.generateQR();
      });
    }

    // Download QR button
    if (this.elements.downloadQrBtn) {
      this.elements.downloadQrBtn.addEventListener('click', () => this.downloadQR());
    }

    // Check for payment return from bank
    this.checkPaymentReturn();
  }

  /**
   * Handle amount chip selection
   */
  selectAmount(e) {
    const amount = parseInt(e.target.dataset.amount);
    if (!isNaN(amount) && amount > 0) {
      this.updateAmount(amount);
      // Clear custom input
      if (this.elements.customAmountInput) {
        this.elements.customAmountInput.value = '';
      }
    }
  }

  /**
   * Update donation amount
   */
  updateAmount(amount) {
    if (amount < 1) {
      this.showError('Сумма должна быть не менее 1 ₽');
      return;
    }

    this.currentAmount = amount;
    
    // Update display
    if (this.elements.qrAmountDisplay) {
      this.elements.qrAmountDisplay.textContent = `${this.formatAmount(amount)} ₽`;
    }

    // Update chip states
    this.updateChipStates();

    // Regenerate QR code
    this.generateQR();
  }

  /**
   * Update chip button active states
   */
  updateChipStates() {
    this.elements.chipButtons.forEach(chip => {
      const chipAmount = parseInt(chip.dataset.amount);
      const isActive = chipAmount === this.currentAmount;
      chip.classList.toggle('chip--active', isActive);
    });
  }

  /**
   * Format amount with thousands separator
   */
  formatAmount(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /**
   * Generate QR code for current amount
   */
  async generateQR() {
    if (!this.elements.sbpQrImage || !this.elements.qrContainer) {
      return;
    }

    try {
      // Show loading state
      this.elements.qrContainer.style.opacity = '0.5';
      this.elements.sbpQrImage.style.pointerEvents = 'none';

      // Build SBP URL
      const sbpUrl = this.buildSBPUrl();

      // Generate QR code using free API
      const qrImageUrl = this.generateQRImageUrl(sbpUrl);

      // Set image
      this.elements.sbpQrImage.src = qrImageUrl;
      this.elements.sbpQrImage.alt = `SBP платеж ${this.currentAmount} ₽ фонду "${this.organizationName}"`;

      // Remove loading state
      this.elements.qrContainer.style.opacity = '1';
      this.elements.sbpQrImage.style.pointerEvents = 'auto';

    } catch (error) {
      console.error('QR code generation error:', error);
      this.showError('Ошибка при генерации QR кода. Попробуйте позже.');
    }
  }

  /**
   * Generate initial QR when page loads
   */
  generateInitialQR() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.generateQR(), 500);
      });
    } else {
      setTimeout(() => this.generateQR(), 500);
    }
  }

  /**
   * Build SBP payment URL
   * Format: sbp://payee/phone/{phone}?amount={kopeks}&currency=RUB&name={name}&description={description}
   */
  buildSBPUrl() {
    const amountKopeks = this.currentAmount * 100;
    const phone = this.phoneNumber.replace(/\D/g, ''); // Remove all non-digits

    // Build description
    let description = 'Пожертвование';
    if (this.donateComment) {
      description = this.donateComment;
    }

    // Build SBP URL
    const sbpUrl = `sbp://payee/phone/${phone}?` +
      `amount=${amountKopeks}&` +
      `currency=RUB&` +
      `name=${encodeURIComponent(this.organizationName)}&` +
      `description=${encodeURIComponent(description)}`;

    return sbpUrl;
  }

  /**
   * Generate QR code image URL using free service
   * Using api.qrserver.com - no registration needed
   */
  generateQRImageUrl(dataUrl) {
    const encodedData = encodeURIComponent(dataUrl);
    // QR Server API - free and reliable
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodedData}`;
  }

  /**
   * Download QR code as PNG
   */
  downloadQR() {
    if (!this.elements.sbpQrImage || !this.elements.sbpQrImage.src) {
      this.showError('QR код не загружен. Попробуйте еще раз.');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = this.elements.sbpQrImage.src;
      link.download = `sbp-donate-${this.currentAmount}rub.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      this.showError('Ошибка при скачивании QR кода.');
    }
  }

  /**
   * Check if returning from successful payment
   */
  checkPaymentReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' || params.get('donate') === 'success') {
      this.showSuccessMessage();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    if (!this.elements.successMessage) {
      return;
    }

    // Make visible
    this.elements.successMessage.style.display = 'block';
    this.elements.successMessage.style.opacity = '1';

    // Scroll to message
    this.elements.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (this.elements.successMessage) {
        this.elements.successMessage.style.transition = 'opacity 0.3s ease';
        this.elements.successMessage.style.opacity = '0';
        
        setTimeout(() => {
          if (this.elements.successMessage) {
            this.elements.successMessage.style.display = 'none';
          }
        }, 300);
      }
    }, 10000);
  }

  /**
   * Show error message
   */
  showError(message) {
    // You could implement a toast/error display here
    console.error('SBP Error:', message);
    
    // Simple alert fallback
    // Uncomment if you want user-facing errors:
    // alert(message);
  }

  /**
   * Get current payment state (for logging/debugging)
   */
  getPaymentState() {
    return {
      amount: this.currentAmount,
      phone: this.phoneNumber,
      organization: this.organizationName,
      donor: this.donorName,
      comment: this.donateComment,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log payment attempt (for analytics)
   */
  logPaymentAttempt() {
    const state = this.getPaymentState();
    console.log('Payment attempt:', state);
    
    // You can send to your analytics service
    // fetch('/api/log-payment', { method: 'POST', body: JSON.stringify(state) });
  }
}

/**
 * Initialize SBP Donation System when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  // Create global instance
  window.sbpDonation = new SBPDonationSystem({
    phoneNumber: '+79991234567', // Replace with actual phone number
    organizationName: 'Фонд «Кюнлюм Эль»'
  });

  console.log('✅ SBP Donation System initialized');
  console.log('Phone:', window.sbpDonation.phoneNumber);
  console.log('Organization:', window.sbpDonation.organizationName);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SBPDonationSystem;
}
