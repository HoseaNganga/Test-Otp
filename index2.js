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

// Form submission helper
const submitForm = (input, otp) => {
  log.info(`Attempting to submit form with OTP: ${otp}`);
  
  const form = input.closest('form');
  if (!form) {
    log.error("Form not found!");
    return;
  }

  // Set the input value
  input.value = otp;
  log.success(`Set input value to: ${otp}`);

  // Create and dispatch input event
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  log.info("Dispatched input and change events");

  // Find the submit button
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    log.info("Found submit button, clicking it");
    submitButton.click();
  } else {
    log.info("Submit button not found, submitting form directly");
    form.submit();
  }
  
  log.success("Form submitted! 🎉");
};

// WebOTP API handler
class OTPHandler {
  constructor() {
    this.abortController = null;
    log.info("OTPHandler initialized");
  }

  async initialize() {
    if (!("OTPCredential" in window)) {
      log.warning("WebOTP not supported in this browser");
      return;
    }

    // Try both selectors to find the input
    const input = document.querySelector("input.otp-input") || document.getElementById("otp");
    if (!input) {
      log.error("❌ OTP input element not found. Checked both .otp-input and #otp");
      return;
    }
    log.success(`✅ Found OTP input element: ${input.id || input.className}`);

    log.info("📱 Setting up WebOTP API");
    this.abortController = new AbortController();

    try {
      log.info("🔄 Waiting for SMS OTP...");
      log.info("🔔 WebOTP permission prompt should appear when SMS arrives");
      
      const otpCredential = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: this.abortController.signal,
      });

      log.info("👆 User responded to WebOTP prompt");
      log.info("Checking OTP credential...");

      if (otpCredential && otpCredential.code) {
        log.success(`🎯 WebOTP credential received: ${JSON.stringify(otpCredential)}`);
        log.otp(`Received OTP code: ${otpCredential.code}`);
        
        // Verify input element is still available
        const otpInput = document.querySelector("input.otp-input") || document.getElementById("otp");
        if (!otpInput) {
          log.error("❌ Input element not found when trying to set OTP!");
          return;
        }
        
        // Set value directly first
        otpInput.value = otpCredential.code;
        log.success(`✅ Set input value directly to: ${otpCredential.code}`);
        
        // Try to copy to clipboard
        try {
          await navigator.clipboard.writeText(otpCredential.code);
          log.success("📋 Copied OTP to clipboard");
        } catch (clipErr) {
          log.error(`Failed to copy to clipboard: ${clipErr.message}`);
        }

        // Store in session
        sessionStorage.setItem("kyosk-otp", otpCredential.code);
        log.info("💾 Saved OTP to session storage");

        // Submit form with OTP
        submitForm(otpInput, otpCredential.code);
      } else {
        log.warning("⚠️ No OTP credential received after permission granted");
        if (otpCredential) {
          log.warning(`Credential object without code: ${JSON.stringify(otpCredential)}`);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        log.info("🛑 OTP detection aborted");
      } else if (err.name === "NotAllowedError") {
        log.warning("🚫 User denied WebOTP permission");
      } else if (err.name === "InvalidStateError") {
        log.error("❌ WebOTP API in invalid state. Make sure you're using HTTPS");
      } else {
        log.error(`WebOTP error: ${err.name} - ${err.message}`);
        log.error(`Error details: ${err.stack}`);
      }
    }
  }
}

// Initialize and setup
const otpHandler = new OTPHandler();

// Setup on page load
window.addEventListener("DOMContentLoaded", async () => {
  log.info("🚀 Page loaded, initializing OTP system");
  await otpHandler.initialize();
});