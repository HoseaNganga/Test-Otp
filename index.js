async function fetchAndFillOTP() {
  try {
    if ("OTPCredential" in window) {
      const ac = new AbortController();
      const input = document.querySelector(
        'input[autocomplete="one-time-code"]'
      );
      if (!input) return;

      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      });

      if (otp) {
        console.log(`OTp:${otp}`);
        await navigator.clipboard.writeText(otp.code);
      }
    }
  } catch (err) {
    console.error("OTP autofill failed:", err);
  }
}

// Function to check clipboard content automatically
async function readClipboardOTP() {
  try {
    const text = await navigator.clipboard.readText();
    const input = document.querySelector('input[autocomplete="one-time-code"]');

    if (input && text && /^\d{4,6}$/.test(text.trim())) {
      input.value = text.trim(); // Autofill input field
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

// 📌 Watch for changes in the input field
function observeOTPField() {
  const input = document.querySelector('input[autocomplete="one-time-code"]');
  if (!input) return;

  const observer = new MutationObserver(() => {
    if (!input.value) {
      readClipboardOTP(); // If input is empty, check clipboard
    }
  });

  observer.observe(input, { attributes: true, childList: true, subtree: true });
}

// ✅ Run on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchAndFillOTP();
  observeOTPField(); // Start observing the input field
});
