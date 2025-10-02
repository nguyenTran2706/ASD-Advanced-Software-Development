// Import all the functions we want to test from our validation file.
const {
  validateSignupData,
  validateProfileUpdateData,
  validatePasswordChangeData
} = require('../backend/validation.js');

// --- Test Suite for the Signup Validator ---
describe('Signup Form Validation (validateSignupData)', () => {
  it('should return null for valid signup data', () => {
    expect(validateSignupData({ email: 'test@example.com', password: 'password123' })).toBeNull();
  });

  it('should return an error for a short password', () => {
    expect(validateSignupData({ email: 'test@example.com', password: '123' })).toBe('password must be at least 6 characters');
  });
});

// --- Test Suite for the Profile Update Validator ---
describe('Profile Update Validation (validateProfileUpdateData)', () => {
  it('should return null for valid profile data', () => {
    const data = { firstName: 'Test', lastName: 'User', email: 'test@example.com', phone: '123-456-7890' };
    expect(validateProfileUpdateData(data)).toBeNull();
  });

  it('should return an error if first name is missing', () => {
    const data = { lastName: 'User', email: 'test@example.com', phone: '123-456-7890' };
    expect(validateProfileUpdateData(data)).toBe('First name, last name, and email are required.');
  });
});

// --- Test Suite for the Password Change Validator ---
describe('Password Change Validation (validatePasswordChangeData)', () => {
  it('should return null for valid password change data', () => {
    const data = { currentPassword: 'password123', newPassword: 'newPassword456' };
    expect(validatePasswordChangeData(data)).toBeNull();
  });

  it('should return an error if new password is too short', () => {
    const data = { currentPassword: 'password123', newPassword: '123' };
    expect(validatePasswordChangeData(data)).toBe('New password must be at least 6 characters.');
  });
});