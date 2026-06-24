import { profile } from '../data/profile'
import Reveal from './Reveal'
import Socials from './Socials'
import ContactForm from './ContactForm'
import { MailIcon } from './Icons'

export default function Contact({ theme }) {
  return (
    <section className="section section--tight contact" id="contact">
      <Reveal className="contact__card">
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          05 — Contact
        </span>
        <h2 className="contact__title">
          Let's build something <span className="gradient-text">together</span>
        </h2>
        <p className="contact__lead">
          {profile.availability}. Got a project, a role, or just want to say hi? Drop me a line.
        </p>

        <ContactForm />

        <div className="contact__divider">— or reach me directly —</div>

        <div className="contact__actions">
          <a href={`mailto:${profile.email}`} className="btn btn--ghost">
            <MailIcon width="17" height="17" /> {profile.email}
          </a>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <Socials />
        </div>
      </Reveal>
    </section>
  )
}
