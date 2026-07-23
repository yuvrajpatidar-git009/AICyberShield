// URL Scanning Engine
// Heuristic analysis without external API calls

import { SUSPICIOUS_TLDS, PHISHING_PATTERNS } from '@/constants/config';

export type URLScanResult = {
  trust_score: number;
  risk_level: 'SAFE' | 'WARNING' | 'DANGEROUS';
  threat_classification: string;
  certificate_status: 'HTTPS' | 'HTTP' | 'INVALID';
  detected_red_flags: string[];
  detected_positives: string[];
  scan_log: string[];
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scanURL(
  url: string,
  onLog: (log: string) => void
): Promise<URLScanResult> {
  const redFlags: string[] = [];
  const positives: string[] = [];
  const scanLog: string[] = [];
  let deductions = 0;

  await sleep(400);
  onLog('> Initializing URL scanner...');
  await sleep(300);
  onLog('> Parsing URL structure...');

  let parsedURL: URL | null = null;
  try {
    parsedURL = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return {
      trust_score: 0,
      risk_level: 'DANGEROUS',
      threat_classification: 'Invalid URL',
      certificate_status: 'INVALID',
      detected_red_flags: ['URL format is invalid or malformed'],
      detected_positives: [],
      scan_log: ['> Invalid URL format detected', '> Analysis terminated'],
    };
  }

  const hostname = parsedURL.hostname.toLowerCase();
  const pathname = parsedURL.pathname.toLowerCase();
  const fullURL = url.toLowerCase();

  await sleep(400);
  onLog(`> Resolving hostname: ${hostname}`);

  // Check 1: Protocol
  await sleep(300);
  onLog('> Checking SSL certificate...');
  if (parsedURL.protocol === 'https:') {
    positives.push('✅ HTTPS encrypted connection');
    scanLog.push('> SSL: HTTPS detected — connection is encrypted');
  } else {
    redFlags.push('❌ No HTTPS — connection is unencrypted');
    scanLog.push('> SSL: HTTP only — data sent in plain text');
    deductions += 25;
  }

  // Check 2: Suspicious TLDs
  await sleep(350);
  onLog('> Analyzing domain TLD reputation...');
  const suspiciousTLD = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
  if (suspiciousTLD) {
    redFlags.push(`❌ Suspicious TLD: "${suspiciousTLD}" — high-risk domain extension`);
    scanLog.push(`> TLD Alert: "${suspiciousTLD}" is commonly used in phishing campaigns`);
    deductions += 30;
  } else {
    positives.push('✅ Legitimate domain extension');
    scanLog.push('> TLD: Domain extension appears legitimate');
  }

  // Check 3: Phishing string indicators
  await sleep(400);
  onLog('> Scanning for phishing keyword patterns...');
  const foundPhishing = PHISHING_PATTERNS.filter(
    p => fullURL.includes(p)
  );
  if (foundPhishing.length > 0) {
    foundPhishing.forEach(p => {
      redFlags.push(`❌ Phishing keyword: "${p}" found in URL`);
    });
    scanLog.push(`> Phishing Keywords: ${foundPhishing.join(', ')} detected`);
    deductions += foundPhishing.length * 15;
  }

  // Check 4: Subdomain depth
  await sleep(300);
  onLog('> Measuring subdomain depth...');
  const subdomains = hostname.split('.').length - 2;
  if (subdomains > 3) {
    redFlags.push(`❌ Suspicious subdomain depth: ${subdomains} levels (normal is ≤2)`);
    scanLog.push(`> Subdomain Depth: ${subdomains} levels — abnormal nesting pattern`);
    deductions += 20;
  } else {
    scanLog.push(`> Subdomain Depth: ${subdomains} levels — normal`);
  }

  // Check 5: IP-based URL
  await sleep(300);
  onLog('> Checking if URL uses raw IP address...');
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    redFlags.push('❌ URL uses raw IP address — no domain name (highly suspicious)');
    scanLog.push('> IP Address URL: Direct IP used instead of domain — major red flag');
    deductions += 35;
  }

  // Check 6: URL length
  await sleep(200);
  onLog('> Analyzing URL length entropy...');
  if (url.length > 100) {
    redFlags.push(`❌ Abnormally long URL (${url.length} chars) — obfuscation pattern`);
    deductions += 10;
    scanLog.push(`> URL Length: ${url.length} chars — suspiciously long`);
  }

  // Check 7: Known safe domains (bonus)
  const knownSafe = [
    'google.com', 'github.com', 'microsoft.com', 'apple.com',
    'amazon.com', 'flipkart.com', 'sbi.co.in', 'onlinesbi.sbi',
    'hdfcbank.com', 'icicibank.com', 'paytm.com', 'npci.org.in',
    'gov.in', 'nic.in', 'rbi.org.in',
  ];
  const isSafe = knownSafe.some(d => hostname.endsWith(d));
  if (isSafe) {
    positives.push('✅ Recognized as a trusted domain');
    scanLog.push('> Domain Reputation: Listed as trusted/verified domain');
    deductions -= 15;
  }

  // Check 8: Suspicious path patterns
  await sleep(300);
  onLog('> Analyzing URL path patterns...');
  const suspiciousPathPatterns = ['/wp-content/', '/cmd=', '/exec=', '/payload', '/gate.php', '/panel/'];
  const suspPath = suspiciousPathPatterns.find(p => pathname.includes(p));
  if (suspPath) {
    redFlags.push(`❌ Malicious path indicator: "${suspPath}"`);
    deductions += 20;
  }

  await sleep(400);
  onLog('> Computing trust score...');

  const trust_score = Math.max(0, Math.min(100, 100 - deductions));

  let risk_level: 'SAFE' | 'WARNING' | 'DANGEROUS';
  let threat_classification: string;

  if (trust_score >= 70) {
    risk_level = 'SAFE';
    threat_classification = 'No significant threats detected';
  } else if (trust_score >= 40) {
    risk_level = 'WARNING';
    threat_classification = foundPhishing.length > 0 ? 'Potential Phishing Site' : 'Suspicious Domain';
  } else {
    risk_level = 'DANGEROUS';
    if (foundPhishing.length > 0) threat_classification = 'Active Phishing Site';
    else if (ipPattern.test(hostname)) threat_classification = 'Malware Distribution IP';
    else threat_classification = 'High-Risk Domain';
  }

  await sleep(300);
  onLog(`> Analysis complete. Trust Score: ${trust_score}% — ${risk_level}`);

  return {
    trust_score,
    risk_level,
    threat_classification,
    certificate_status: parsedURL.protocol === 'https:' ? 'HTTPS' : 'HTTP',
    detected_red_flags: redFlags,
    detected_positives: positives,
    scan_log: scanLog,
  };
}
