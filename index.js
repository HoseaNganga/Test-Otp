// Function to fetch OTP from clipboard and populate the input field
async function fetchOTPFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{4,6}$/.test(text.trim())) {
      // Ensure it's a valid OTP format (4-6 digits)
      document.getElementById("otp").value = text.trim();
      console.log("OTP pasted from clipboard:", text.trim());
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

// WebOTP API for automatic OTP fetching
if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    if (!input) return;

    const ac = new AbortController();
    const form = input.closest("form");

    if (form) {
      form.addEventListener("submit", () => ac.abort());
    }

    try {
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      });

      if (otp) {
        input.value = otp.code;
        await navigator.clipboard.writeText(otp.code); // Copy OTP to clipboard
        if (form) form.submit();
      }
    } catch (err) {
      console.error("WebOTP failed:", err);
    }
  });
}

// Clipboard Polling Function (to detect changes)
let lastClipboardText = ""; // Store last clipboard content
async function checkClipboardChanges() {
  try {
    const text = await navigator.clipboard.readText();
    if (text !== lastClipboardText && /^\d{4,6}$/.test(text.trim())) {
      lastClipboardText = text; // Update last clipboard text
      document.getElementById("otp").value = text.trim();
      console.log("Clipboard updated with OTP:", text.trim());
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

// Start polling clipboard when page is active
let clipboardInterval;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    clipboardInterval = setInterval(checkClipboardChanges, 2000); // Check clipboard every 2 seconds
  } else {
    clearInterval(clipboardInterval); // Stop polling when page is inactive
  }
});

// Initial start
clipboardInterval = setInterval(checkClipboardChanges, 2000);

/* async function fetchOTPFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{4,6}$/.test(text.trim())) {
      // Ensure it's a valid OTP format (4-6 digits)
      let otp_test = (document.getElementById("otp").value = text.trim());
      console.log(otp_test);
    } else {
      alert("No valid OTP found in clipboard.");
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
    alert("Failed to read from clipboard. Please allow clipboard access.");
  }
}

// WebOTP API for automatic OTP filling
if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    if (!input) return;

    const ac = new AbortController();
    const form = input.closest("form");

    if (form) {
      form.addEventListener("submit", () => ac.abort());
    }

    try {
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      });

      if (otp) {
        input.value = otp.code;
        await navigator.clipboard.writeText(otp.code); // Copy OTP to Clipboard
        if (form) form.submit();
      }
    } catch (err) {
      console.error("WebOTP failed:", err);
    }
  });
}
 */
