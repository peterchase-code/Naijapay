// ================================================
// Auth Handlers with Premium Toast Notifications
// ================================================

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const login = document.getElementById('login').value.trim();
  const password = document.getElementById('password').value;

  if (!login || !password) {
    showError('Please fill in all fields');
    return;
  }

  setLoading(btn, true);

  try {
    const res = await api.login(login, password);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    showSuccess('Login successful! Redirecting...');

    setTimeout(() => {
      if (res.data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 800);
  } catch (error) {
    showError(error.message || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(btn, false);
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');

  const fullName = document.getElementById('fullName').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const country = document.getElementById('country').value;
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const referralCode = document.getElementById('referralCode').value.trim() || undefined;

  if (!fullName || !username || !email || !phoneNumber || !country || !dateOfBirth || !password) {
    showError('Please fill in all required fields');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }

  setLoading(btn, true);

  try {
    const res = await api.register({
      fullName, username, email, phoneNumber, country, dateOfBirth, password, referralCode
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    showSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  } catch (error) {
    showError(error.message || 'Registration failed. Please try again.');
  } finally {
    setLoading(btn, false);
  }
}

// Handle forgot password
async function handleForgotPassword(e, onSuccess) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const email = document.getElementById('email').value.trim();

  if (!email || !isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }

  setLoading(btn, true);

  try {
    // Detect frontend URL — handle file:// protocol and nested paths
    let frontendUrl;
    if (window.location.protocol === 'file:') {
      // Opened locally via file:// — fall back to localhost or window.API_HOST
      frontendUrl = window.API_HOST || 'http://localhost:3000';
    } else {
      frontendUrl = window.location.origin;
    }
    const res = await api.forgotPassword(email, frontendUrl);
    // Allow page-specific handling of the response (e.g. dev-mode reset URL display)
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(res);
    }
    // Generic success message for security (prevents email enumeration)
    showSuccess('If this email exists in our system, you will receive reset instructions.');
    document.getElementById('forgotForm').reset();
  } catch (error) {
    console.error('Forgot password error:', error);
    showError(error.message || 'Failed to send reset email. Please try again.');
  } finally {
    setLoading(btn, false);
  }
}

// Handle reset password (token-based)
async function handleResetPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const token = document.getElementById('resetToken').value;
  const email = document.getElementById('resetEmail').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!token || !email) {
    showError('Invalid or missing reset token/email');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  setLoading(btn, true);

  try {
    await api.resetPassword(token, email, password);
    showSuccess('Password reset successful! Redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    showError(error.message || 'Reset failed. The link may have expired.');
  } finally {
    setLoading(btn, false);
  }
}
