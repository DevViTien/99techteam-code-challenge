/**
 * Currency Swap Application
 * Fetches real-time exchange rates and handles currency swapping
 */

class CurrencySwapApp {
  constructor() {
    this.currencies = [];
    this.exchangeRates = new Map();
    this.selectedFromCurrency = null;
    this.selectedToCurrency = null;
    this.isLoading = false;

    // DOM elements
    this.elements = {
      loadingOverlay: document.getElementById("loading-overlay"),
      fromCurrencyBtn: document.getElementById("from-currency-btn"),
      fromCurrencyIcon: document.getElementById("from-currency-icon"),
      fromCurrencyText: document.getElementById("from-currency-text"),
      fromCurrencyDropdown: document.getElementById("from-currency-dropdown"),
      fromCurrencyList: document.getElementById("from-currency-list"),
      fromAmount: document.getElementById("from-amount"),
      fromBalance: document.getElementById("from-balance"),
      fromError: document.getElementById("from-error"),

      toCurrencyBtn: document.getElementById("to-currency-btn"),
      toCurrencyIcon: document.getElementById("to-currency-icon"),
      toCurrencyText: document.getElementById("to-currency-text"),
      toCurrencyDropdown: document.getElementById("to-currency-dropdown"),
      toCurrencyList: document.getElementById("to-currency-list"),
      toAmount: document.getElementById("to-amount"),

      swapCurrencies: document.getElementById("swap-currencies"),
      exchangeRate: document.getElementById("exchange-rate"),
      confirmSwapBtn: document.getElementById("confirm-swap-btn"),
      confirmBtnText: document.getElementById("confirm-btn-text"),
      confirmBtnLoading: document.getElementById("confirm-btn-loading"),

      swapForm: document.getElementById("swap-form"),
      successMessage: document.getElementById("success-message"),
      errorMessage: document.getElementById("error-message"),
      errorText: document.getElementById("error-text"),
    };

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    this.bindEvents();
    await this.loadExchangeRates();
    this.populateCurrencyDropdowns();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Currency dropdown toggles
    this.elements.fromCurrencyBtn.addEventListener("click", () =>
      this.toggleDropdown("from")
    );
    this.elements.toCurrencyBtn.addEventListener("click", () =>
      this.toggleDropdown("to")
    );

    // Amount input changes
    this.elements.fromAmount.addEventListener("input", () =>
      this.calculateExchange()
    );
    this.elements.fromAmount.addEventListener("blur", () =>
      this.validateAmount()
    );

    // Swap currencies button
    this.elements.swapCurrencies.addEventListener("click", () =>
      this.swapCurrencies()
    );

    // Form submission
    this.elements.swapForm.addEventListener("submit", (e) =>
      this.handleSwapSubmit(e)
    );

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => this.handleOutsideClick(e));

    // Keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
  }

  /**
   * Load exchange rates from API
   */
  async loadExchangeRates() {
    this.showLoading(true);

    try {
      const response = await fetch(
        "https://interview.switcheo.com/prices.json"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.processExchangeRates(data);
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      this.showError("Failed to load exchange rates. Using fallback data.");
      this.loadFallbackRates();
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Process raw exchange rate data
   */
  processExchangeRates(data) {
    const currencyMap = new Map();

    // Group by currency and get the latest price
    data.forEach((item) => {
      if (
        !currencyMap.has(item.currency) ||
        new Date(item.date) > new Date(currencyMap.get(item.currency).date)
      ) {
        currencyMap.set(item.currency, item);
      }
    });

    // Convert to array and filter out invalid prices
    this.currencies = Array.from(currencyMap.values())
      .filter((item) => item.price > 0)
      .sort((a, b) => a.currency.localeCompare(b.currency));

    // Create exchange rates map
    this.exchangeRates.clear();
    this.currencies.forEach((item) => {
      this.exchangeRates.set(item.currency, item.price);
    });

    console.log(`Loaded ${this.currencies.length} currencies`);
  }

  /**
   * Load fallback exchange rates for testing
   */
  loadFallbackRates() {
    const fallbackData = [
      { currency: "USD", price: 1, date: new Date().toISOString() },
      { currency: "ETH", price: 1645.93, date: new Date().toISOString() },
      { currency: "USDC", price: 1, date: new Date().toISOString() },
      { currency: "WBTC", price: 26002.82, date: new Date().toISOString() },
      { currency: "ATOM", price: 7.18, date: new Date().toISOString() },
    ];

    this.processExchangeRates(fallbackData);
  }

  /**
   * Populate currency dropdowns
   */
  populateCurrencyDropdowns() {
    this.elements.fromCurrencyList.innerHTML = "";
    this.elements.toCurrencyList.innerHTML = "";

    this.currencies.forEach((currency) => {
      const fromItem = this.createCurrencyItem(currency, "from");
      const toItem = this.createCurrencyItem(currency, "to");

      this.elements.fromCurrencyList.appendChild(fromItem);
      this.elements.toCurrencyList.appendChild(toItem);
    });
  }
  /**
   * Create currency dropdown item
   */
  createCurrencyItem(currency, type) {
    const item = document.createElement("div");
    item.className =
      "currency-item px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0";

    const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency.currency}.svg`;

    item.innerHTML = `
      <div class="flex items-center space-x-3 max-w-full overflow-hidden">
        <img src="${iconUrl}" alt="${
      currency.currency
    }" class="w-6 h-6 rounded-full flex-shrink-0" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2Y5ZmFmYiIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjM3Mzk0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pjwvc3ZnPg=='">
        <div class="flex-1 min-w-0 overflow-hidden">
          <div class="font-medium text-gray-900 truncate">${
            currency.currency
          }</div>
          <div class="text-sm text-gray-500 truncate">$${this.formatPrice(
            currency.price
          )}</div>
        </div>
      </div>
    `;

    item.addEventListener("click", () => this.selectCurrency(currency, type));

    return item;
  }

  /**
   * Select a currency
   */
  selectCurrency(currency, type) {
    if (type === "from") {
      this.selectedFromCurrency = currency;
      this.updateCurrencyButton("from", currency);
      this.elements.fromBalance.textContent = `Balance: 1,000.00 ${currency.currency}`;
    } else {
      this.selectedToCurrency = currency;
      this.updateCurrencyButton("to", currency);
    }

    this.toggleDropdown(type, false);
    this.calculateExchange();
    this.updateConfirmButton();
    this.clearMessages();
  }

  /**
   * Update currency button display
   */
  updateCurrencyButton(type, currency) {
    const iconEl = this.elements[`${type}CurrencyIcon`];
    const textEl = this.elements[`${type}CurrencyText`];

    const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency.currency}.svg`;

    iconEl.src = iconUrl;
    iconEl.alt = currency.currency;
    iconEl.classList.remove("hidden");
    textEl.textContent = currency.currency;
    textEl.classList.remove("text-gray-500");
    textEl.classList.add("text-gray-900", "font-medium");

    // Handle icon load error
    iconEl.onerror = () => {
      iconEl.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2Y5ZmFmYiIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjNjM3Mzk0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/PC90ZXh0Pjwvc3ZnPg==";
    };
  }

  /**
   * Toggle currency dropdown
   */
  toggleDropdown(type, show = null) {
    const dropdown = this.elements[`${type}CurrencyDropdown`];
    const isVisible = !dropdown.classList.contains("hidden");

    // Close all dropdowns first
    this.elements.fromCurrencyDropdown.classList.add("hidden");
    this.elements.toCurrencyDropdown.classList.add("hidden");

    if (show === null) {
      show = !isVisible;
    }

    if (show) {
      dropdown.classList.remove("hidden");
      dropdown.style.animation = "fadeIn 0.2s ease-out";
    }
  }

  /**
   * Calculate exchange amount
   */
  calculateExchange() {
    if (
      !this.selectedFromCurrency ||
      !this.selectedToCurrency ||
      !this.elements.fromAmount.value
    ) {
      this.elements.toAmount.value = "";
      this.elements.exchangeRate.textContent = "";
      return;
    }

    const fromAmount = parseFloat(this.elements.fromAmount.value);
    if (isNaN(fromAmount) || fromAmount <= 0) {
      this.elements.toAmount.value = "";
      this.elements.exchangeRate.textContent = "";
      return;
    }

    const fromPrice = this.exchangeRates.get(
      this.selectedFromCurrency.currency
    );
    const toPrice = this.exchangeRates.get(this.selectedToCurrency.currency);

    if (!fromPrice || !toPrice) {
      this.elements.toAmount.value = "";
      this.elements.exchangeRate.textContent = "";
      return;
    }

    // Calculate exchange: (fromAmount * fromPrice) / toPrice
    const exchangeRate = fromPrice / toPrice;
    const toAmount = fromAmount * exchangeRate;

    this.elements.toAmount.value = this.formatAmount(toAmount);
    this.elements.exchangeRate.textContent = `1 ${
      this.selectedFromCurrency.currency
    } = ${this.formatAmount(exchangeRate)} ${this.selectedToCurrency.currency}`;
  }

  /**
   * Swap the selected currencies
   */
  swapCurrencies() {
    if (!this.selectedFromCurrency || !this.selectedToCurrency) return;

    // Add animation
    this.elements.swapCurrencies.style.transform = "rotate(180deg)";
    setTimeout(() => {
      this.elements.swapCurrencies.style.transform = "";
    }, 300);

    // Swap currencies
    const temp = this.selectedFromCurrency;
    this.selectedFromCurrency = this.selectedToCurrency;
    this.selectedToCurrency = temp;

    // Update UI
    this.updateCurrencyButton("from", this.selectedFromCurrency);
    this.updateCurrencyButton("to", this.selectedToCurrency);

    // Update balance
    this.elements.fromBalance.textContent = `Balance: 1,000.00 ${this.selectedFromCurrency.currency}`;

    // Recalculate
    this.calculateExchange();
  }

  /**
   * Validate amount input
   */
  validateAmount() {
    const amount = parseFloat(this.elements.fromAmount.value);
    const maxBalance = 1000; // Mock balance

    this.elements.fromError.classList.add("hidden");
    this.elements.fromAmount.classList.remove("border-danger");

    if (this.elements.fromAmount.value && (isNaN(amount) || amount <= 0)) {
      this.showFieldError("from", "Please enter a valid amount");
      return false;
    }

    if (amount > maxBalance) {
      this.showFieldError("from", "Insufficient balance");
      return false;
    }

    return true;
  }

  /**
   * Show field error
   */
  showFieldError(field, message) {
    const errorEl = this.elements[`${field}Error`];
    const inputEl = field === "from" ? this.elements.fromAmount : null;

    if (inputEl) {
      inputEl.classList.add("border-danger");
      inputEl.classList.add("shake");
      setTimeout(() => inputEl.classList.remove("shake"), 500);
    }

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  /**
   * Update confirm button state
   */
  updateConfirmButton() {
    const isValid =
      this.selectedFromCurrency &&
      this.selectedToCurrency &&
      this.elements.fromAmount.value &&
      parseFloat(this.elements.fromAmount.value) > 0;

    if (isValid) {
      this.elements.confirmSwapBtn.disabled = false;
      this.elements.confirmSwapBtn.className =
        "w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-primary focus:ring-opacity-50";
    } else {
      this.elements.confirmSwapBtn.disabled = true;
      this.elements.confirmSwapBtn.className =
        "w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed";
    }
  }

  /**
   * Handle swap form submission
   */
  async handleSwapSubmit(e) {
    e.preventDefault();

    if (!this.validateAmount() || this.isLoading) return;

    this.isLoading = true;
    this.showSubmitLoading(true);
    this.clearMessages();

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure (90% success rate for demo)
      if (Math.random() > 0.1) {
        this.showSuccess();
        this.resetForm();
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.isLoading = false;
      this.showSubmitLoading(false);
    }
  }

  /**
   * Show/hide main loading overlay
   */
  showLoading(show) {
    if (show) {
      this.elements.loadingOverlay.classList.remove("hidden");
      this.elements.loadingOverlay.classList.add("flex");
    } else {
      this.elements.loadingOverlay.classList.add("hidden");
      this.elements.loadingOverlay.classList.remove("flex");
    }
  }

  /**
   * Show/hide submit button loading
   */
  showSubmitLoading(show) {
    if (show) {
      this.elements.confirmBtnText.classList.add("hidden");
      this.elements.confirmBtnLoading.classList.remove("hidden");
      this.elements.confirmBtnLoading.classList.add("flex");
      this.elements.confirmSwapBtn.disabled = true;
    } else {
      this.elements.confirmBtnText.classList.remove("hidden");
      this.elements.confirmBtnLoading.classList.add("hidden");
      this.elements.confirmBtnLoading.classList.remove("flex");
      this.updateConfirmButton();
    }
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.elements.successMessage.classList.remove("hidden");
    this.elements.successMessage.classList.add("bounce-in");
    setTimeout(() => {
      this.elements.successMessage.classList.add("hidden");
      this.elements.successMessage.classList.remove("bounce-in");
    }, 5000);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.elements.errorText.textContent = message;
    this.elements.errorMessage.classList.remove("hidden");
    setTimeout(() => {
      this.elements.errorMessage.classList.add("hidden");
    }, 5000);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.elements.successMessage.classList.add("hidden");
    this.elements.errorMessage.classList.add("hidden");
    this.elements.fromError.classList.add("hidden");
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    this.elements.fromAmount.value = "";
    this.elements.toAmount.value = "";
    this.elements.exchangeRate.textContent = "";
    this.updateConfirmButton();
  }

  /**
   * Handle clicks outside dropdowns
   */
  handleOutsideClick(e) {
    if (
      !e.target.closest("#from-currency-btn") &&
      !e.target.closest("#from-currency-dropdown")
    ) {
      this.elements.fromCurrencyDropdown.classList.add("hidden");
    }
    if (
      !e.target.closest("#to-currency-btn") &&
      !e.target.closest("#to-currency-dropdown")
    ) {
      this.elements.toCurrencyDropdown.classList.add("hidden");
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.elements.fromCurrencyDropdown.classList.add("hidden");
      this.elements.toCurrencyDropdown.classList.add("hidden");
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price) {
    if (price >= 1) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } else {
      return parseFloat(price.toPrecision(6)).toString();
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount) {
    if (amount >= 1) {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(amount);
    } else {
      return parseFloat(amount.toPrecision(8)).toString();
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CurrencySwapApp();
});
