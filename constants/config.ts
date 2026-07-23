// App Configuration & Constants

export const APP_CONFIG = {
  name: 'AI Cyber Shield',
  tagline_en: "Your Digital Bodyguard",
  tagline_hi: "Har User ka Digital Bodyguard",
  version: '1.0.0',
  helpline: '1930',
  cybercrime_url: 'https://cybercrime.gov.in',
};

export const SCORE_WEIGHTS = {
  password: 0.15,      // Password strength test result: 15%
  healthCheck: 0.35,   // Health check questionnaire: 35%
  learning: 0.25,      // Learning modules completed: 25%
  cleanScans: 0.25,    // Clean scans ratio: 25%
};

export const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.free', '.click', '.tk', '.ml', '.ga', '.cf',
  '.gq', '.pw', '.win', '.bid', '.download', '.stream', '.racing',
  '.accountant', '.loan', '.review', '.trade', '.webcam',
];

export const PHISHING_PATTERNS = [
  'login-verify', 'bank-update', 'upi-claim', 'free-recharge',
  'account-secure', 'verify-now', 'kyc-update', 'otp-verify',
  'secure-login', 'update-payment', 'confirm-identity', 'prize-claim',
  'reward-collect', 'aadhar-link', 'pan-verify', 'emi-due',
  'electricity-bill', 'account-suspended', 'urgent-action',
];

export const SCAM_PATTERNS = {
  jobScam: [
    /earn\s*₹?\s*\d{3,}.*?(daily|per day|a day|per hour)/i,
    /telegram.*?(task|job|work)/i,
    /work from home.*?(₹|rs\.?|inr)/i,
    /part.?time.*?(₹\d{3,}|earn)/i,
    /typing.*?job.*?(₹|earn)/i,
    /investment.*?return.*?(%|per|daily)/i,
    /\d{1,3}%\s*daily\s*return/i,
  ],
  upiScam: [
    /electricity.*(unpaid|due|cut|disconnect)/i,
    /bank\s*account\s*(suspend|block|freez)/i,
    /kyc\s*(pending|expir|update|verif)/i,
    /your\s*(upi|account|card)\s*(blocked|suspend|deactivat)/i,
    /link\s*your\s*(aadhaar|pan|account)/i,
    /urgent.*?(payment|transfer|send money)/i,
    /otp.*?(share|give|send|tell)/i,
  ],
  lotteryScam: [
    /you\s*(have|ve)?\s*won/i,
    /congratulations.*?(prize|winner|lottery|lucky)/i,
    /claim\s*(your|the)?\s*(prize|reward|gift)/i,
    /parcel.*?(stuck|held|customs)/i,
    /delivery.*?(fee|charge|clear)/i,
    /customs\s*(duty|clearance|fee)/i,
    /lucky\s*(draw|winner|number)/i,
  ],
  sexScam: [
    /video.*?(leak|viral|expose|share)/i,
    /screenshot.*?share/i,
    /pay.*?or.*?(expose|share|leak)/i,
    /blackmail/i,
    /sextortion/i,
  ],
};

