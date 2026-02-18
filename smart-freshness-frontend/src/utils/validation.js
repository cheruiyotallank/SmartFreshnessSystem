// src/utils/validation.js
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 100,
    message: "Please enter a valid email address"
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 50,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
    message: "Password must be at least 8 characters with at least one letter and one number"
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-'\.]+$/,
    message: "Name must be 2-50 characters, letters, spaces, hyphens, apostrophes, and periods only"
  },
  confirmPassword: {
    required: true,
    match: "password",
    message: "Passwords do not match"
  }
};

export const validateField = (value, rules) => {
  const errors = [];

  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${rules.message || 'This field is required'}`);
    return errors;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return errors;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.message || 'Invalid format');
  }

  // Length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters`);
  }

  // Match validation (for confirm password)
  if (rules.match && rules.matchValue !== value) {
    errors.push(rules.message || 'Values do not match');
  }

  return errors;
};

export const validateForm = (formData, fieldRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(fieldRules).forEach(fieldName => {
    const rules = fieldRules[fieldName];
    const value = formData[fieldName];

    // Handle match validation (confirm password)
    if (rules.match) {
      rules.matchValue = formData[rules.match];
    }

    const fieldErrors = validateField(value, rules);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  const strength = {
    0: { label: 'Very Weak', color: 'bg-red-500' },
    1: { label: 'Very Weak', color: 'bg-red-500' },
    2: { label: 'Weak', color: 'bg-red-400' },
    3: { label: 'Fair', color: 'bg-yellow-500' },
    4: { label: 'Good', color: 'bg-yellow-400' },
    5: { label: 'Strong', color: 'bg-green-500' },
    6: { label: 'Very Strong', color: 'bg-green-400' }
  };

  return {
    score,
    label: strength[score]?.label || 'Very Weak',
    color: strength[score]?.color || 'bg-red-500'
  };
};
