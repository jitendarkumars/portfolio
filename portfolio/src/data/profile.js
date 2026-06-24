// ─────────────────────────────────────────────────────────────
//  EDIT ME — this is the single source of truth for your identity.
//  Change the values below and the whole site updates.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Jeet',
  // Optional: drop a photo in /public (e.g. /me.jpg) and set its path here.
  // Leave '' to show your initial in the About card instead.
  avatar: '',
  // Résumé PDF lives in /public/resume.pdf — the download button uses this.
  resume: '/resume.pdf',
  // Shown in the hero, typed one after another:
  roles: [
    'Senior Full-Stack & Mobile Engineer',
    'I ship web & mobile end to end',
    'Angular • React • Node • Flutter',
    '8 years building products',
  ],
  tagline:
    'Senior full-stack & mobile engineer with 8 years building web and mobile products end to end — currently freelancing for fintech teams.',
  location: 'Hyderabad, India',
  availability: 'Open to freelance & full-time roles',
  // NOTE: set to match your résumé + domain (jitendarkumar404.com). Change if you prefer the other address.
  email: 'jitendarkumar404@gmail.com',

  // Contact form delivery. Paste ONE of these to make the form send real
  // email (no backend needed). Leave both empty and the form falls back to
  // opening the visitor's mail app. See README → "Make the contact form send email".
  contact: {
    formspreeId: '',
    web3formsKey: 'ca28a525-0e6b-4bc7-ae93-62fcea2803f1',
  },

  // Used in the About section.
  about: [
    "I'm a senior full-stack and mobile engineer with 8 years of experience taking products from the database all the way to the pixels — and from the web to native mobile. I work across Angular, React and Next.js on the front, Node.js, NestJS and Fastify on the back, and Flutter, Kotlin and Swift on mobile.",
    "Lately I've been freelancing for fintech teams — re-architecting a stock broker's ticketing platform into microservices and shipping reusable native mobile modules. I like owning the hard parts: micro-frontends, real-time data, third-party integrations, and leading small teams to ship.",
  ],

  // Quick stats shown as cards in the hero / about.
  stats: [
    { value: '8+', label: 'Years building software' },
    { value: '15+', label: 'Products & modules shipped' },
    { value: '5', label: 'Countries shipped to' },
  ],

  // Social links — leave a value empty ('') to hide that icon.
  socials: {
    github: 'https://github.com/jitendarkumars',
    linkedin: 'https://linkedin.com/in/jitendar-kumar-6551b8126',
    twitter: '',
    youtube: '',
  },

  // Grouped skills shown in the About section.
  skills: [
    {
      group: 'Languages',
      items: ['JavaScript', 'TypeScript', 'Dart', 'Kotlin', 'Swift'],
    },
    {
      group: 'Frontend',
      items: ['Angular', 'React', 'Next.js', 'RxJS', 'Micro-frontend', 'Module Federation'],
    },
    {
      group: 'Backend',
      items: ['Node.js', 'NestJS', 'Fastify', 'Express', 'REST', 'WebSockets'],
    },
    {
      group: 'Mobile',
      items: ['Flutter', 'Android (Kotlin)', 'Jetpack Compose', 'iOS (Swift)'],
    },
    {
      group: 'Data & Messaging',
      items: ['MySQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ'],
    },
    {
      group: 'Cloud & DevOps',
      items: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Git'],
    },
  ],
}
