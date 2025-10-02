function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// Function 1: For the Signup Form
function validateSignupData({ email, password }) {
  if (!email || !password) {
    return "email and password are required";
  }
  if (!isEmail(email)) {
    return "invalid email";
  }
  if (String(password).length < 6) {
    return "password must be at least 6 characters";
  }
  return null;
}

// Function 2: For the Profile Update Form
function validateProfileUpdateData({ firstName, lastName, phone, email }) {
  if (!firstName || !lastName || !email) {
    return "First name, last name, and email are required.";
  }
  if (typeof firstName !== 'string' || firstName.trim().length === 0) {
    return "First name cannot be empty.";
  }
  if (typeof lastName !== 'string' || lastName.trim().length === 0) {
    return "Last name cannot be empty.";
  }
  if (!isEmail(email)) {
    return "The provided email is not valid.";
  }
  if (phone && !/^[\d\s()+-]+$/.test(phone)) {
    return "The phone number contains invalid characters.";
  }
  return null;
}

// Function 3: For the Password Change Form
function validatePasswordChangeData({ currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    return "All password fields are required.";
  }
  if (String(newPassword).length < 6) {
    return "New password must be at least 6 characters.";
  }
  return null;
}

// --- THIS IS THE CRITICAL FIX ---
// Ensure ALL necessary functions are exported.
module.exports = {
  validateSignupData,
  validateProfileUpdateData,
  validatePasswordChangeData,
};