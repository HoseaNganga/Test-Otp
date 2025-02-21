async function fetchAndFillOTP() {
  try {
    // Step 1: Check if WebOTP API is available
    if ("OTPCredential" in window) {
      const ac = new AbortController();
      const input = document.querySelector(
        'input[autocomplete="one-time-code"]'
      );
      if (!input) return;

      // Fetch OTP from SMS
      const otp = await navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      });

      if (otp) {
        // Step 2: Copy OTP to clipboard
        await navigator.clipboard.writeText(otp.code);

        // Step 3: Read OTP from clipboard
        const copiedOTP = await navigator.clipboard.readText();

        // Step 4: Autofill input field
        if (copiedOTP && /^\d{4,6}$/.test(copiedOTP.trim())) {
          input.value = copiedOTP.trim();
        }
      }
    }
  } catch (err) {
    console.error("OTP autofill failed:", err);
  }
}

// Run automatically on page load
window.addEventListener("DOMContentLoaded", fetchAndFillOTP);

setInterval(fetchAndFillOTP, 10000); // Runs every 10 seconds
