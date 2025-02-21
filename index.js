async function fetchOTPFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{4,6}$/.test(text.trim())) {
      // Ensure it's a valid OTP format (4-6 digits)
      document.getElementById("otp").value = text.trim();
    } else {
      alert("No valid OTP found in clipboard.");
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
    alert("Failed to read from clipboard. Please allow clipboard access.");
  }
}

// Add event listener to the "Copy from clipboard" button
document.addEventListener("DOMContentLoaded", () => {
  const clipboardButton = document.querySelector("button:last-of-type"); // Selects the second button
  if (clipboardButton) {
    clipboardButton.addEventListener("click", (e) => {
      e.preventDefault(); // Prevent form submission
      fetchOTPFromClipboard();
    });
  }
});

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
