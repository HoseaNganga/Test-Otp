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

// Function to show status message
function showStatus(message, isError = false) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  statusElement.className = 'status-message ' + (isError ? 'error' : 'success');
  
  // Hide the message after 3 seconds
  setTimeout(() => {
      statusElement.style.display = 'none';
  }, 3000);
}

// Function to fill OTP input
function fillOTPInput(otp) {
  const otpInput = document.getElementById('otp');
  if (otpInput && otp) {
      otpInput.value = otp;
      // Dispatch input event to trigger any listeners
      otpInput.dispatchEvent(new Event('input', { bubbles: true }));
      showStatus('OTP automatically filled');
  }
}

// Function to clear clipboard
async function clearClipboard() {
  try {
      // Request clipboard permission
      const permissionResult = await navigator.permissions.query({
          name: 'clipboard-write'
      });
      
      if (permissionResult.state === 'granted' || permissionResult.state === 'prompt') {
          // Write empty string to clipboard
          await navigator.clipboard.writeText('');
          console.log('Clipboard cleared');
      }
  } catch (error) {
      console.log('Failed to clear clipboard:', error);
  }
}

// Setup Web OTP API
async function setupWebOTPAPI() {
  if ('OTPCredential' in window) {
      try {
          const abortController = new AbortController();
          // Listen for SMS messages containing OTP
          const content = await navigator.credentials.get({
              otp: { transport: ['sms'] },
              signal: abortController.signal
          });
          
          fillOTPInput(content.code);
          showStatus('OTP received from SMS');
          // Abort after successful OTP reception
          abortController.abort();
      } catch (error) {
          if (error.name !== 'AbortError') {
              console.log('WebOTP API error:', error);
              showStatus('Failed to receive OTP from SMS', true);
          }
      }
  } else {
      console.log('WebOTP API not supported');
  }
}

// Setup Clipboard API
async function setupClipboardAPI() {
  try {
      // Request clipboard permission
      const permissionResult = await navigator.permissions.query({
          name: 'clipboard-read'
      });
      
      if (permissionResult.state === 'granted' || permissionResult.state === 'prompt') {
          // Watch clipboard changes
          document.addEventListener('visibilitychange', async () => {
              if (!document.hidden) {
                  try {
                      const text = await navigator.clipboard.readText();
                      const otp = extractOTP(text);
                      if (otp) {
                          fillOTPInput(otp);
                          // Clear clipboard after successful OTP extraction
                          await clearClipboard();
                      }
                  } catch (error) {
                      console.log('Clipboard read error:', error);
                  }
              }
          });
      }
  } catch (error) {
      console.log('Clipboard API not supported:', error);
      showStatus('Clipboard access not available', true);
  }
}

// Initialize APIs and event listeners
document.addEventListener('DOMContentLoaded', async () => {
  await clearClipboard(); // Clear clipboard when page loads
  setupWebOTPAPI();
  setupClipboardAPI();

  // Setup form submission
  const form = document.getElementById('otpForm');
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      const otp = document.getElementById('otp').value;
      if (otp.length === 6 && /^\d+$/.test(otp)) {
          showStatus('OTP verification initiated');
          // Add your verification logic here
      } else {
          showStatus('Please enter a valid 6-digit OTP', true);
      }
  });
});

// Clear clipboard before leaving the page
window.addEventListener('beforeunload', () => {
  clearClipboard();
});

// Handle paste events
document.addEventListener('paste', async (event) => {
  const text = event.clipboardData.getData('text');
  const otp = extractOTP(text);
  if (otp) {
      fillOTPInput(otp);
      // Clear clipboard after successful paste
      await clearClipboard();
  }
});