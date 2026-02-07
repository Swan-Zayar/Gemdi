/**
 * Validation service for user inputs
 * Prevents inappropriate content, injection attacks, and ensures data quality
 */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Blacklist of inappropriate words (basic set - expand as needed)
const INAPPROPRIATE_WORDS = [
  'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'dick', 'cock',
  'pussy', 'cunt', 'whore', 'slut', 'nigger', 'nigga', 'fag', 'faggot',
  'retard', 'rape', 'nazi', 'hitler', 'terrorist', 'kill', 'murder',
  'suicide', 'porn', 'xxx', 'sex', 'nude', 'naked', 'epstein file', 'diddy', 'gay', 'six seven',
  '67'
];

// Injection attack patterns
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior|earlier)/i,
  /disregard\s+(previous|all|instructions|everything)/i,
  /forget\s+(everything|previous|instructions|all)/i,
  /new\s+instructions/i,
  /you\s+are\s+now/i,
  /system\s*:/i,
  /override\s+(instructions|rules|guidelines)/i,
  /act\s+as\s+(if|a|an)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /roleplay/i,
  /jailbreak/i,
  /\[system\]/i,
  /\<\|.*?\|\>/gi, // Special tokens
  /```.*?system.*?```/is // System prompts in code blocks
];

/**
 * Check if text contains inappropriate words
 */
const containsInappropriateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_WORDS.some(word => {
    // Check for whole word matches (with boundaries)
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};

/**
 * Check if text contains injection attack patterns
 */
const containsInjectionAttempt = (text: string): boolean => {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Validate username
 * Rules:
 * - Length: 2-30 characters
 * - Allowed: letters, numbers, spaces, hyphens, underscores
 * - No leading/trailing spaces
 * - No multiple consecutive spaces
 * - No inappropriate content
 */
export const validateUsername = (username: string): ValidationResult => {
  // Check if empty
  if (!username || !username.trim()) {
    return { valid: false, error: 'Username is required' };
  }

  // Remove leading/trailing spaces for validation
  const trimmed = username.trim();

  // Check length
  if (trimmed.length < 2) {
    return { valid: false, error: 'Username must be at least 2 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' };
  }

  // Check for leading/trailing spaces in original
  if (username !== trimmed) {
    return { valid: false, error: 'Username cannot have leading or trailing spaces' };
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(username)) {
    return { valid: false, error: 'Username cannot have multiple consecutive spaces' };
  }

  // Check allowed characters (alphanumeric, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  // Check for inappropriate content
  if (containsInappropriateContent(username)) {
    return { valid: false, error: 'Username contains inappropriate content' };
  }

  return { valid: true };
};

/**
 * Validate custom AI prompt
 * Rules:
 * - Max length: 500 characters (~125 tokens)
 * - No injection attempts
 * - No inappropriate content
 * - No attempts to override system instructions
 */
export const validateCustomPrompt = (prompt: string): ValidationResult => {
  // Empty prompt is valid (means no custom instructions)
  if (!prompt || !prompt.trim()) {
    return { valid: true };
  }

  const trimmed = prompt.trim();

  // Check length (500 chars = ~125 tokens, safe for our 24,576 token budget)
  if (trimmed.length > 500) {
    return { 
      valid: false, 
      error: `Prompt is too long (${trimmed.length}/500 characters). Please shorten your instructions.` 
    };
  }

  // Check for injection attempts
  if (containsInjectionAttempt(trimmed)) {
    return { 
      valid: false, 
      error: 'Prompt contains prohibited phrases that attempt to override system instructions' 
    };
  }

  // Check for inappropriate content
  if (containsInappropriateContent(trimmed)) {
    return { 
      valid: false, 
      error: 'Prompt contains inappropriate content' 
    };
  }

  // Check for excessive special characters (might indicate code injection)
  const specialCharCount = (trimmed.match(/[<>{}[\]\\|`]/g) || []).length;
  if (specialCharCount > 10) {
    return { 
      valid: false, 
      error: 'Prompt contains too many special characters' 
    };
  }

  return { valid: true };
};

/**
 * Sanitize custom prompt before sending to AI
 * Removes potentially dangerous characters while preserving educational content
 */
export const sanitizePrompt = (prompt: string): string => {
  if (!prompt) return '';
  
  return prompt
    .trim()
    .replace(/[<>{}[\]\\|`]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 500); // Enforce max length as final safety
};
