// Strict email syntax validation.
// Returns null when valid, otherwise a human-readable error string.
export function validateEmail(rawEmail) {
  const email = (rawEmail || '').trim()
  if (!email) return 'Email is required'
  if (/\s/.test(email)) return 'Email cannot contain spaces'

  const atCount = (email.match(/@/g) || []).length
  if (atCount === 0) return 'Email must contain an @ symbol'
  if (atCount > 1) return 'Email must contain only one @ symbol'

  const [local, domain] = email.split('@')
  if (!local) return 'Email must have a name before @'
  if (!domain) return 'Email must have a domain after @'
  if (local.length > 64) return 'Email name is too long'
  if (domain.length > 253) return 'Email domain is too long'

  if (local.startsWith('.') || local.endsWith('.')) {
    return 'Email name cannot start or end with a dot'
  }
  if (/\.\./.test(email)) return 'Email cannot contain consecutive dots'

  if (!domain.includes('.')) {
    return 'Email domain must include a dot (e.g. example.com)'
  }
  if (/^[.-]/.test(domain) || /[.-]$/.test(domain)) {
    return 'Email domain cannot start or end with a dot or dash'
  }

  const tld = domain.split('.').pop()
  if (!/^[A-Za-z]{2,}$/.test(tld)) {
    return 'Email must end with a valid domain (e.g. .com, .in)'
  }

  const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
  if (!re.test(email)) return 'Please enter a valid email address'

  return null
}

// Common typo corrections. Returns a suggested fixed email (string) or null
// if nothing looks off. Run this AFTER validateEmail returns null so the user
// has a syntactically valid address, we're just catching .ccom / gmial / etc.
// We never auto-correct; the suggestion is shown to the user to confirm.
const TLD_FIXES = {
  ccom: 'com', cmo: 'com', con: 'com', vom: 'com', xom: 'com',
  comm: 'com', coom: 'com', ocm: 'com', om: 'com', co: 'com',
  ner: 'net', nett: 'net', nte: 'net',
  ogr: 'org', orgg: 'org', ogr: 'org', og: 'org',
  inn: 'in', ni: 'in',
}

const DOMAIN_FIXES = {
  // gmail
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmsil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.ccom': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'gmail.in': 'gmail.com',
  // yahoo
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  // hotmail
  'hotnail.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmsil.com': 'hotmail.com',
  // outlook
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'oultook.com': 'outlook.com',
  // rediffmail
  'redifmail.com': 'rediffmail.com',
  'rediff.co': 'rediffmail.com',
  // icloud
  'iclod.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
}

export function suggestEmailFix(rawEmail) {
  const email = (rawEmail || '').trim().toLowerCase()
  if (!email || !email.includes('@')) return null
  const atIdx = email.lastIndexOf('@')
  const local = email.slice(0, atIdx)
  const domain = email.slice(atIdx + 1)
  if (!domain || !domain.includes('.')) return null

  if (DOMAIN_FIXES[domain]) {
    return `${local}@${DOMAIN_FIXES[domain]}`
  }

  // Try fixing just the TLD piece
  const parts = domain.split('.')
  const tld = parts[parts.length - 1]
  const fixedTld = TLD_FIXES[tld]
  if (fixedTld && fixedTld !== tld) {
    parts[parts.length - 1] = fixedTld
    const fixedDomain = parts.join('.')
    // Check the fixed domain isn't itself a known typo
    const recheck = DOMAIN_FIXES[fixedDomain]
    return `${local}@${recheck || fixedDomain}`
  }

  return null
}
