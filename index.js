async function fetchOTPFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{4,6}$/.test(text.trim())) {
      // Ensure valid OTP format
      document.getElementById("otp-input").value = text.trim();
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

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
        await navigator.clipboard.writeText(otp.code); // ✅ Copy OTP to Clipboard
        if (form) form.submit();
      }
    } catch (err) {
      console.error("WebOTP failed:", err);
      fetchOTPFromClipboard(); // ✅ Try fetching from clipboard if WebOTP fails
    }
  });
} else {
  // ✅ If WebOTP API is not available, try fetching OTP from clipboard
  window.addEventListener("DOMContentLoaded", fetchOTPFromClipboard);
}

/* async function fetchOTPFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && /^\d{4,6}$/.test(text.trim())) {
      // Ensure valid OTP format
      document.getElementById("otp-input").value = text.trim();
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", (e) => {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    if (!input) return;
    const ac = new AbortController();
    const form = input.closest("form");
    if (form) {
      form.addEventListener("submit", (e) => {
        ac.abort();
      });
    }
    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      })
      .then((otp) => {
        input.value = otp.code;
        if (form) form.submit();
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
 */
