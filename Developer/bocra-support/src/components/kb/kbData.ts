export const KB_SIDEBAR_DATA = [
  {
    id: 'billing', icon: '💳', title: 'Billing & Charges',
    articles: [
      { id: 'b1', title: 'Disputing an incorrect bill', source: 'BOCRA Consumer Guide §4.2', body: '<h5>Your Right to Dispute</h5><p>You have 30 days from receiving a bill to formally dispute it with your operator. Request an itemized bill in writing, identify incorrect charges, then file a written dispute. If unresolved in 5 working days, escalate to BOCRA.</p><div style="background:#fff8e1;border-left:3px solid #f59e0b;padding:8px 12px;border-radius:0 6px 6px 0;margin:8px 0;font-size:12px">⚠️ Always record the agent\'s name, date, and reference number when contacting your operator.</div>' },
      { id: 'b2', title: 'Unauthorized data charges', source: 'Telecom Consumer Protection Regulations 2021', body: '<p>Operators cannot enroll you in paid services without explicit consent. Check subscriptions via your operator\'s USSD code. Request cancellation and full refund — operators must act within 48 hours.</p>' },
      { id: 'b3', title: 'Refund timelines', source: 'BOCRA Directive CD 01/2023', body: '<p>When a dispute is resolved in your favour, the operator must process refunds within <strong>7 working days</strong> as account credits or direct payment. BOCRA can compel payment if the operator fails.</p>' },
    ],
  },
  {
    id: 'coverage', icon: '📡', title: 'Network Coverage',
    articles: [
      { id: 'c1', title: 'Reporting poor coverage', source: 'Telecommunications Act §29', body: '<p>File a coverage complaint with BOCRA after attempting to resolve with your operator for 7 days. Document: exact location (GPS if possible), type of issue (voice/data/SMS), times and dates, device model.</p>' },
      { id: 'c2', title: 'Coverage obligations 2026', source: 'BOCRA License Conditions 2024', body: '<p>Minimum requirements: <strong>Urban 97%</strong>, Peri-urban 90%, Rural 80% population coverage. Operators failing targets face license review and financial penalties.</p>' },
      { id: 'c3', title: 'Internet speed standards', source: 'BOCRA QoS Framework 2023', body: '<p>Mobile broadband: min. 1 Mbps download. Fixed broadband: deliver at least 80% of advertised speed. Uptime: 99.5% monthly for fixed services.</p>' },
    ],
  },
  {
    id: 'procedures', icon: '📋', title: 'Complaint Procedures',
    articles: [
      { id: 'cp1', title: 'BOCRA complaint process', source: 'BOCRA Complaints Handling Procedure 2023', body: '<ol style="padding-left:16px"><li>Contact operator first — give 5–7 working days</li><li>File with BOCRA: portal, email complaints@bocra.org.bw, or call 3685500</li><li>BOCRA acknowledges within 2 working days</li><li>Investigation: standard 14 days, complex 21 days</li><li>BOCRA issues directive — operators must comply</li></ol>' },
      { id: 'cp2', title: 'What BOCRA can handle', source: 'Telecommunications Act, Cap 72:03', body: '<p><strong>In jurisdiction:</strong> Mascom, Orange/Smega, BTC, BoFiNet, Botswana Post, licensed broadcasters.</p><p style="margin-top:6px"><strong>Outside jurisdiction:</strong> Handset repairs (Consumer Protection Authority), fraud/cybercrime (DISS/BPS), employment disputes.</p>' },
      { id: 'cp3', title: 'Resolution timelines', source: 'BOCRA SLA Framework 2023', body: '<p>Acknowledgement: 2 working days · Simple complaints: <strong>14 working days</strong> · Complex disputes: 21 working days · Emergency outages: 48 hours.</p>' },
    ],
  },
  {
    id: 'operators', icon: '📱', title: 'Licensed Operators',
    articles: [
      { id: 'op1', title: 'All licensed operators', source: 'BOCRA Licensee Register 2026', body: '<p><strong>Mascom Wireless</strong> — Mobile, broadband. Hotline: 196<br/><strong>Orange Botswana / Smega</strong> — Mobile, data. Hotline: 194<br/><strong>BTC</strong> — Fixed, mobile, enterprise. Hotline: 100<br/><strong>BoFiNet</strong> — National wholesale broadband<br/><strong>Botswana Post</strong> — Postal. Hotline: 3653700</p>' },
      { id: 'op2', title: 'Number portability rights', source: 'BOCRA MNP Regulations 2020', body: '<p>Keep your number when switching operators. Port completes in <strong>2 working days</strong>. Maximum charge: <strong>BWP 5.00</strong>. If your operator obstructs porting, report to BOCRA — this is a license violation.</p>' },
    ],
  },
  {
    id: 'rights', icon: '⚖️', title: 'Consumer Rights',
    articles: [
      { id: 'r1', title: 'Core telecom consumer rights', source: 'Consumer Protection Act 2018 · Telecom Act Cap 72:03', body: '<ul style="padding-left:16px"><li>Receive promised service quality</li><li>Clear, accurate billing with no hidden charges</li><li>Port your number freely (max BWP 5)</li><li>Fair, non-discriminatory treatment</li><li>Complaints addressed within mandated timeframes</li><li>Cancel services after minimum contract term</li></ul>' },
      { id: 'r2', title: 'Contract rights & cancellation', source: 'BOCRA Contract Regulations 2021', body: '<p>After the minimum contract term expires, cancel with 30 days\' notice. Early termination penalties must be proportional — operators cannot charge more than remaining months\' subscription fees.</p>' },
    ],
  },
  {
    id: 'regulations', icon: '📜', title: 'Regulations',
    articles: [
      { id: 'reg1', title: 'Telecommunications Act overview', source: 'Telecom Act Cap 72:03 (amended 2023)', body: '<p>Primary legislation governing telecoms in Botswana. Establishes BOCRA as independent regulator, licensing framework, universal service obligations, consumer protection, and dispute resolution mechanisms.</p>' },
      { id: 'reg2', title: "BOCRA's mandate & powers", source: 'BOCRA Act 2012 · Telecom Act Cap 72:03', body: '<p>BOCRA can: issue/revoke licenses, set technical standards, handle complaints, manage spectrum, monitor tariffs, administer Universal Service Fund. Enforcement: compliance orders, fines, license suspension, criminal referrals.</p>' },
      { id: 'reg3', title: 'Data protection rights', source: 'Data Protection Act 2018', body: '<p>Operators must: collect only necessary data, obtain consent for marketing, secure customer data, allow data access/correction, notify of breaches within 72 hours. File simultaneously with BOCRA and IDPC for data breaches.</p>' },
    ],
  },
  {
    id: 'faqs', icon: '❓', title: 'FAQs',
    articles: [
      { id: 'faq1', title: 'How long does BOCRA take?', source: 'BOCRA SLA Framework 2023', body: '<p>Standard: <strong>14 working days</strong>. Complex: <strong>21 days</strong>. Emergency outages: <strong>48 hours</strong>. Call 3685500 with your reference number for updates.</p>' },
      { id: 'faq2', title: 'Anonymous complaints?', source: 'BOCRA Complaints Policy 2023', body: '<p>BOCRA accepts anonymous complaints but they are less likely to result in enforceable action. Named complaints are treated with strict confidentiality — your details are not shared with the operator without consent.</p>' },
      { id: 'faq3', title: 'Appeals process', source: 'BOCRA Appeals Procedure 2022', body: '<p>1. Request review within 30 days (senior officer re-examines) · 2. BOCRA Appeals Tribunal · 3. High Court for judicial review.</p>' },
      { id: 'faq4', title: 'Does BOCRA regulate WhatsApp?', source: 'BOCRA OTT Policy 2024', body: '<p>BOCRA regulates licensed telecom infrastructure, not OTT apps. However if an operator throttles OTT services unfairly, that may be a net neutrality violation BOCRA can act on.</p>' },
    ],
  },
]
