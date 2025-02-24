// Function to clear clipboard
async function clearClipboard() {
  try {
    await navigator.clipboard.writeText(""); // Overwrite clipboard with an empty string
    console.log("Clipboard cleared on page load/exit.");
  } catch (err) {
    console.error("Failed to clear clipboard:", err);
  }
}

// WebOTP API for automatic OTP fetching
if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector("input.otp-input");
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
      console.log(otp);
      if (otp) {
        console.log(otp);
        input.value = otp.code;
        await navigator.clipboard.writeText(otp.code); // Copy OTP to clipboard
        const text = await navigator.clipboard.readText();
        sessionStorage.setItem("kyosk-otp", text);
        if (form) form.submit();
      }
    } catch (err) {
      console.error("WebOTP failed:", err);
    }
  });
}

// Clipboard Polling Function (to detect changes)
let lastClipboardText = sessionStorage.getItem("kysok-otp") || ""; // Store last clipboard content
async function checkClipboardChanges() {
  try {
    document.getElementById("otp")?.focus()
    const text = await navigator.clipboard.readText();
    if (text !== lastClipboardText && /^\d{4,6}$/.test(text.trim())) {
      lastClipboardText = text; // Update last clipboard text
      document.getElementById("otp").value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
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
    clipboardInterval = setInterval(checkClipboardChanges, 2000);
  } else {
    clearInterval(clipboardInterval);
    // Stop polling when page is inactive
  }
});

// **Clear clipboard on page load**
window.addEventListener("DOMContentLoaded", clearClipboard);

// **Clear clipboard on page refresh or exit**
window.addEventListener("beforeunload", clearClipboard);

// Initial start
clipboardInterval = setInterval(checkClipboardChanges, 2000);
