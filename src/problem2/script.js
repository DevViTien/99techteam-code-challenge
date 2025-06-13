/**
 * Currency Swap Application
 * A comprehensive currency exchange application that fetches real-time rates
 * and provides an intuitive interface for currency swapping
 *
 * @class CurrencySwapApp
 * @author 99Tech Team
 * @version 1.0.0
 */
class CurrencySwapApp {
  // Class constants
  static API_ENDPOINT = "https://interview.switcheo.com/prices.json";
  static MOCK_BALANCE = 1000;
  static SUCCESS_RATE = 0.9;
  static ANIMATION_DURATION = 300;
  static MESSAGE_DISPLAY_DURATION = 5000;
  static LOADING_DELAY = 2000;

  // Icon mapping for special currency names
  static ICON_MAPPINGS = {
    STATOM: "stATOM",
    STOSMO: "stOSMO",
    STLUNA: "stLUNA",
    STEVMOS: "stEVMOS",
    RATOM: "rATOM",
    ampLUNA: "ampLUNA",
    axlUSDC: "axlUSDC",
    bNEO: "bNEO",
    rSWTH: "rSWTH",
    wstETH: "wstETH",
  };

  /**
   * Initialize the Currency Swap Application
   * Sets up initial state, caches DOM elements, and starts the application
   */
  constructor() {
    this.state = {
      currencies: [],
      exchangeRates: new Map(),
      selectedFromCurrency: null,
      selectedToCurrency: null,
      isLoading: false,
      isSubmitting: false,
    };

    this.elements = this.#cacheDOMElements();
    this.#validateRequiredElements();
    this.#initialize();
  }

  /**
   * Cache all required DOM elements for better performance
   * @private
   * @returns {Object} Object containing all cached DOM elements
   */
  #cacheDOMElements() {
    const elementIds = [
      "loading-overlay",
      "from-currency-btn",
      "from-currency-icon",
      "from-currency-text",
      "from-currency-dropdown",
      "from-currency-list",
      "from-amount",
      "from-balance",
      "from-error",
      "to-currency-btn",
      "to-currency-icon",
      "to-currency-text",
      "to-currency-dropdown",
      "to-currency-list",
      "to-amount",
      "swap-currencies",
      "exchange-rate",
      "confirm-swap-btn",
      "confirm-btn-text",
      "confirm-btn-loading",
      "swap-form",
      "success-message",
      "error-message",
      "error-text",
    ];

