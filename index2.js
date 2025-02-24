// Function to extract OTP from text using regex
function extractOTP(text) {
  // Look for 6-digit number after "OTP is:" or after "#"
  const otpMatch = text.match(/OTP is:\s*(\d{6})|#(\d{6})/);
  if (otpMatch) {
      // Return the first matched group that contains digits
      return otpMatch[1] || otpMatch[2];
  }
  // If no specific format found, try to find any 6-digit number
  const numericMatch = text.match(/\d{6}/);
  return numericMatch ? numericMatch[0] : null;
}

// Function to fill OTP input
function fillOTPInput(otp) {
  const otpInput = document.getElementById('otp');
  if (otpInput && otp) {
      otpInput.value = otp;
      // Dispatch input event to trigger any listeners
      otpInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Function to clear clipboard
async function clearClipboard() {
  try {
      // Write empty string to clipboard
      await navigator.clipboard.writeText('');
      console.log('Clipboard cleared');
  } catch (error) {
      console.log('Failed to clear clipboard:', error);
  }
}

// Setup clipboard listener
async function setupClipboardListener() {
  try {
      // Request clipboard permission
      const permissionResult = await navigator.permissions.query({
          name: 'clipboard-read'
      });
      
      if (permissionResult.state === 'granted' || permissionResult.state === 'prompt') {
          // Poll clipboard every second
          setInterval(async () => {
              try {
                  const text = await navigator.clipboard.readText();
                  const otp = extractOTP(text);
                  if (otp) {
                      fillOTPInput(otp);
                  }
              } catch (error) {
                  console.log('Failed to read clipboard:', error);
              }
          }, 1000);
      }
  } catch (error) {
      console.log('Clipboard API not supported:', error);
  }
}

// Setup message listener
function setupMessageListener() {
  window.addEventListener('message', (event) => {
      const text = event.data;
      if (typeof text === 'string') {
          const otp = extractOTP(text);
          if (otp) {
              fillOTPInput(otp);
          }
      }
  });
}

// Initialize event listeners and clear clipboard on page load
document.addEventListener('DOMContentLoaded', () => {
  clearClipboard(); // Clear clipboard when page loads
  setupClipboardListener();
  setupMessageListener();
});

// Clear clipboard before leaving the page
window.addEventListener('beforeunload', () => {
  clearClipboard();
});

// Also setup clipboard paste event listener as fallback
document.addEventListener('paste', (event) => {
  const text = event.clipboardData.getData('text');
  const otp = extractOTP(text);
  if (otp) {
      fillOTPInput(otp);
  }
});