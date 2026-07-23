// Chat Service — Intelligent response routing with conversation memory

import { CHAT_RESPONSES } from '@/constants/config';

type Language = 'en' | 'hi';

export type ChatMessage = {
  id: string;
  message: string;
  sender: 'USER' | 'AI_BOT';
  timestamp: string;
};

export function getAIResponse(userMessage: string, lang: Language): string {
  const msg = userMessage.toLowerCase();

  // Intent detection
  if (/(whatsapp|telegram|instagram|facebook).*(hack|hacked|stolen|compromise|hijack)/i.test(msg)) {
    return CHAT_RESPONSES.whatsapp_hacked[lang];
  }

  if (/(otp|one.?time.?password).*(share|diya|bata|gave|sent|told)/i.test(msg) ||
      /(share|diya|bata|gave|sent).*(otp)/i.test(msg)) {
    return CHAT_RESPONSES.otp_shared[lang];
  }

  if (/(sextortion|blackmail|video|leak|expose|nude|intimate)/i.test(msg)) {
    return CHAT_RESPONSES.sextortion[lang];
  }

  if (/(bank|upi|paytm|gpay|phonepay|account).*(fraud|scam|hack|stolen|debit|cheat)/i.test(msg) ||
      /(paise|money|amount|rupees|rs|₹).*(gaye|gone|stolen|deducted|cut)/i.test(msg)) {
    return lang === 'hi'
      ? `🚨 **Bank/UPI Fraud ho gaya? Yeh ABHI karo:**

1. **TURANT apne bank ko call karo** — card ke peeche number hai
2. Kaho: "Unauthorized transaction hua hai — freeze karo"
3. **UPI PIN change karo** apne payments app mein
4. **RBI Ombudsman** ko report karo: cms.rbi.org.in
5. **Cybercrime.gov.in** pe complaint file karo (7 din ke andar)
6. **National Cyber Crime Helpline: 1930** pe call karo

Kya tumhare account se paise gaye hain? Kitne?`
      : `🚨 **Bank/UPI Fraud? Do THIS IMMEDIATELY:**

1. **Call your bank RIGHT NOW** (number on back of card)
2. Say: "Unauthorized transaction — freeze all activity"
3. **Change your UPI PIN** in your payments app
4. **RBI Ombudsman**: cms.rbi.org.in
5. **File complaint**: cybercrime.gov.in (within 7 days)
6. **National Cyber Crime Helpline: 1930**

Did money get debited from your account? How much?`;
  }

  if (/(deepfake|video call|impersonat|fake call|friend.*money|relative.*money)/i.test(msg)) {
    return lang === 'hi'
      ? `⚠️ **Deepfake/Impersonation Scam ho sakta hai:**

Agar kisi "dost" ya "relative" ne video call karke paise maange hain:

1. **Call kaato** aur apne SAVED number pe callback karo
2. **Deepfake technology** real lagne wale fake video call banata hai
3. Callback test scam todta hai — agar woh nahi utha, 100% scam tha
4. Inhe 1930 pe report karo
5. Apne social media account privacy settings check karo

Kya aapne paise bheje?`
      : `⚠️ **Possible Deepfake / Impersonation Scam:**

If a "friend" or "relative" video-called asking for money:

1. **Hang up** and call them back on their SAVED contact number
2. **Deepfake technology** creates realistic fake video calls
3. The callback test breaks the scam — if unreachable, it WAS a scam
4. Report at 1930
5. Check your social media privacy settings

Did you send any money?`;
  }

  if (/(sim|mobile number|phone number).*(swap|hijack|clone|port)/i.test(msg)) {
    return lang === 'hi'
      ? `🔴 **SIM Swap Fraud:**

1. **Turant dial karo *121#** — check karo SIM active hai ya nahi
2. Agar SIM band hai, **Airtel/Jio/BSNL store jaao** ID proof ke saath
3. **Bank accounts check karo** — SIM swap ke baad fraud turant hota hai
4. New SIM milte hi **2-step verification reset karo** sab apps pe
5. **Report**: cybercrime.gov.in ya 1930`
      : `🔴 **SIM Swap Fraud:**

1. **Dial *121#** immediately — check if your SIM is active
2. If SIM is dead, **visit your carrier store** with ID proof
3. **Check all bank accounts** — fraud happens immediately after SIM swap
4. Once SIM restored, **reset 2FA** on all apps
5. **Report**: cybercrime.gov.in or 1930`;
  }

  if (/(job|naukri|earn|income|salary|work from home|ghar se kaam)/i.test(msg)) {
    return lang === 'hi'
      ? `⚠️ **Fake Job Scam Alert:**

Job scam ke warning signs:
- WhatsApp/Telegram pe job offer
- Guaranteed daily/weekly income
- Pehle registration fee maangna
- No interview process

**Verify karne ke liye:**
1. Company ko MCA21.gov.in pe search karo
2. Official website check karo (Google pe dhundho)
3. Koi bhi fee advance mein mat bhejo

Kya aapko koi specific job offer mila hai?`
      : `⚠️ **Fake Job Scam Warning:**

Red flags in job scams:
- Job offer via WhatsApp/Telegram
- Guaranteed daily/weekly income
- Upfront registration fee demanded
- No formal interview process

**To verify:**
1. Search company on MCA21.gov.in
2. Check official website (Google it independently)
3. NEVER pay any fee for a job

Did you receive a specific job offer?`;
  }

  // Default
  return CHAT_RESPONSES.default[lang];
}

export const QUICK_PROMPTS = [
  {
    label_en: 'WhatsApp hacked?',
    label_hi: 'WhatsApp hack hua?',
    message_en: 'My WhatsApp has been hacked. What should I do immediately?',
    message_hi: 'Mera WhatsApp hack ho gaya hai. Main abhi kya karoon?',
    icon: 'chat',
    color: '#25D366',
  },
  {
    label_en: 'Shared OTP',
    label_hi: 'OTP de diya',
    message_en: 'I accidentally shared my OTP with someone. What do I do now?',
    message_hi: 'Maine galti se kisi ko OTP de diya. Ab kya karoon?',
    icon: 'key',
    color: '#FF4D4D',
  },
  {
    label_en: 'Bank fraud',
    label_hi: 'Bank fraud',
    message_en: 'Money was deducted from my bank account without my permission.',
    message_hi: 'Mere bank account se bina permission ke paise kat gaye.',
    icon: 'account-balance',
    color: '#FFB800',
  },
  {
    label_en: 'Blackmail call',
    label_hi: 'Blackmail call',
    message_en: 'I received a sextortion or blackmail call threatening to expose a video.',
    message_hi: 'Mujhe blackmail call aayi video expose karne ki dhamki ke saath.',
    icon: 'warning',
    color: '#FF4D4D',
  },
];