    return elementIds.reduce((acc, id) => {
      const camelCaseId = id.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      acc[camelCaseId] = document.getElementById(id);
      return acc;
    }, {});
  }

  /**
   * Validate that all required DOM elements exist
   * @private
   * @throws {Error} If any required element is missing
   */
  #validateRequiredElements() {
    const missingElements = Object.entries(this.elements)
      .filter(([_, element]) => !element)
      .map(([key, _]) => key);

    if (missingElements.length > 0) {
      throw new Error(
        `Missing required DOM elements: ${missingElements.join(", ")}`
      );
    }
  }

  /**
   * Initialize the application
   * @private
   */ async #initialize() {
    try {
      this.#bindEventListeners();
      await this.#loadExchangeRates();
      this.populateCurrencyDropdowns();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError("Failed to initialize application");
    }
  }
  /**
   * Bind all event listeners
   * @private
   */
  #bindEventListeners() {
    // Currency dropdown toggles
    this.elements.fromCurrencyBtn.addEventListener("click", () =>
      this.toggleDropdown("from")
    );
    this.elements.toCurrencyBtn.addEventListener("click", () =>
      this.toggleDropdown("to")
    );

    // Amount input handlers
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

    // Global event handlers
    document.addEventListener("click", (e) => this.handleOutsideClick(e));
    document.addEventListener("keydown", (e) => this.handleKeydown(e));
  }

  /**
   * Load exchange rates from API with fallback handling
   * @private
   */
  async #loadExchangeRates() {
    this.showLoading(true);

    try {
      const response = await fetch(CurrencySwapApp.API_ENDPOINT);
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
   * Process and normalize raw exchange rate data
   * Groups currencies by name, keeps latest prices, and builds exchange rate map
   * @param {Array} data - Raw exchange rate data from API
   */
  processExchangeRates(data) {
    const currencyMap = new Map();

    // Group by currency and keep only the latest price
    data.forEach((item) => {
      const currentItem = currencyMap.get(item.currency);
      if (!currentItem || new Date(item.date) > new Date(currentItem.date)) {
        currencyMap.set(item.currency, item);
      }
    });

    // Filter valid prices and sort alphabetically
    this.state.currencies = Array.from(currencyMap.values())
      .filter((item) => item.price > 0)
      .sort((a, b) => a.currency.localeCompare(b.currency));

    // Build exchange rates map for quick lookup
    this.state.exchangeRates.clear();
    this.state.currencies.forEach((item) => {
      this.state.exchangeRates.set(item.currency, item.price);
    });

    console.log(
      `Successfully loaded ${this.state.currencies.length} currencies`
    );
  }
  /**
   * Load fallback exchange rates for offline/error scenarios
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
   * Normalize currency name for icon URLs
   * Handles special cases where API currency names don't match icon file names
   * @param {string} currency - Currency symbol
   * @returns {string} Normalized currency name for icon URL
   */
  normalizeCurrencyForIcon(currency) {
    return CurrencySwapApp.ICON_MAPPINGS[currency] || currency;
  }
  /**
   * Get icon URL for currency with proper normalization
   * @param {string} currency - Currency symbol
   * @returns {string} Icon URL
   */
  getCurrencyIconUrl(currency) {
    const normalizedCurrency = this.normalizeCurrencyForIcon(currency);
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${normalizedCurrency}.svg`;
  }

  /**
   * Create fallback icon SVG when main icon fails to load
   * @param {string} currency - Currency symbol
   * @returns {string} Base64 encoded SVG data URL
   */
  createFallbackIcon(currency) {
    const firstLetter = currency.charAt(0).toUpperCase();
    const svgContent = `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
        <text x="12" y="16" font-family="Arial, sans-serif" font-size="10" fill="#6b7280" text-anchor="middle" font-weight="bold">${firstLetter}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }
  /**
   * Populate both currency dropdowns with available currencies
   */
  populateCurrencyDropdowns() {
    // Clear existing items
    this.elements.fromCurrencyList.innerHTML = "";
    this.elements.toCurrencyList.innerHTML = "";

    // Create dropdown items for each currency
    this.state.currencies.forEach((currency) => {
      const fromItem = this.createCurrencyItem(currency, "from");
      const toItem = this.createCurrencyItem(currency, "to");

      this.elements.fromCurrencyList.appendChild(fromItem);
      this.elements.toCurrencyList.appendChild(toItem);
    });
  }
  /**
   * Create a single currency dropdown item with icon and price
   * @param {Object} currency - Currency object with currency and price properties
   * @param {string} type - Either "from" or "to"
   * @returns {HTMLElement} Currency item element
   */
  createCurrencyItem(currency, type) {
    const item = document.createElement("div");
    item.className =
      "currency-item px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150";

    const iconUrl = this.getCurrencyIconUrl(currency.currency);
    const fallbackIcon = this.createFallbackIcon(currency.currency);

    item.innerHTML = `
      <div class="flex items-center space-x-3 max-w-full overflow-hidden">
        <img src="${iconUrl}" alt="${currency.currency}" 
             class="w-6 h-6 rounded-full flex-shrink-0" 
             onerror="this.src='${fallbackIcon}'">
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

    // Add click handler
    item.addEventListener("click", () => this.selectCurrency(currency, type));

    // Add keyboard accessibility
    item.setAttribute("tabindex", "0");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.selectCurrency(currency, type);
      }
    });

    return item;
  }
  /**
   * Handle currency selection
   * @param {Object} currency - Selected currency object
   * @param {string} type - Either "from" or "to"
   */
  selectCurrency(currency, type) {
    if (type === "from") {
      this.state.selectedFromCurrency = currency;
      this.updateCurrencyButton("from", currency);
      this.elements.fromBalance.textContent = `Balance: ${this.formatAmount(
        CurrencySwapApp.MOCK_BALANCE
      )} ${currency.currency}`;
    } else {
      this.state.selectedToCurrency = currency;
      this.updateCurrencyButton("to", currency);
    }

    this.toggleDropdown(type, false);
    this.calculateExchange();
    this.updateConfirmButton();
    this.clearMessages();
  }
  /**
   * Update currency button display after selection
   * @param {string} type - Either "from" or "to"
   * @param {Object} currency - Currency object
   */
  updateCurrencyButton(type, currency) {
    const iconEl = this.elements[`${type}CurrencyIcon`];
    const textEl = this.elements[`${type}CurrencyText`];

    const iconUrl = this.getCurrencyIconUrl(currency.currency);
    const fallbackIcon = this.createFallbackIcon(currency.currency);

    iconEl.src = iconUrl;
    iconEl.alt = currency.currency;
    iconEl.classList.remove("hidden");
    textEl.textContent = currency.currency;
    textEl.classList.remove("text-gray-500");
    textEl.classList.add("text-gray-900", "font-medium");

    // Handle icon load error with fallback
    iconEl.onerror = () => {
      iconEl.src = fallbackIcon;
      iconEl.onerror = null; // Prevent infinite loop
    };
  }
  /**
   * Toggle dropdown visibility
   * @param {string} type - Either "from" or "to"
   * @param {boolean|null} show - Force show/hide state, null for toggle
   */
  toggleDropdown(type, show = null) {
    const dropdown = this.elements[`${type}CurrencyDropdown`];
    const isVisible = !dropdown.classList.contains("hidden");

    // Close all dropdowns first
    this.elements.fromCurrencyDropdown.classList.add("hidden");
    this.elements.toCurrencyDropdown.classList.add("hidden");

    const shouldShow = show !== null ? show : !isVisible;

    if (shouldShow) {
      dropdown.classList.remove("hidden");
      dropdown.style.animation = `fadeIn ${
        CurrencySwapApp.ANIMATION_DURATION / 1000
      }s ease-out`;
    }
  }
  /**
   * Calculate and display exchange amount and rate
   */
  calculateExchange() {
    // Clear outputs if prerequisites are missing
    if (
      !this.state.selectedFromCurrency ||
      !this.state.selectedToCurrency ||
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

    const fromPrice = this.state.exchangeRates.get(
      this.state.selectedFromCurrency.currency
    );
    const toPrice = this.state.exchangeRates.get(
      this.state.selectedToCurrency.currency
    );

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
      this.state.selectedFromCurrency.currency
    } = ${this.formatAmount(exchangeRate)} ${
      this.state.selectedToCurrency.currency
    }`;
  }
  /**
   * Swap the selected currencies with animation
   */
  swapCurrencies() {
    if (!this.state.selectedFromCurrency || !this.state.selectedToCurrency)
      return;

    // Add rotation animation
    this.elements.swapCurrencies.style.transform = "rotate(180deg)";
    setTimeout(() => {
      this.elements.swapCurrencies.style.transform = "";
    }, CurrencySwapApp.ANIMATION_DURATION);

    // Swap currency states
    [this.state.selectedFromCurrency, this.state.selectedToCurrency] = [
      this.state.selectedToCurrency,
      this.state.selectedFromCurrency,
    ];

    // Update UI
    this.updateCurrencyButton("from", this.state.selectedFromCurrency);
    this.updateCurrencyButton("to", this.state.selectedToCurrency);

    // Update balance display
    this.elements.fromBalance.textContent = `Balance: ${this.formatAmount(
      CurrencySwapApp.MOCK_BALANCE
    )} ${this.state.selectedFromCurrency.currency}`;

    // Recalculate exchange
    this.calculateExchange();
  }
  /**
   * Validate amount input against balance and format constraints
   * @returns {boolean} True if amount is valid
   */
  validateAmount() {
    const amount = parseFloat(this.elements.fromAmount.value);

    // Clear previous errors
    this.elements.fromError.classList.add("hidden");
    this.elements.fromAmount.classList.remove("border-danger");

    // Validate amount format
    if (this.elements.fromAmount.value && (isNaN(amount) || amount <= 0)) {
      this.showFieldError("from", "Please enter a valid amount");
      return false;
    }

    // Validate sufficient balance
    if (amount > CurrencySwapApp.MOCK_BALANCE) {
      this.showFieldError("from", "Insufficient balance");
      return false;
    }

    return true;
  }
  /**
   * Show field-specific error message
   * @param {string} field - Field identifier
   * @param {string} message - Error message to display
   */
  showFieldError(field, message) {
    const errorEl = this.elements[`${field}Error`];
    const inputEl = field === "from" ? this.elements.fromAmount : null;

    if (inputEl) {
      inputEl.classList.add("border-danger", "shake");
      setTimeout(() => inputEl.classList.remove("shake"), 500);
    }

    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
  /**
   * Update confirm button state based on form validity
   */
  updateConfirmButton() {
    const isValid =
      this.state.selectedFromCurrency &&
      this.state.selectedToCurrency &&
      this.elements.fromAmount.value &&
      parseFloat(this.elements.fromAmount.value) > 0;

    this.elements.confirmSwapBtn.disabled = !isValid;

    if (isValid) {
      this.elements.confirmSwapBtn.className =
        "w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-primary focus:ring-opacity-50";
    } else {
      this.elements.confirmSwapBtn.className =
        "w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:cursor-not-allowed";
    }
  }
  /**
   * Handle swap form submission with loading states and error handling
   * @param {Event} e - Form submit event
   */
  async handleSwapSubmit(e) {
    e.preventDefault();

    if (!this.validateAmount() || this.state.isSubmitting) return;

    this.state.isSubmitting = true;
    this.showSubmitLoading(true);
    this.clearMessages();

    try {
      // Simulate API call delay
      await new Promise((resolve) =>
        setTimeout(resolve, CurrencySwapApp.LOADING_DELAY)
      );

      // Simulate transaction success/failure
      if (Math.random() > 1 - CurrencySwapApp.SUCCESS_RATE) {
        this.showSuccess();
        this.resetForm();
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.state.isSubmitting = false;
      this.showSubmitLoading(false);
    }
  }
  /**
   * Show/hide main loading overlay
   * @param {boolean} show - Whether to show loading
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
   * Show/hide submit button loading state
   * @param {boolean} show - Whether to show loading
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
   * Show success message with auto-hide
   */
  showSuccess() {
    this.elements.successMessage.classList.remove("hidden");
    this.elements.successMessage.classList.add("bounce-in");

    setTimeout(() => {
      this.elements.successMessage.classList.add("hidden");
      this.elements.successMessage.classList.remove("bounce-in");
    }, CurrencySwapApp.MESSAGE_DISPLAY_DURATION);
  }

  /**
   * Show error message with auto-hide
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.elements.errorText.textContent = message;
    this.elements.errorMessage.classList.remove("hidden");

    setTimeout(() => {
      this.elements.errorMessage.classList.add("hidden");
    }, CurrencySwapApp.MESSAGE_DISPLAY_DURATION);
  }
  /**
   * Clear all displayed messages
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
   * Handle clicks outside dropdowns to close them
   * @param {Event} e - Click event
   */
  handleOutsideClick(e) {
    const fromButton = "#from-currency-btn";
    const fromDropdown = "#from-currency-dropdown";
    const toButton = "#to-currency-btn";
    const toDropdown = "#to-currency-dropdown";

    if (!e.target.closest(fromButton) && !e.target.closest(fromDropdown)) {
      this.elements.fromCurrencyDropdown.classList.add("hidden");
    }

    if (!e.target.closest(toButton) && !e.target.closest(toDropdown)) {
      this.elements.toCurrencyDropdown.classList.add("hidden");
    }
  }

  /**
   * Handle keyboard shortcuts and navigation
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.elements.fromCurrencyDropdown.classList.add("hidden");
      this.elements.toCurrencyDropdown.classList.add("hidden");
    }
  }
  /**
   * Format price for display with appropriate decimal places
   * @param {number} price - Price to format
   * @returns {string} Formatted price string
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
   * Format amount for display with dynamic decimal places
   * @param {number} amount - Amount to format
   * @returns {string} Formatted amount string
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

/**
 * Application Entry Point
 * Initialize the Currency Swap Application when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  try {
    new CurrencySwapApp();
  } catch (error) {
    console.error("Failed to initialize Currency Swap Application:", error);
    // Could show user-friendly error message here
  }
});
