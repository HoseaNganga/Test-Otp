// Utility function to check if string is valid OTP
const isValidOTP = (text) => /^\d{4,6}$/.test(text.trim());

// Enhanced clipboard management class
class ClipboardManager {
  constructor() {
    this.lastClipboardText = sessionStorage.getItem("kyosk-otp") || "";
    this.clipboardInterval = null;
    this.isPolling = false;
  }

  async clearClipboard() {
    try {
      await navigator.clipboard.writeText("");
      console.log("Clipboard cleared successfully");
    } catch (err) {
      console.warn("Failed to clear clipboard:", err);
    }
  }

  async readClipboard() {
    try {
      // Request clipboard permission if needed
      const permission = await navigator.permissions.query({ name: "clipboard-read" });
      if (permission.state === "denied") {
        throw new Error("Clipboard permission denied");
      }
      
      return await navigator.clipboard.readText();
    } catch (err) {
      console.warn("Clipboard read failed:", err);
      return null;
    }
  }

  async checkClipboardChanges() {
    const otpInput = document.getElementById("otp");
    if (!otpInput) return;

    // Ensure input is focused for clipboard operations
    if (document.activeElement !== otpInput) {
      otpInput.focus();
    }

    const text = await this.readClipboard();
    if (!text) return;

    if (text !== this.lastClipboardText && isValidOTP(text)) {
      this.lastClipboardText = text;
      otpInput.value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
      console.log("OTP updated from clipboard:", text.trim());
    }
  }

  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.clipboardInterval = setInterval(() => this.checkClipboardChanges(), 2000);
    console.log("Clipboard polling started");
  }

  stopPolling() {
    if (this.clipboardInterval) {
      clearInterval(this.clipboardInterval);
      this.clipboardInterval = null;
    }
    this.isPolling = false;
    console.log("Clipboard polling stopped");
  }
}

// WebOTP API handler
class OTPHandler {
  constructor(clipboardManager) {
    this.clipboardManager = clipboardManager;
    this.abortController = null;
  }

  async initialize() {
    if (!("OTPCredential" in window)) {
      console.log("WebOTP not supported");
      return;
    }

    const input = document.querySelector("input.otp-input");
    if (!input) return;

    this.abortController = new AbortController();
    const form = input.closest("form");

    if (form) {
      form.addEventListener("submit", () => this.abortController.abort());
    }

    try {
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: this.abortController.signal,
      });

      if (otp) {
        input.value = otp.code;
        await navigator.clipboard.writeText(otp.code);
        sessionStorage.setItem("kyosk-otp", otp.code);
        if (form) form.submit();
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("WebOTP error:", err);
      }
    }
  }
}

// Initialize and setup
const clipboardManager = new ClipboardManager();
const otpHandler = new OTPHandler(clipboardManager);

// Event listeners
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    clipboardManager.startPolling();
  } else {
    clipboardManager.stopPolling();
  }
});

// Setup on page load
window.addEventListener("DOMContentLoaded", async () => {
  await clipboardManager.clearClipboard();
  await otpHandler.initialize();
  clipboardManager.startPolling();
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  clipboardManager.stopPolling();
  clipboardManager.clearClipboard();
});