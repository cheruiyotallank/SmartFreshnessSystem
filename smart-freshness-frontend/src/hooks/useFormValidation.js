import { useState, useCallback, useMemo } from "react";
import { validateForm, validateField, getPasswordStrength } from "../utils/validation";

export function useFormValidation(initialData, validationRules) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSingleField = useCallback(
    (fieldName, value) => {
      const rules = validationRules[fieldName];
      if (!rules) return [];

      if (rules.match) {
        rules.matchValue = formData[rules.match];
      }

      return validateField(value, rules);
    },
    [formData, validationRules]
  );

  const handleFieldChange = useCallback(
    (fieldName, value) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      if (errors[fieldName]) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: undefined,
        }));
      }

      // Re-validate confirmPassword if password changes or confirmPassword changes
      if ((fieldName === 'password' || fieldName === 'confirmPassword') && validationRules.confirmPassword) {
        const confirmPasswordValue = fieldName === 'confirmPassword' ? value : formData.confirmPassword;
        const passwordValue = fieldName === 'password' ? value : formData.password;
        if (confirmPasswordValue) {
          const rules = { ...validationRules.confirmPassword, matchValue: passwordValue };
          const fieldErrors = validateField(confirmPasswordValue, rules);
          setErrors((prev) => ({
            ...prev,
            confirmPassword: fieldErrors.length > 0 ? fieldErrors : undefined,
          }));
        }
      }
    },
    [errors, formData, validationRules]
  );

  const handleFieldBlur = useCallback(
    (fieldName) => {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      const fieldErrors = validateSingleField(fieldName, formData[fieldName]);
      if (fieldErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: fieldErrors,
        }));
      }
    },
    [formData, validateSingleField]
  );

  const validate = useCallback(() => {
    const { isValid, errors: formErrors } = validateForm(formData, validationRules);
    setErrors(formErrors);
    return isValid;
  }, [formData, validationRules]);

  const getFieldProps = useCallback(
    (fieldName) => ({
      value: formData[fieldName] || "",
      onChange: (e) => handleFieldChange(fieldName, e.target.value),
      onBlur: () => handleFieldBlur(fieldName),
      error: touched[fieldName] && errors[fieldName]?.length > 0,
      helperText: touched[fieldName] ? errors[fieldName]?.[0] : "",
    }),
    [formData, touched, errors, handleFieldChange, handleFieldBlur]
  );

  const passwordStrength = useMemo(() => {
    if (formData.password) {
      return getPasswordStrength(formData.password);
    }
    return { score: 0, label: "", color: "" };
  }, [formData.password]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  const isValid = useMemo(() => {
    // Check all required fields have values
    const hasRequiredValues = Object.keys(validationRules).every((key) => {
      const value = formData[key];
      return value !== undefined && value !== null && value.toString().trim() !== "";
    });

    if (!hasRequiredValues) return false;

    // Actually validate all fields
    const { isValid: formIsValid } = validateForm(formData, validationRules);
    return formIsValid;
  }, [errors, formData, validationRules]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    passwordStrength,
    handleFieldChange,
    handleFieldBlur,
    validate,
    reset,
    getFieldProps,
    setIsSubmitting,
  };
}