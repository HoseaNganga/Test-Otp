// Function to clear clipboard
async function clearClipboard() {
  try {
    await navigator.clipboard.writeText("");
    console.log("Clipboard cleared on page load/exit.");
  } catch (err) {
    console.error("Failed to clear clipboard:", err);
  }
}

async function fetchOtp() {
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
    console.log("OTP HAS BEEN FOUND =========================>", otp);
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

async function trackChanges() {
  let clipboardInterval;
  let fetchOtpInterval;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      fetchOtpInterval = setInterval(fetchOtp, 2000);
      clipboardInterval = setInterval(checkClipboardChanges, 2000);
    } else {
      clearInterval(fetchOtpInterval);
      clearInterval(clipboardInterval);
    }
  });
}

// WebOTP API for automatic OTP fetching
if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector("input.otp-input");
    await clearClipboard()

    if (!input) return;

    if (input) {
      console.log("Input has been found =========================================>");
      await trackChanges()
    }


  });
}

async function checkClipboardChanges() {
  setTimeout(async () => {
    try {
      const text = await navigator.clipboard.readText();
      console.log("clipboard text=================================>", text)
      document.getElementById("otp").value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
      console.log("Clipboard updated with OTP =======================================>:", text.trim());

    } catch (err) {
      console.error("Clipboard read failed:", err);
    }
  })
}


// **Clear clipboard on page refresh or exit**
window.addEventListener("beforeunload", clearClipboard);

