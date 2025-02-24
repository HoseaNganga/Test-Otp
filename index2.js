// Function to clear clipboard
async function clearClipboard() {
  try {
    await navigator.clipboard.writeText(""); // Overwrite clipboard with an empty string
    console.log("Clipboard cleared on page load/exit.");
  } catch (err) {
    console.error("Failed to clear clipboard:", err);
  }
}

// Function to fetch OTP from clipboard and populate the input field
/* async function fetchOTPFromClipboard() {
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
} */

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
      alert('Otp is available', otp)
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
    await checkOtp()
    const text = await navigator.clipboard.readText();
    alert("Clipboard changes detected text is", text);
    if (text !== lastClipboardText && /^\d{4,6}$/.test(text.trim())) {
      lastClipboardText = text;
      document.getElementById("otp").value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
      console.log("Clipboard updated with OTP:", text.trim());
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

async function checkOtp() {
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
    alert('Otp is available', otp)
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
}

async function trackChanges(){
  await checkClipboardChanges()
}

// Start polling clipboard when page is active
let clipboardInterval;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    clipboardInterval = setInterval(checkClipboardChanges, 2000); // Check clipboard every 2 seconds
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