export const LEARNING_MODULES = [
  {
    id: 'phishing_101',
    title_en: 'Phishing 101',
    title_hi: 'Phishing: Jaal Mein Mat Phaso',
    icon: 'phishing',
    difficulty: 'Beginner',
    xp: 100,
    badge_id: 'phishing_slayer',
    questions: [
      {
        q_en: 'What is phishing?',
        q_hi: 'Phishing kya hota hai?',
        options_en: [
          'A real bank calling for KYC',
          'Fake messages/emails to steal your data',
          'A government notification',
          'A valid UPI request',
        ],
        options_hi: [
          'Bank ka real call KYC ke liye',
          'Fake messages/emails data churane ke liye',
          'Government ki notification',
          'Valid UPI request',
        ],
        correct: 1,
        explanation_en: 'Phishing uses fake messages that look real to steal your passwords, OTPs, and bank details.',
        explanation_hi: 'Phishing mein fake messages bheje jaate hain jo real lagte hain — taaki aapka password, OTP, aur bank detail chura sake.',
      },
      {
        q_en: 'You receive: "Your SBI account is suspended. Click here to verify." What do you do?',
        q_hi: 'Message aaya: "Aapka SBI account suspend ho gaya. Verify karein." Aap kya karenge?',
        options_en: [
          'Click the link immediately',
          'Share it with family',
          'Delete it & call SBI official number',
          'Reply with your card details',
        ],
        options_hi: [
          'Turant link click karo',
          'Family ko share karo',
          'Delete karo aur SBI official number pe call karo',
          'Reply mein card details bhejo',
        ],
        correct: 2,
        explanation_en: 'Banks NEVER ask for account details via SMS. Always call the official helpline.',
        explanation_hi: 'Banks kabhi bhi SMS se account details nahi maangti. Hamesha official helpline pe call karo.',
      },
      {
        q_en: 'Which URL looks most suspicious?',
        q_hi: 'Konsa URL sabse zyada suspicious lagta hai?',
        options_en: [
          'https://sbi.co.in',
          'https://sbi-login-verify.xyz/account',
          'https://onlinesbi.sbi',
          'https://retail.onlinesbi.sbi',
        ],
        options_hi: [
          'https://sbi.co.in',
          'https://sbi-login-verify.xyz/account',
          'https://onlinesbi.sbi',
          'https://retail.onlinesbi.sbi',
        ],
        correct: 1,
        explanation_en: 'The .xyz TLD is highly suspicious. Real SBI uses .sbi or .co.in domains. The "login-verify" phrase is also a known phishing indicator.',
        explanation_hi: '.xyz domain bohot suspicious hai. Real SBI .sbi ya .co.in use karta hai. "login-verify" bhi phishing indicator hai.',
      },
    ],
  },
  {
    id: 'otp_shield',
    title_en: 'OTP Shield Master',
    title_hi: 'OTP Bachao, Paise Bachao',
    icon: 'security',
    difficulty: 'Beginner',
    xp: 100,
    badge_id: 'otp_shield_master',
    questions: [
      {
        q_en: 'Someone claiming to be "Airtel customer care" asks for your OTP. What should you do?',
        q_hi: '"Airtel customer care" bolke koi aapka OTP maang raha hai. Kya karein?',
        options_en: [
          'Give them the OTP - they are from Airtel',
          'NEVER share OTP with anyone, ever',
          'Give the last 4 digits only',
          'Share OTP after verifying their ID',
        ],
        options_hi: [
          'OTP de do — Airtel waale hain',
          'KABHI bhi OTP kisi ko mat batao',
          'Sirf last 4 digits do',
          'ID verify karke OTP do',
        ],
        correct: 1,
        explanation_en: 'OTP is like a key to your bank vault. NO legitimate company will EVER ask for your OTP. Not Airtel, not your bank, not anyone.',
        explanation_hi: 'OTP aapke bank vault ki chabi hai. Koi bhi legitimate company kabhi OTP nahi maangti — na Airtel, na Bank, koi nahi.',
      },
      {
        q_en: 'You accidentally shared your OTP. What is your FIRST action?',
        q_hi: 'Galti se OTP share ho gaya. Sabse PEHLE kya karein?',
        options_en: [
          'Wait and see if anything happens',
          'Tell a family member',
          'Immediately block your card & contact bank',
          'Change your email password',
        ],
        options_hi: [
          'Wait karo aur dekho kya hota hai',
          'Family member ko batao',
          'Turant card block karo aur bank ko call karo',
          'Email password change karo',
        ],
        correct: 2,
        explanation_en: 'SPEED IS CRITICAL. Call your bank immediately (use number on the back of your card) and block all transactions before any money is moved.',
        explanation_hi: 'SPEED ZAROORI HAI. Apne bank ko turant call karo (card ke peeche number hai) aur sab transactions block karo pehle kuch ho.',
      },
    ],
  },
  {
    id: 'deepfake_detector',
    title_en: 'Deepfake & AI Scams',
    title_hi: 'Deepfake Scam Pakdo',
    icon: 'psychology',
    difficulty: 'Intermediate',
    xp: 150,
    badge_id: 'deepfake_hunter',
    questions: [
      {
        q_en: 'What is a Deepfake?',
        q_hi: 'Deepfake kya hota hai?',
        options_en: [
          'A very deep swimming pool',
          'AI-generated fake video/audio of a real person',
          'A type of malware virus',
          'A fake bank website',
        ],
        options_hi: [
          'Ek bahut gehra swimming pool',
          'AI se banaya kisi real insaan ka fake video/audio',
          'Ek type ka malware virus',
          'Ek fake bank website',
        ],
        correct: 1,
        explanation_en: 'Deepfakes use AI to create convincing fake videos/audio. Scammers use deepfakes of your relatives to urgently demand money.',
        explanation_hi: 'Deepfakes mein AI se convincing fake video/audio banate hain. Scammers aapke rishtedaron ki deepfake banake emergency mein paise maangte hain.',
      },
      {
        q_en: 'Your friend video calls and urgently needs ₹50,000. What should you do?',
        q_hi: 'Dost ne video call karke urgently ₹50,000 maange. Kya karein?',
        options_en: [
          'Send immediately — they look genuine',
          'Hang up and call them back on their SAVED number',
          'Send half the amount first',
          'Ask for their bank account details',
        ],
        options_hi: [
          'Turant bhejo — genuine lag rahe hain',
          'Call kaato aur SAVED number pe callback karo',
          'Pehle aadha bhej do',
          'Bank account details maango',
        ],
        correct: 1,
        explanation_en: 'Always hang up and call back on the SAVED number in your contacts. Deepfake video calls look 100% real — the callback test breaks the scam.',
        explanation_hi: 'Hamesha call kato aur contacts mein saved number pe callback karo. Deepfake 100% real lagta hai — callback test scam tod deta hai.',
      },
    ],
  },
  {
    id: 'qr_scam',
    title_en: 'QR Code Danger Zone',
    title_hi: 'QR Code Scam se Bachao',
    icon: 'qr-code-scanner',
    difficulty: 'Intermediate',
    xp: 125,
    badge_id: 'qr_guardian',
    questions: [
      {
        q_en: 'Someone sends you a QR code saying "scan to RECEIVE ₹500." What is happening?',
        q_hi: 'Koi QR code bhejta hai: "scan karo ₹500 RECEIVE karne ke liye." Kya ho raha hai?',
        options_en: [
          'You will receive ₹500',
          'This is a scam — scanning will SEND money FROM your account',
          'A UPI cashback offer',
          'A legitimate payment request',
        ],
        options_hi: [
          'Aapko ₹500 milenge',
          'Scam hai — scan karne se aapke account se paise JAAYENGE',
          'UPI cashback offer',
          'Legitimate payment request',
        ],
        correct: 1,
        explanation_en: 'QR codes are for SENDING money, not receiving. You NEVER need to scan a QR code to receive money. "Scan karke paisa milega" is always a scam.',
        explanation_hi: 'QR codes BHEJNE ke liye hote hain, paane ke liye nahi. Paisa paane ke liye kabhi QR scan nahi karna. "Scan karke milega" hamesha scam hai.',
      },
    ],
  },
  {
    id: 'romance_scam',
    title_en: 'Romance & Honey Trap Scams',
    title_hi: 'Love Trap Scam Pehchano',
    icon: 'favorite',
    difficulty: 'Advanced',
    xp: 200,
    badge_id: 'love_guardian',
    questions: [
      {
        q_en: 'An attractive stranger online becomes your "best friend" in 2 weeks and asks for money for a medical emergency. What is this?',
        q_hi: 'Online ek attractive stranger 2 haftein mein "best friend" ban gaya aur medical emergency ke liye paise maang raha hai. Kya hai yeh?',
        options_en: [
          'True love — help them',
          'Classic romance/pig butchering scam',
          'A lonely person needing help',
          'A test of your friendship',
        ],
        options_hi: [
          'Sach mein pyaar — help karo',
          'Classic romance/pig butchering scam',
          'Ek akela insaan help chahta hai',
          'Dosti ka test',
        ],
        correct: 1,
        explanation_en: 'This is the "Pig Butchering" or romance scam formula: Build trust fast → Create emotional bond → Emergency money request → Disappear. Never send money to people you\'ve never met in real life.',
        explanation_hi: '"Pig Butchering" scam formula: Trust banao → Emotional bond banao → Emergency mein paise maango → Gayab ho jao. Jinse miloge nahi, unhe kabhi paise mat bhejo.',
      },
    ],
  },
];

