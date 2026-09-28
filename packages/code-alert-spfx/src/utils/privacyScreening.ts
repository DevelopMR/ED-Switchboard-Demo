export interface PrivacyScreeningResult {
  isAllowed: boolean;
  message?: string;
}

const ssnPattern = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/;
const phonePattern = /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/;
const compactPhonePattern = /\b\d{10}\b/;
const mrnPattern = /\b\d{12}\b/;
const visitCodePattern = /\b\d{16}\b/;

export function screenDescriptorText(value: string): PrivacyScreeningResult {
  if (!value.trim()) {
    return { isAllowed: true };
  }
  if (ssnPattern.test(value)) {
    return blocked("Remove the Social Security number before submitting.");
  }
  if (phonePattern.test(value) || compactPhonePattern.test(value)) {
    return blocked("Remove the phone number before submitting.");
  }
  if (mrnPattern.test(value)) {
    return blocked("Remove the 12-digit medical record number before submitting.");
  }
  if (visitCodePattern.test(value)) {
    return blocked("Remove the 16-digit visit code before submitting.");
  }
  return { isAllowed: true };
}

function blocked(message: string): PrivacyScreeningResult {
  return { isAllowed: false, message };
}
