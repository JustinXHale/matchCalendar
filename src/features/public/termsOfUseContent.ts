import type { PolicySection } from '@/features/public/policyTypes';

export const TERMS_OF_USE_LAST_UPDATED = 'September 15, 2026';

export const TERMS_OF_USE_SECTIONS: PolicySection[] = [
  {
    title: 'Agreement',
    paragraphs: [
      'These Terms of Use ("Terms") are a legal agreement between you ("you") and Rabbit Hole Apps ("we," "us," or "our") for the Match Calendar website, progressive web app, and related pages (collectively, the "Service").',
      'Match Calendar is a personal schedule and record for sports officials. By signing in, installing, or using the Service, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Service.',
    ],
  },
  {
    title: 'Eligibility',
    paragraphs: [
      'You must be at least 16 years old to use the Service. The Service is not directed to children under 16.',
      'You are responsible for the accuracy of information you enter and for keeping your sign-in credentials secure.',
    ],
  },
  {
    title: 'License',
    paragraphs: ['Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal officiating schedule and records.'],
    bullets: [
      'You may not copy, modify, or distribute the Service except as allowed by law',
      'You may not reverse engineer or attempt to extract source code except where prohibited by law',
      'You may not use the Service for unlawful purposes or to harass, defame, or harm others',
      'You may not attempt to access another user\'s data or interfere with the Service\'s operation',
    ],
  },
  {
    title: 'Your content',
    paragraphs: [
      'You retain ownership of the match, travel, and financial records you enter. You grant us the rights needed to store, process, and display that content back to you through the Service, including through our cloud providers.',
      'You are responsible for your content and for ensuring you have any rights needed to store assignment details you enter, including information about teams, venues, or contacts.',
    ],
  },
  {
    title: 'Accounts and shared sign-in',
    paragraphs: [
      'Match Calendar uses Firebase Authentication with Google and Apple sign-in. The Service shares a Firebase project with MatchReadyTX, so the same sign-in may work across both products.',
      'Match Calendar data is stored separately from referee-society scheduling in MatchReadyTX. Deleting only Match Calendar data does not remove MatchReadyTX society membership. Deleting your profile and account removes your shared users document for this Firebase project and may affect your ability to sign in to MatchReadyTX until you sign in again.',
    ],
  },
  {
    title: 'Demo mode and local use',
    paragraphs: [
      'Try demo and local-only use let you preview the Service without writing data to our servers. Demo data is sample content stored in your browser and is not your live schedule.',
      'Without signing in, data may remain only on your device. You are responsible for exporting or backing up anything you need before clearing browser storage or uninstalling the app.',
    ],
  },
  {
    title: 'No professional advice',
    paragraphs: [
      'Match Calendar is a record-keeping tool. It does not provide legal, tax, officiating, travel, or employment advice. Pay, expense, and mileage fields are for your own records; verify amounts and tax treatment independently.',
    ],
  },
  {
    title: 'Fees',
    paragraphs: [
      'Match Calendar does not currently charge fees or process payments through the Service. If paid features are introduced later, we will update these Terms before they take effect.',
    ],
  },
  {
    title: 'Third-party services',
    paragraphs: [
      'The Service relies on third parties such as Google Firebase and Apple Sign in. Links to maps or other external sites are provided for convenience; their terms and privacy policies apply when you leave the Service.',
    ],
  },
  {
    title: 'Disclaimer',
    paragraphs: [
      'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'We do not warrant that the Service will be uninterrupted, error-free, or that data will never be lost. You use the Service at your own risk.',
    ],
  },
  {
    title: 'Limitation of liability',
    paragraphs: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, RABBIT HOLE APPS AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.',
      'OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) USD $50.',
    ],
  },
  {
    title: 'Termination',
    paragraphs: [
      'You may stop using the Service at any time and may delete your data or account from Profile settings when signed in.',
      'We may suspend or terminate access if you violate these Terms or if needed to protect the Service, users, or third parties.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'We may update these Terms from time to time. We will post the updated Terms on this page and update the "Last updated" date. Continued use after changes become effective constitutes acceptance of the revised Terms where permitted by law.',
      'A copy of these Terms is also published at https://rabbitholeapps.com/apps/match-calendar/terms/.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'Questions about these Terms: justinxhale@gmail.com',
    ],
  },
];