export const BADGES = [
  { id: 'phishing_slayer', name_en: 'Phishing Slayer', name_hi: 'Phishing Slayer', icon: '🎣', color: '#00E5FF' },
  { id: 'otp_shield_master', name_en: 'OTP Shield Master', name_hi: 'OTP Shield Master', icon: '🛡️', color: '#00FF66' },
  { id: 'deepfake_hunter', name_en: 'Deepfake Hunter', name_hi: 'Deepfake Hunter', icon: '🤖', color: '#FFB800' },
  { id: 'qr_guardian', name_en: 'QR Guardian', name_hi: 'QR Guardian', icon: '📱', color: '#00E5FF' },
  { id: 'love_guardian', name_en: 'Love Guardian', name_hi: 'Love Guardian', icon: '💙', color: '#FF4D4D' },
  { id: 'first_scan', name_en: 'First Scan Done', name_hi: 'Pehla Scan', icon: '🔍', color: '#00FF66' },
  { id: 'health_check', name_en: 'Health Champion', name_hi: 'Health Champion', icon: '💪', color: '#00FF66' },
  { id: 'password_master', name_en: 'Password Master', name_hi: 'Password Master', icon: '🔐', color: '#FFB800' },
];

export const HEALTH_QUESTIONS = [
  {
    id: 'q1',
    q_en: 'Do you have a screen lock (PIN/fingerprint) on your phone?',
    q_hi: 'Kya aapke phone mein screen lock (PIN/fingerprint) laga hua hai?',
    weight: 10,
    options_en: ['Yes, always', 'Sometimes', 'No'],
    options_hi: ['Haan, hamesha', 'Kabhi kabhi', 'Nahi'],
    risk_on: [1, 2],
  },
  {
    id: 'q2',
    q_en: 'Have you installed apps from outside the Play Store / App Store (APK files)?',
    q_hi: 'Kya aapne Play Store / App Store ke bahar se apps install kiye hain (APK files)?',
    weight: 15,
    options_en: ['No, never', 'Yes, a few times', 'Yes, regularly'],
    options_hi: ['Nahi, kabhi nahi', 'Haan, kuch baar', 'Haan, aksar'],
    risk_on: [1, 2],
  },
  {
    id: 'q3',
    q_en: 'Have you given "Accessibility" permissions to any messaging or utility apps?',
    q_hi: 'Kya aapne kisi messaging ya utility app ko "Accessibility" permission di hai?',
    weight: 15,
    options_en: ['No', 'Yes, to one app', 'Yes, to multiple apps', "Don't know"],
    options_hi: ['Nahi', 'Haan, ek app ko', 'Haan, kai apps ko', 'Pata nahi'],
    risk_on: [1, 2, 3],
  },
  {
    id: 'q4',
    q_en: 'Is your phone OS updated to the latest version?',
    q_hi: 'Kya aapka phone OS latest version pe updated hai?',
    weight: 10,
    options_en: ['Yes, always updated', 'Slightly outdated', 'Very outdated / Never updated'],
    options_hi: ['Haan, hamesha updated', 'Thoda outdated', 'Bahut outdated / Kabhi update nahi kiya'],
    risk_on: [1, 2],
  },
  {
    id: 'q5',
    q_en: 'Do you use public Wi-Fi for banking or UPI transactions?',
    q_hi: 'Kya aap banking ya UPI ke liye public Wi-Fi use karte hain?',
    weight: 10,
    options_en: ['No, never', 'Sometimes for UPI', 'Yes, regularly'],
    options_hi: ['Nahi, kabhi nahi', 'Kabhi kabhi UPI ke liye', 'Haan, aksar'],
    risk_on: [1, 2],
  },
  {
    id: 'q6',
    q_en: 'Have you received any suspicious calls claiming to be bank/police/courier recently?',
    q_hi: 'Kya aapko haal mein bank/police/courier ka natak karte koi suspicious call aaya?',
    weight: 5,
    options_en: ['No', 'Yes, 1-2 calls', 'Yes, many calls'],
    options_hi: ['Nahi', 'Haan, 1-2 calls', 'Haan, kai calls'],
    risk_on: [1, 2],
  },
  {
    id: 'q7',
    q_en: 'Do you reuse the same password across multiple accounts?',
    q_hi: 'Kya aap ek hi password kai accounts mein use karte hain?',
    weight: 10,
    options_en: ['No, all different', 'Some are same', 'Yes, mostly same'],
    options_hi: ['Nahi, sab alag', 'Kuch same hain', 'Haan, zyaadatar same'],
    risk_on: [1, 2],
  },
];

