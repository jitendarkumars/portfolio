// ─────────────────────────────────────────────────────────────
//  EDIT ME — your work history (newest first).
//  Each role: role, org, period, summary, bullets[], optional award, tags[].
// ─────────────────────────────────────────────────────────────
export const experience = [
  {
    role: 'Senior Full-Stack & Mobile Engineer',
    org: 'Freelance · Fintech (Finvasia — Shoonya, Jumpp)',
    period: 'Dec 2025 — Now',
    summary:
      'Leading delivery of fintech back-office systems and reusable native mobile modules as technical lead.',
    bullets: [
      "Re-architected Shoonya's legacy ticketing into an event-driven microservice (Next.js, NestJS, RabbitMQ, Redis) for a broking platform with 140K+ active clients — halving the ticket flow from 4 steps to 2.",
      'Integrated penny-drop bank verification (HyperVerge), e-sign/KYC (Digio) and payments (Razorpay) into the ticket lifecycle.',
      'Built reusable Android modules for Shoonya — TradingView Advanced charts (Kotlin/Compose) and the IKF AI stock-picks feature with in-app subscriptions.',
    ],
    tags: ['Next.js', 'NestJS', 'Kotlin', 'RabbitMQ', 'Redis'],
  },
  {
    role: 'Senior Software Engineer',
    org: 'SimplifyVMS · HireHQ',
    period: 'Mar 2025 — Dec 2025',
    summary:
      'Hardened an AI direct-sourcing hiring platform from an early prototype into a production-grade system.',
    bullets: [
      'Re-architected a freelancer-built codebase — restructured modules, cleared a large bug backlog, and improved stability across the Fastify + Angular 19 stack.',
      'Introduced RabbitMQ for event-driven service communication and WebSockets for real-time updates.',
    ],
    tags: ['Fastify', 'Angular 19', 'MySQL', 'RabbitMQ'],
  },
  {
    role: 'Associate Principal Engineer',
    org: 'Sapidblue Technologies',
    period: 'Jun 2022 — Mar 2025',
    summary:
      'Built a reusable micro-frontend service platform and shipped multiple fintech products on top of it.',
    bullets: [
      'Built the Sapidblue Accelerator — plug-and-play micro-frontend services (auth, payments, wallet, comms, config) on Angular + NestJS, composed into client products.',
      'Led the India team (with the client CTO) to build XPRIZO from scratch — a multi-currency wallet: Flutter app (Android & iOS) + Angular 17 back-office, live on Play Store & App Store.',
      'Delivered Cryr (US credit reporting — Kafka/Redis/MySQL microservices, Plaid, Flutter app) and PayPR (Trinidad wallet) on the Accelerator.',
    ],
    award: 'Represented Sapidblue with the CEO at the World Blockchain Summit, Dubai (2023)',
    tags: ['Angular', 'NestJS', 'Flutter', 'Kafka', 'Module Federation'],
  },
  {
    role: 'Senior Software Engineer',
    org: 'NovelVox · CXInfinity',
    period: 'Jan 2021 — Jun 2022',
    summary:
      'Built social and real-time communication features for an omnichannel customer-engagement platform.',
    bullets: [
      'Added Facebook & Twitter social integrations so agents handle every channel in one console.',
      'Engineered WebRTC audio/video calling on the Janus media server, plus chat, SMS and co-browse over WebSockets.',
    ],
    award: 'Rising Star — annual company award',
    tags: ['Angular', 'Node.js', 'WebRTC', 'Janus'],
  },
  {
    role: 'Software Engineer',
    org: 'Wipro Limited',
    period: 'Mar 2020 — Jan 2021',
    summary: 'Built reusable Angular Web Components and led a major framework upgrade.',
    bullets: [
      'Built Angular 8 Web Components with IndexedDB for offline-capable storage.',
      'Migrated the UPoint UI from Angular 4 → 8, improving performance and usability.',
    ],
    tags: ['Angular 8', 'Web Components', 'IndexedDB'],
  },
  {
    role: 'Software Engineer',
    org: 'Skilrock Technologies',
    period: 'Jun 2018 — Mar 2020',
    summary: 'Built dashboards and APIs for a retail gaming management system.',
    bullets: [
      'Built a web dashboard and REST APIs for a Retail Management System (Angular 6, Node.js, MongoDB, MySQL).',
      'Designed a scalable, maintainable 3-tier dashboard for managing scratch-based games.',
    ],
    tags: ['Angular 6', 'Node.js', 'MongoDB'],
  },
]
