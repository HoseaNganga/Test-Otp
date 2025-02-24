// Utility function to check if string is valid OTP
const isValidOTP = (text) => /^\d{4,6}$/.test(text.trim());

// Logging utility
const log = {
  info: (msg) => console.log(`📝 ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.warn(`⚠️ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  clipboard: (msg) => console.log(`📋 ${msg}`),
  otp: (msg) => console.log(`🔢 ${msg}`)
};

// Enhanced clipboard management class
class ClipboardManager {
  constructor() {
    this.lastClipboardText = sessionStorage.getItem("kyosk-otp") || "";
    this.clipboardInterval = null;
    this.isPolling = false;
    this.pollCount = 0;
    log.info("ClipboardManager initialized");
  }

  async clearClipboard() {
    try {
      await navigator.clipboard.writeText("");
      log.success("Clipboard cleared successfully");
    } catch (err) {
      log.warning(`Failed to clear clipboard: ${err.message}`);
    }
  }

  async readClipboard() {
    try {
      // Request clipboard permission if needed
      const permission = await navigator.permissions.query({ name: "clipboard-read" });
      log.info(`Clipboard permission status: ${permission.state}`);
      
      if (permission.state === "denied") {
        throw new Error("Clipboard permission denied");
      }
      
      const text = await navigator.clipboard.readText();
      log.clipboard(`Read from clipboard: ${text ? (text.length > 0 ? text : '(empty)') : '(null)'}`);
      return text;
    } catch (err) {
      log.error(`Clipboard read failed: ${err.message}`);
      return null;
    }
  }

  async checkClipboardChanges() {
    this.pollCount++;
    log.info(`Polling clipboard (count: ${this.pollCount}) 🔄`);

    const otpInput = document.getElementById("otp");
    if (!otpInput) {
      log.warning("OTP input element not found");
      return;
    }

    // Ensure input is focused for clipboard operations
    if (document.activeElement !== otpInput) {
      log.info("Focusing OTP input");
      otpInput.focus();
    }

    const text = await this.readClipboard();
    if (!text) {
      log.info("No text in clipboard");
      return;
    }

    log.clipboard(`Current clipboard text: ${text}`);
    log.clipboard(`Last clipboard text: ${this.lastClipboardText}`);

    if (text !== this.lastClipboardText && isValidOTP(text)) {
      this.lastClipboardText = text;
      otpInput.value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
      log.success(`Valid OTP updated from clipboard: ${text.trim()}`);
    } else if (text !== this.lastClipboardText) {
      log.warning(`Invalid OTP format in clipboard: ${text}`);
    }
  }

  startPolling() {
    if (this.isPolling) {
      log.info("Polling already active");
      return;
    }
    
    this.isPolling = true;
    this.clipboardInterval = setInterval(() => this.checkClipboardChanges(), 2000);
    log.success("📊 Clipboard polling started");
  }

  stopPolling() {
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
      this.clipboardInterval = null;
    }
    this.isPolling = false;
    log.info("🛑 Clipboard polling stopped");
  }
}

// WebOTP API handler
class OTPHandler {
  constructor(clipboardManager) {
    this.clipboardManager = clipboardManager;
    this.abortController = null;
    log.info("OTPHandler initialized");
  }

  async initialize() {
    if (!("OTPCredential" in window)) {
      log.warning("WebOTP not supported in this browser");
      return;
    }

    const input = document.querySelector("input.otp-input");
    if (!input) {
      log.warning("OTP input element not found");
      return;
    }

    this.abortController = new AbortController();
    const form = input.closest("form");

    if (form) {
      form.addEventListener("submit", () => {
        log.info("Form submitted, aborting OTP detection");
        this.abortController.abort();
      });
    }

    try {
      log.info("🔄 Waiting for SMS OTP...");
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: this.abortController.signal,
      });

      if (otp) {
        log.success(`OTP received: ${otp.code}`);
        input.value = otp.code;
        await navigator.clipboard.writeText(otp.code);
        sessionStorage.setItem("kyosk-otp", otp.code);
        if (form) {
          log.info("Submitting form with OTP");
          form.submit();
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        log.error(`WebOTP error: ${err.message}`);
      }
    }
  }
}

// Initialize and setup
const clipboardManager = new ClipboardManager();
const otpHandler = new OTPHandler(clipboardManager);

// Event listeners
document.addEventListener("visibilitychange", () => {
  log.info(`Page visibility changed: ${document.visibilityState}`);
  if (document.visibilityState === "visible") {
    clipboardManager.startPolling();
  } else {
    clipboardManager.stopPolling();
  }
});

// Setup on page load
window.addEventListener("DOMContentLoaded", async () => {
  log.info("🚀 Page loaded, initializing OTP system");
  await clipboardManager.clearClipboard();
  await otpHandler.initialize();
  clipboardManager.startPolling();
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  log.info("📤 Page unloading, cleaning up");
  clipboardManager.stopPolling();
  clipboardManager.clearClipboard();
});