export const CHAT_RESPONSES: Record<string, { en: string; hi: string }> = {
  whatsapp_hacked: {
    en: `🚨 **IMMEDIATE STEPS if WhatsApp is hacked:**

1. **Go to WhatsApp Settings → Linked Devices → Log out all devices**
2. **Enable Two-Step Verification:** Settings → Account → Two-step verification
3. **Revoke access from unknown apps** in your Google/Apple account
4. **Inform your contacts** — the hacker may message them for money
5. **File a complaint** at cybercrime.gov.in or call 1930

Do you want me to help you draft a complaint?`,
    hi: `🚨 **WhatsApp hack hone par TURANT karo:**

1. **WhatsApp Settings → Linked Devices → Sab logout karo**
2. **Two-Step Verification on karo:** Settings → Account → Two-step verification
3. **Unknown apps ka access revoke karo** apne Google/Apple account se
4. **Apne contacts ko batao** — hacker unse paise maang sakta hai
5. **Complaint karo** cybercrime.gov.in pe ya 1930 call karo

Kya main complaint draft karne mein help karoon?`,
  },
  otp_shared: {
    en: `⚠️ **OTP shared accidentally — Do THIS INSTANTLY:**

1. **Call your bank RIGHT NOW** (number on back of your card)
2. Say: "Block all transactions immediately — my OTP was compromised"
3. **Change your UPI PIN** in your payments app
4. **Check recent transactions** for any unauthorized debits
5. If money was stolen, file at **cybercrime.gov.in** or **call 1930**

⏱️ You have a narrow window — every second counts!`,
    hi: `⚠️ **OTP share ho gaya — YEH ABHI KARO:**

1. **ABHI TURANT bank call karo** (card ke peeche number hai)
2. Kaho: "Mera OTP compromise hua hai — sab transactions block karo"
3. **UPI PIN change karo** apne payments app mein
4. **Recent transactions check karo** koi unauthorized debit to nahi
5. Agar paise gaye, **cybercrime.gov.in** pe ya **1930** pe shikayat karo

⏱️ Time bahut kam hai — har second maayane rakhta hai!`,
  },
  sextortion: {
    en: `🔴 **Sextortion/Blackmail — YOU ARE NOT ALONE:**

**DO NOT:**
- ❌ Pay any money (they will demand more)
- ❌ Continue talking to them
- ❌ Delete the evidence (screenshots, chats)

**DO:**
1. **Block the contact immediately** across all platforms
2. **Take screenshots** of all their messages as evidence
3. **Report the profile** on WhatsApp/Instagram/Facebook
4. **Call 1930** or visit cybercrime.gov.in
5. **Know this:** Sharing your video only happens if you pay — they bluff

You are NOT at fault. This is a CRIME against YOU.`,
    hi: `🔴 **Sextortion/Blackmail — Akele nahi ho aap:**

**YEH MAT KARO:**
- ❌ Koi paise mat do (aur maangenge)
- ❌ Unse baat karna band karo
- ❌ Evidence mat delete karo (screenshots, chats)

**YEH KARO:**
1. **Turant block karo** sab platforms pe
2. **Screenshots lo** — yeh aapka evidence hai
3. **WhatsApp/Instagram/Facebook pe report karo**
4. **1930 call karo** ya cybercrime.gov.in jaao
5. **Yaad rakho:** Video tab share hoti hai jab darte raho — yeh sirf bluff hai

Aap galat nahi hain. Yeh crime AAPKE SAATH ho raha hai.`,
  },
  default: {
    en: `I'm your AI Cyber Shield assistant. I can help you with:

🔍 **Suspicious links/URLs** — paste them for analysis
📱 **Scam SMS/WhatsApp** — describe or paste the text
🔑 **OTP or password issues** — I'll guide you step by step
🚨 **Cyber emergencies** — use the Emergency Mode button above
📚 **Cyber safety questions** — ask me anything

What cybersecurity concern can I help you with today?`,
    hi: `Main aapka AI Cyber Shield assistant hoon. Main aapki help kar sakta hoon:

🔍 **Suspicious links/URLs** — paste karo analysis ke liye
📱 **Scam SMS/WhatsApp** — text batao ya paste karo
🔑 **OTP ya password issues** — step by step guide karoonga
🚨 **Cyber emergency** — upar Emergency Mode button use karo
📚 **Cyber safety sawaal** — kuch bhi pucho

Aaj main kaunsi cybersecurity problem mein help karoon?`,
  },
};
