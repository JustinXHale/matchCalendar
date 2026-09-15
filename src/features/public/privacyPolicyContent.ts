import type { PolicySection } from '@/features/public/policyTypes';

export const PRIVACY_POLICY_LAST_UPDATED = 'September 15, 2026';

/** Edited from the MatchReadyTX / TermsFeed template — aligned with Match Calendar data practices. */
export const PRIVACY_POLICY_SECTIONS: PolicySection[] = [
  {
    title: 'Introduction',
    paragraphs: [
      'This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.',
      'We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent where consent is required.',
      'Match Calendar is operated by Rabbit Hole Apps (Justin X. Hale) as a personal schedule and record-keeping tool for sports officials.',
    ],
  },
  {
    title: 'Definitions',
    paragraphs: ['For the purposes of this Privacy Policy:'],
    bullets: [
      'Account means a unique account created for You to access Our Service or parts of Our Service.',
      'Company (referred to as "the Company", "We", "Us" or "Our") refers to Rabbit Hole Apps.',
      'Personal Data means any information that relates to an identified or identifiable individual.',
      'Service refers to the Match Calendar website and progressive web app.',
      'Website refers to Match Calendar, accessible from https://matchcalendar.web.app/.',
      'You means the individual accessing or using the Service.',
      'Service Provider means a third party that processes data on Our behalf to facilitate the Service.',
    ],
  },
  {
    title: 'Types of Data Collected',
    subsections: [
      {
        title: 'Personal Data',
        paragraphs: [
          'While using Our Service, We may ask You to provide or store personally identifiable information, including:',
        ],
        bullets: [
          'Email address, first name, and last name (from Google or Apple sign-in)',
          'Display name and Calendar preferences You choose (for example, default position and arrival timing defaults)',
          'Match assignments You create or import: dates, locations, teams, positions, fees, pay status, travel, lodging, contacts, notes, expenses, and related records',
          'Usage Data (see below)',
        ],
      },
      {
        title: 'Sign-in providers',
        paragraphs: [
          'When You sign in with Google or Apple, We receive basic account information from that provider (such as Your email address and name) as permitted by Your account settings and the provider’s policies. We do not receive access to Your Google Drive, Google Sheets, or other cloud files through sign-in.',
          'Match Calendar uses the same Firebase project as MatchReadyTX. Signing in with the same account does not give Match Calendar access to your referee-society scheduling data in MatchReadyTX unless You separately use MatchReadyTX or a future import feature You authorize.',
        ],
      },
      {
        title: 'Usage Data',
        paragraphs: [
          'Usage Data may include information such as Your device’s Internet Protocol address, browser type, browser version, pages visited, time and date of visits, time spent on pages, and diagnostic data needed to operate and secure the Service.',
        ],
      },
      {
        title: 'Local storage and demo mode',
        paragraphs: [
          'Before You sign in, or when You use Try demo, match data may be stored only in Your browser (local storage) and is not written to Our servers.',
          'After sign-in, We use Firebase persistent local cache so Your schedule can remain readable offline on devices You have used.',
        ],
      },
    ],
  },
  {
    title: 'Cookies and Local Storage',
    paragraphs: [
      'We use cookies and similar technologies that are necessary to authenticate You and keep You signed in, and We use browser local storage or session storage for preferences such as theme, demo mode, and in-app UI state.',
      'We do not use advertising cookies, web beacons, or remarketing pixels. We do not operate a separate cookie-preferences banner; You can clear cookies and site data through Your browser settings, though doing so may sign You out.',
    ],
  },
  {
    title: 'Use of Your Personal Data',
    paragraphs: ['The Company may use Personal Data for the following purposes:'],
    bullets: [
      'To provide and maintain the Service, including Your personal schedule, travel records, pay tracking, and insights derived from Your own data',
      'To manage Your Account and registration',
      'To sync Your data across devices when You are signed in',
      'To monitor and protect the security and integrity of the Service',
    ],
    subsections: [
      {
        title: 'What We do not do',
        bullets: [
          'We do not sell Your Personal Data',
          'We do not show third-party advertisements in the Service',
          'We do not process payments or sell products through the Service',
          'We do not send marketing newsletters',
          'We do not send SMS text messages',
          'We do not provide cross-user analytics or share Your schedule with assigners, teams, or other officials',
        ],
      },
    ],
  },
  {
    title: 'Sharing Your Personal Data',
    paragraphs: ['We may share Personal Data in the following situations:'],
    bullets: [
      'With Service Providers who assist Us in operating the Service, including Google (Firebase Authentication, Cloud Firestore, and Firebase Hosting) and Apple (Sign in with Apple). Each provider processes data according to its own privacy policy.',
      'For business transfers, law enforcement, legal compliance, or protection of rights and safety, as described in standard legal disclosures below.',
      'With Your consent for any other purpose You authorize.',
    ],
    subsections: [
      {
        title: 'What We do not share',
        paragraphs: [
          'Your Match Calendar records are private to Your account. Other MatchReadyTX users, referee societies, or teams cannot browse Your personal Calendar data through this Service.',
        ],
      },
    ],
  },
  {
    title: 'Retention of Your Personal Data',
    paragraphs: [
      'We retain Personal Data only as long as necessary for the purposes described in this Privacy Policy, including to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements.',
      'You may delete Match Calendar data or Your entire account from Profile settings when signed in. See also the delete-account page on rabbitholeapps.com.',
    ],
  },
  {
    title: 'Transfer of Your Personal Data',
    paragraphs: [
      'Your information may be processed in locations where Our Service Providers operate. Where required by law, We take steps designed to ensure Your data is handled securely and in accordance with this Privacy Policy.',
    ],
  },
  {
    title: 'Delete Your Personal Data',
    paragraphs: [
      'When signed in, You may delete only Your Match Calendar matches, tournaments, and preferences, or delete Your shared Firebase profile document and sign-in for this project from Profile settings.',
      'Deleting only Match Calendar data leaves Your Firebase sign-in and any MatchReadyTX society profile intact. Deleting Your profile and account removes Your users document for this Firebase project and signs You out everywhere that project is used; MatchReadyTX organization membership or assignment history may still exist until removed in MatchReadyTX.',
      'Before sign-in, You can clear local browser data or use Clear all local data in Profile while in local or demo mode.',
      'We may retain certain information when We have a legal obligation or other lawful basis to do so.',
    ],
  },
  {
    title: 'Disclosure of Your Personal Data',
    subsections: [
      {
        title: 'Business Transactions',
        paragraphs: [
          'If the Company is involved in a merger, acquisition, or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data becomes subject to a different privacy policy.',
        ],
      },
      {
        title: 'Law Enforcement',
        paragraphs: [
          'Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities.',
        ],
      },
      {
        title: 'Other Legal Requirements',
        paragraphs: [
          'The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to comply with a legal obligation, protect and defend Our rights or property, prevent or investigate possible wrongdoing, protect personal safety, or protect against legal liability.',
        ],
      },
    ],
  },
  {
    title: 'Security of Your Personal Data',
    paragraphs: [
      'The security of Your Personal Data is important to Us, but no method of transmission over the Internet or electronic storage is completely secure. We strive to use commercially reasonable means to protect Your Personal Data but cannot guarantee absolute security.',
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      'The Service is not directed to, and We do not knowingly collect Personal Data from, anyone under the age of 16.',
      'If You are a parent or guardian and believe Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under 16 without appropriate authorization, We will take steps to delete that information.',
    ],
  },
  {
    title: 'Links to Other Websites',
    paragraphs: [
      'Our Service may contain links to other websites (for example, maps or directions). If You follow a third-party link, You will leave Our Service. We do not control and are not responsible for the content or privacy practices of third-party sites.',
    ],
  },
  {
    title: 'Changes to this Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the "Last updated" date. Material changes may also be communicated by email or a notice within the Service where appropriate.',
    ],
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'If You have questions about this Privacy Policy, contact Us by email at rabbitholeapps26@gmail.com.',
      'A copy of this policy is also published at https://rabbitholeapps.com/apps/match-calendar/privacy/.',
    ],
  },
];
