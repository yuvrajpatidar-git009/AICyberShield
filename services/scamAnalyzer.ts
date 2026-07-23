// Scam Text Analysis Engine
// Heuristic regex & pattern-matching engine

import { SCAM_PATTERNS } from '@/constants/config';

export type ScamCategory = 'JOB_SCAM' | 'UPI_KYC_SCAM' | 'LOTTERY_SCAM' | 'SEXTORTION' | 'CLEAN';

export type ScamAnalysisResult = {
  risk_level: 'SAFE' | 'WARNING' | 'DANGEROUS';
  overall_score: number;
  category: ScamCategory;
  category_label_en: string;
  category_label_hi: string;
  detected_triggers: Array<{
    text: string;
    reason_en: string;
    reason_hi: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  highlighted_text: Array<{ text: string; isScam: boolean }>;
  guidance_en: string[];
  guidance_hi: string[];
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeScamText(
  text: string,
  onLog: (log: string) => void
): Promise<ScamAnalysisResult> {
  await sleep(300);
  onLog('> Preprocessing text input...');
  await sleep(300);
  onLog('> Loading scam pattern database...');

  const detectedTriggers: ScamAnalysisResult['detected_triggers'] = [];
  let riskScore = 0;
  let dominantCategory: ScamCategory = 'CLEAN';
  const categoryScores: Record<string, number> = { JOB_SCAM: 0, UPI_KYC_SCAM: 0, LOTTERY_SCAM: 0, SEXTORTION: 0 };

  // Job Scam Patterns
  await sleep(400);
  onLog('> Analyzing for fraudulent job offer patterns...');
  for (const pattern of SCAM_PATTERNS.jobScam) {
    const match = text.match(pattern);
    if (match) {
      categoryScores['JOB_SCAM'] += 25;
      riskScore += 25;
      detectedTriggers.push({
        text: match[0],
        reason_en: 'Unrealistic earning claim — common in fake job/investment scams',
        reason_hi: 'Nakli earning claim — fake job/investment scam mein common',
        severity: 'HIGH',
      });
    }
  }

  // UPI/KYC Scam Patterns
  await sleep(400);
  onLog('> Scanning for UPI/KYC fraud indicators...');
  for (const pattern of SCAM_PATTERNS.upiScam) {
    const match = text.match(pattern);
    if (match) {
      categoryScores['UPI_KYC_SCAM'] += 20;
      riskScore += 20;
      detectedTriggers.push({
        text: match[0],
        reason_en: 'Urgency tactic to force immediate action — classic bank/KYC fraud',
        reason_hi: 'Urgency tactic — turant action ke liye force karna — classic bank/KYC fraud',
        severity: 'HIGH',
      });
    }
  }

  // Lottery/Courier Scam Patterns
  await sleep(300);
  onLog('> Checking for lottery/prize/courier scam patterns...');
  for (const pattern of SCAM_PATTERNS.lotteryScam) {
    const match = text.match(pattern);
    if (match) {
      categoryScores['LOTTERY_SCAM'] += 20;
      riskScore += 20;
      detectedTriggers.push({
        text: match[0],
        reason_en: 'False prize/courier claim — designed to extract upfront fees',
        reason_hi: 'Nakli prize/courier claim — pehle fees maangne ke liye',
        severity: 'HIGH',
      });
    }
  }

  // Sextortion Patterns
  await sleep(300);
  onLog('> Scanning for blackmail/sextortion indicators...');
  for (const pattern of SCAM_PATTERNS.sexScam) {
    const match = text.match(pattern);
    if (match) {
      categoryScores['SEXTORTION'] += 30;
      riskScore += 30;
      detectedTriggers.push({
        text: match[0],
        reason_en: 'Blackmail/sextortion threat — designed to create fear and extract money',
        reason_hi: 'Blackmail threat — darake paise maangne ki koshish',
        severity: 'HIGH',
      });
    }
  }

  // Additional heuristics
  await sleep(300);
  onLog('> Running additional heuristic checks...');

  // Phone number urgency
  if (/call\s*(now|immediately|urgent|turant)/i.test(text)) {
    riskScore += 10;
    detectedTriggers.push({
      text: 'Urgent call to action',
      reason_en: 'Urgency tactics pressure victims into acting without thinking',
      reason_hi: 'Urgency tactic — sochne ka mauka nahi deta',
      severity: 'MEDIUM',
    });
  }

  // Money transfer mentions
  if (/(send|transfer|pay|bhejo|de do)\s*(rs\.?|₹|\d)/i.test(text)) {
    riskScore += 15;
    detectedTriggers.push({
      text: 'Direct money transfer request',
      reason_hi: 'Direct paise transfer request — scam ka strong indicator',
      reason_en: 'Direct money transfer request — strong scam indicator',
      severity: 'HIGH',
    });
  }

  // Determine dominant category
  const maxScore = Math.max(...Object.values(categoryScores));
  if (maxScore > 0) {
    dominantCategory = Object.keys(categoryScores).find(
      k => categoryScores[k] === maxScore
    ) as ScamCategory;
  }

  const clampedScore = Math.min(100, riskScore);

  let risk_level: 'SAFE' | 'WARNING' | 'DANGEROUS';
  if (clampedScore >= 50) risk_level = 'DANGEROUS';
  else if (clampedScore >= 20) risk_level = 'WARNING';
  else risk_level = 'SAFE';

  await sleep(400);
  onLog(`> Analysis complete. Risk Score: ${clampedScore}% — ${risk_level}`);

  const categoryLabels: Record<ScamCategory, { en: string; hi: string }> = {
    JOB_SCAM: { en: 'Fake Job / Investment Scam', hi: 'Nakli Job / Investment Scam' },
    UPI_KYC_SCAM: { en: 'UPI / KYC / Bank Fraud', hi: 'UPI / KYC / Bank Fraud' },
    LOTTERY_SCAM: { en: 'Lottery / Prize / Courier Scam', hi: 'Lottery / Prize / Courier Scam' },
    SEXTORTION: { en: 'Blackmail / Sextortion Threat', hi: 'Blackmail / Sextortion Threat' },
    CLEAN: { en: 'No Scam Detected', hi: 'Koi Scam Nahi Mila' },
  };

  const guidanceMap: Record<ScamCategory, { en: string[]; hi: string[] }> = {
    JOB_SCAM: {
      en: [
        'No legitimate employer offers jobs via WhatsApp/Telegram with guaranteed daily earnings.',
        'Never pay any "registration fee" or "training fee" for a job offer.',
        'Verify the company on MCA21 (Ministry of Corporate Affairs) portal.',
        'Report at cybercrime.gov.in or call 1930.',
      ],
      hi: [
        'Koi bhi legitimate employer WhatsApp/Telegram pe guaranteed daily earning wali job nahi deta.',
        'Job offer ke liye kabhi "registration fee" ya "training fee" mat do.',
        'Company ko MCA21 (Ministry of Corporate Affairs) portal pe verify karo.',
        'cybercrime.gov.in pe report karo ya 1930 call karo.',
      ],
    },
    UPI_KYC_SCAM: {
      en: [
        'Banks NEVER ask for OTP, PIN, or card details via SMS or call.',
        'Do NOT click any link in the message — go directly to the bank website.',
        'Call your bank\'s official helpline if you are worried about your account.',
        'If you already shared details, call your bank IMMEDIATELY to block.',
      ],
      hi: [
        'Banks kabhi bhi SMS ya call se OTP, PIN, ya card details nahi maangte.',
        'Message mein link mat click karo — seedha bank website pe jao.',
        'Account ke baare mein agar darr hai, bank ki official helpline call karo.',
        'Agar details share ho gayi, TURANT bank call karo aur block karo.',
      ],
    },
    LOTTERY_SCAM: {
      en: [
        'You CANNOT win a lottery you never entered.',
        'Courier/customs fees are never paid in advance via personal UPI.',
        'All "prize claims" requiring payment first are 100% scams.',
        'Ignore and delete this message. Report at 1930.',
      ],
      hi: [
        'Jo lottery kheli hi nahi, usme jeet nahi sakte.',
        'Courier/customs fees kabhi personal UPI se advance mein nahi dete.',
        'Pehle payment maangne wali sab "prize claims" 100% scam hain.',
        'Yeh message delete karo. 1930 pe report karo.',
      ],
    },
    SEXTORTION: {
      en: [
        'DO NOT pay — it escalates demands, it never ends.',
        'Block the contact on ALL platforms immediately.',
        'Take screenshots of all their messages as evidence.',
        'Call 1930 or visit your nearest cyber cell — this is a crime AGAINST you.',
        'You are NOT at fault. These are criminal networks.',
      ],
      hi: [
        'PAISE MAT DO — demand badhti jaati hai, khatam nahi hoti.',
        'Sab platforms pe turant block karo.',
        'Sab messages ke screenshots lo — yeh evidence hai.',
        '1930 call karo ya nearest cyber cell jao — yeh crime AAPKE SAATH ho raha hai.',
        'Aap galat nahi hain. Yeh criminal network hai.',
      ],
    },
    CLEAN: {
      en: ['No significant scam patterns detected in this text.', 'Always stay cautious with unknown messages.'],
      hi: ['Koi scam pattern nahi mila is text mein.', 'Anjaan messages mein hamesha sawdhaan raho.'],
    },
  };

  // Build highlighted text
  const highlighted = buildHighlightedText(text, detectedTriggers);

  return {
    risk_level,
    overall_score: clampedScore,
    category: dominantCategory,
    category_label_en: categoryLabels[dominantCategory].en,
    category_label_hi: categoryLabels[dominantCategory].hi,
    detected_triggers: detectedTriggers,
    highlighted_text: highlighted,
    guidance_en: guidanceMap[dominantCategory].en,
    guidance_hi: guidanceMap[dominantCategory].hi,
  };
}

function buildHighlightedText(
  text: string,
  triggers: ScamAnalysisResult['detected_triggers']
): Array<{ text: string; isScam: boolean }> {
  if (triggers.length === 0) return [{ text, isScam: false }];

  const parts: Array<{ text: string; isScam: boolean }> = [];
  let lastIndex = 0;
  const lowerText = text.toLowerCase();

  const sortedTriggers = triggers
    .filter(t => t.text.length > 3)
    .sort((a, b) => {
      const idxA = lowerText.indexOf(a.text.toLowerCase());
      const idxB = lowerText.indexOf(b.text.toLowerCase());
      return idxA - idxB;
    });

  for (const trigger of sortedTriggers) {
    const idx = lowerText.indexOf(trigger.text.toLowerCase(), lastIndex);
    if (idx === -1) continue;

    if (idx > lastIndex) {
      parts.push({ text: text.slice(lastIndex, idx), isScam: false });
    }
    parts.push({ text: text.slice(idx, idx + trigger.text.length), isScam: true });
    lastIndex = idx + trigger.text.length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isScam: false });
  }

  return parts.length > 0 ? parts : [{ text, isScam: false }];
}
