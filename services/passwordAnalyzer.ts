// Zero-Knowledge Client-Side Password Analyzer
// All computation is local — no network calls

export type PasswordStrength = 'VERY_WEAK' | 'WEAK' | 'FAIR' | 'STRONG' | 'VERY_STRONG';

export type PasswordAnalysis = {
  entropy: number;
  strength: PasswordStrength;
  strength_label_en: string;
  strength_label_hi: string;
  score: number; // 0-100
  crack_time: string;
  crack_time_hi: string;
  character_pool: number;
  length: number;
  checks: Array<{
    label_en: string;
    label_hi: string;
    passed: boolean;
    impact: string;
  }>;
  suggestions_en: string[];
  suggestions_hi: string[];
  color: string;
};

const COMMON_PATTERNS = [
  'password', 'qwerty', 'abc123', '123456', '111111', 'iloveyou',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
  'test', 'pass', 'login', 'india', 'cricket', 'rahul', 'priya',
];

function calculateCharacterPool(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?/~`'"\\]/.test(password)) pool += 32;
  return pool;
}

function formatCrackTime(seconds: number): { en: string; hi: string } {
  if (seconds < 1) return { en: 'Instantly', hi: 'Turant' };
  if (seconds < 60) return { en: `${Math.round(seconds)} seconds`, hi: `${Math.round(seconds)} second` };
  if (seconds < 3600) return { en: `${Math.round(seconds / 60)} minutes`, hi: `${Math.round(seconds / 60)} minute` };
  if (seconds < 86400) return { en: `${Math.round(seconds / 3600)} hours`, hi: `${Math.round(seconds / 3600)} ghante` };
  if (seconds < 2592000) return { en: `${Math.round(seconds / 86400)} days`, hi: `${Math.round(seconds / 86400)} din` };
  if (seconds < 31536000) return { en: `${Math.round(seconds / 2592000)} months`, hi: `${Math.round(seconds / 2592000)} mahine` };
  const years = seconds / 31536000;
  if (years < 1000) return { en: `${Math.round(years)} years`, hi: `${Math.round(years)} saal` };
  if (years < 1e6) return { en: `${(years / 1000).toFixed(1)}K years`, hi: `${(years / 1000).toFixed(1)}K saal` };
  if (years < 1e9) return { en: `${(years / 1e6).toFixed(1)}M years`, hi: `${(years / 1e6).toFixed(1)} million saal` };
  if (years < 1e12) return { en: `${(years / 1e9).toFixed(1)}B years`, hi: `${(years / 1e9).toFixed(1)} billion saal` };
  return { en: 'Trillions of years', hi: 'Kharboon saal' };
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      entropy: 0, strength: 'VERY_WEAK', score: 0,
      strength_label_en: 'Enter a password', strength_label_hi: 'Password daalo',
      crack_time: '-', crack_time_hi: '-', character_pool: 0, length: 0,
      checks: [], suggestions_en: [], suggestions_hi: [], color: '#4A6080',
    };
  }

  const L = password.length;
  const R = calculateCharacterPool(password);

  // Entropy: E = L * log2(R)
  const entropy = R > 0 ? L * Math.log2(R) : 0;

  // Time to crack at 10^10 guesses per second
  const combinations = Math.pow(R, L);
  const GUESSES_PER_SECOND = 1e10;
  const secondsToCrack = combinations / (2 * GUESSES_PER_SECOND); // avg = half the space
  const crackTimeResult = formatCrackTime(secondsToCrack);

  // Checks
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?/~`'"\\]/.test(password);
  const isLongEnough = L >= 12;
  const hasNoRepeating = !/(.)\1{2,}/.test(password);
  const hasNoSequential = !/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(password);
  const isNotCommon = !COMMON_PATTERNS.some(p => password.toLowerCase().includes(p));

  const checks = [
    { label_en: 'Minimum 12 characters', label_hi: 'Kam se kam 12 characters', passed: isLongEnough, impact: '+20 entropy bits' },
    { label_en: 'Uppercase letters (A-Z)', label_hi: 'Uppercase letters (A-Z)', passed: hasUpper, impact: '+26 char pool' },
    { label_en: 'Lowercase letters (a-z)', label_hi: 'Lowercase letters (a-z)', passed: hasLower, impact: '+26 char pool' },
    { label_en: 'Numbers (0-9)', label_hi: 'Numbers (0-9)', passed: hasNumber, impact: '+10 char pool' },
    { label_en: 'Special characters (!@#$)', label_hi: 'Special characters (!@#$)', passed: hasSpecial, impact: '+32 char pool' },
    { label_en: 'No repeating characters (aaa)', label_hi: 'Repeating characters nahi (aaa)', passed: hasNoRepeating, impact: 'Prevents pattern guessing' },
    { label_en: 'No sequential patterns (123, abc)', label_hi: 'Sequential patterns nahi (123, abc)', passed: hasNoSequential, impact: 'Prevents dictionary attacks' },
    { label_en: 'Not a common password', label_hi: 'Common password nahi', passed: isNotCommon, impact: 'Avoids known breach lists' },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.min(100, Math.round(
    (entropy / 80) * 60 +
    (passedCount / checks.length) * 40
  ));

  let strength: PasswordStrength;
  let strength_label_en: string;
  let strength_label_hi: string;
  let color: string;

  if (score < 20) { strength = 'VERY_WEAK'; strength_label_en = 'Very Weak'; strength_label_hi = 'Bahut Kamzor'; color = '#FF4D4D'; }
  else if (score < 40) { strength = 'WEAK'; strength_label_en = 'Weak'; strength_label_hi = 'Kamzor'; color = '#FF8C00'; }
  else if (score < 60) { strength = 'FAIR'; strength_label_en = 'Fair'; strength_label_hi = 'Theek Thak'; color = '#FFB800'; }
  else if (score < 80) { strength = 'STRONG'; strength_label_en = 'Strong'; strength_label_hi = 'Mazboot'; color = '#00E5FF'; }
  else { strength = 'VERY_STRONG'; strength_label_en = 'Very Strong'; strength_label_hi = 'Bahut Mazboot'; color = '#00FF66'; }

  const suggestions_en: string[] = [];
  const suggestions_hi: string[] = [];

  if (!isLongEnough) { suggestions_en.push('Make it at least 12 characters long'); suggestions_hi.push('Kam se kam 12 characters lamba banao'); }
  if (!hasUpper) { suggestions_en.push('Add uppercase letters'); suggestions_hi.push('Uppercase letters add karo'); }
  if (!hasSpecial) { suggestions_en.push('Add special characters like !@#$'); suggestions_hi.push('!@#$ jaise special characters add karo'); }
  if (!isNotCommon) { suggestions_en.push('Avoid common passwords and dictionary words'); suggestions_hi.push('Common passwords aur dictionary words mat use karo'); }
  if (!hasNoSequential) { suggestions_en.push('Avoid sequential patterns like 123 or abc'); suggestions_hi.push('123 ya abc jaise sequential patterns mat use karo'); }

  return {
    entropy: Math.round(entropy * 10) / 10,
    strength, score, strength_label_en, strength_label_hi,
    crack_time: crackTimeResult.en,
    crack_time_hi: crackTimeResult.hi,
    character_pool: R, length: L,
    checks, suggestions_en, suggestions_hi, color,
  };
}
