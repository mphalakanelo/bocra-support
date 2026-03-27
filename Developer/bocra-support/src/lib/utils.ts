import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const STATUS_CONFIG = {
  submitted:     { label: 'Submitted',     cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  acknowledged:  { label: 'Acknowledged',  cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
  investigating: { label: 'Investigating', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  resolved:      { label: 'Resolved',      cls: 'bg-green-50 text-green-700 border border-green-200' },
  closed:        { label: 'Closed',        cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
} as const

export const OPERATORS = [
  'Mascom Wireless', 'Orange Botswana / Smega', 'BTC (Botswana Telecommunications)',
  'BoFiNet', 'Botswana Post', 'Other Licensed Operator',
]

export const CATEGORIES = [
  'Billing Dispute', 'Service Quality / Outage', 'Network / Signal Coverage',
  'Data / Internet Issues', 'Customer Service', 'Unauthorized Charges',
  'Number Portability', 'Broadcasting Complaint', 'Postal Service', 'SIM Swap / Fraud', 'Other',
]

export const DISTRICTS = [
  'Gaborone', 'Francistown', 'Maun', 'Kasane', 'Lobatse', 'Selebi-Phikwe',
  'Serowe', 'Palapye', 'Kanye', 'Molepolole', 'Mahalapye', 'Other',
]

export const KB_DATA_SEED = [
  { category: 'billing', slug: 'dispute-incorrect-bill', title: 'Disputing an incorrect bill', tags: ['billing','refund','dispute'], source_ref: 'BOCRA Consumer Guide §4.2', body: '<h5>Your Right to Dispute</h5><p>Under BOCRA\'s consumer protection framework, you have 30 days from receiving a bill to formally dispute it with your operator.</p><h5>Steps to Take</h5><ul><li>Request a detailed, itemized bill in writing.</li><li>Identify the specific charges you believe are incorrect.</li><li>File a written dispute with the operator — keep a copy with timestamps.</li><li>If not resolved within 5 working days, escalate to BOCRA.</li></ul><div class="note">⚠️ Always record the agent\'s name, date, and reference number when contacting your operator.</div>' },
  { category: 'billing', slug: 'unauthorized-data-charges', title: 'Unauthorized mobile data charges', tags: ['data','unauthorized'], source_ref: 'Telecom Consumer Protection Regulations 2021', body: '<h5>Protection from Unauthorized Charges</h5><p>Operators are prohibited from enrolling consumers in paid services without explicit consent. Request cancellation and full refund — operators must act within 48 hours.</p>' },
  { category: 'coverage', slug: 'reporting-poor-coverage', title: 'Reporting poor network coverage', tags: ['coverage','signal'], source_ref: 'Telecommunications Act §29', body: '<h5>Coverage Complaint Process</h5><p>File a coverage complaint with BOCRA after attempting to resolve with your operator for 7 days. Document: location, type of issue, times/dates, device model.</p>' },
  { category: 'procedures', slug: 'complaint-process', title: 'BOCRA complaint process explained', tags: ['process','how to file'], source_ref: 'BOCRA Complaints Handling Procedure 2023', body: '<h5>Official Process</h5><ul><li><strong>Step 1:</strong> Contact operator first — give 5–7 working days.</li><li><strong>Step 2:</strong> File with BOCRA via portal, email complaints@bocra.org.bw, or call 3685500.</li><li><strong>Step 3:</strong> BOCRA acknowledges within 2 working days.</li><li><strong>Step 4:</strong> Investigation: standard 14 days, complex 21 days.</li><li><strong>Step 5:</strong> BOCRA issues directive — operators must comply.</li></ul>' },
  { category: 'rights', slug: 'consumer-rights', title: 'Your core telecom consumer rights', tags: ['rights','consumer protection'], source_ref: 'Consumer Protection Act 2018 · Telecom Act Cap 72:03', body: '<h5>Fundamental Rights</h5><ul><li>Receive promised service quality</li><li>Clear, accurate billing with no hidden charges</li><li>Port your number freely (max BWP 5)</li><li>Fair, non-discriminatory treatment</li><li>Complaints addressed within mandated timeframes</li></ul>' },
  { category: 'operators', slug: 'licensed-operators', title: 'All licensed operators in Botswana', tags: ['mascom','orange','BTC','BoFiNet'], source_ref: 'BOCRA Licensee Register 2026', body: '<h5>Mobile Network Operators</h5><ul><li><strong>Mascom Wireless</strong> — Mobile, broadband. Hotline: 196</li><li><strong>Orange Botswana / Smega</strong> — Mobile, data. Hotline: 194</li><li><strong>BTC</strong> — Fixed, mobile, enterprise. Hotline: 100</li></ul><h5>ISPs</h5><ul><li><strong>BoFiNet</strong> — National wholesale broadband backbone</li></ul><h5>Postal</h5><ul><li><strong>Botswana Post</strong> — Hotline: 3653700</li></ul>' },
  { category: 'faqs', slug: 'faq-resolution-time', title: 'How long does BOCRA take to resolve complaints?', tags: ['FAQ','timeline'], source_ref: 'BOCRA SLA Framework 2023', body: '<p>Standard complaints: <strong>14 working days</strong>. Complex disputes: up to <strong>21 working days</strong>. Emergency outages: <strong>48 hours</strong>. Call 3685500 with your reference number for updates.</p>' },
  { category: 'faqs', slug: 'faq-anonymous', title: 'Can I file a complaint anonymously?', tags: ['FAQ','anonymous'], source_ref: 'BOCRA Complaints Policy 2023', body: '<p>BOCRA accepts anonymous complaints, but they are less likely to result in enforceable action. Named complaints are treated with strict confidentiality.</p>' },
]
