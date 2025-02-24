// Function to clear clipboard
async function clearClipboard() {
  try {
    await navigator.clipboard.writeText(""); // Overwrite clipboard with an empty string
    console.log("Clipboard cleared on page load/exit.");
  } catch (err) {
    console.error("Failed to clear clipboard:", err);
  }
}

async function fetchOtp() {
  console.log("==========================> Fetching OTP has began")
  const input = document.querySelector("input.otp-input");
  if (!input) return;
  input.focus();
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
      console.log("OTP HAS BEEN FOUND =========================>",otp);
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

// WebOTP API for automatic OTP fetching
if ("OTPCredential" in window) {
  window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector("input.otp-input");

    if (!input) return;

    if (input) {
      alert("Input has been found");
      await trackChanges()
    }


  });
}

async function checkClipboardChanges() {
  console.log("==========================> Tracking clipboard changes has began")
  let lastClipboardText = sessionStorage.getItem("kysok-otp") || "";
  try {
    const text = await navigator.clipboard.readText();
    console.log("Text from clipboard is =======================================>", text)
    if (text !== lastClipboardText && /^\d{4,6}$/.test(text.trim())) {
      document.getElementById("otp").value = text.trim();
      sessionStorage.setItem("kyosk-otp", text);
      console.log("Clipboard updated with OTP:", text.trim());
    }
  } catch (err) {
    console.error("Clipboard read failed:", err);
  }
}

// Start polling clipboard when page is active


function trackChanges(){
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

// **Clear clipboard on page load**
window.addEventListener("DOMContentLoaded", clearClipboard);

// **Clear clipboard on page refresh or exit**
window.addEventListener("beforeunload", clearClipboard);

