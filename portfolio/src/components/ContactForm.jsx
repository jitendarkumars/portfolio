import { useState } from 'react'
import { profile } from '../data/profile'

const cfg = profile.contact || {}

// Pick the endpoint based on whatever the user configured in profile.js.
function getEndpoint() {
  if (cfg.formspreeId) return { url: `https://formspree.io/f/${cfg.formspreeId}`, provider: 'formspree' }
  if (cfg.web3formsKey) return { url: 'https://api.web3forms.com/submit', provider: 'web3forms' }
  return null
}

export default function ContactForm() {
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const endpoint = getEndpoint()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = new FormData(form)

    // No backend configured → fall back to the visitor's mail client.
    if (!endpoint) {
      const name = data.get('name') || ''
      const email = data.get('email') || ''
      const message = data.get('message') || ''
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      const subject = encodeURIComponent(`Portfolio message from ${name}`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      return
    }

    if (endpoint.provider === 'web3forms') {
      data.append('access_key', cfg.web3formsKey)
    }

    setStatus('submitting')
    try {
      const res = await fetch(endpoint.url, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" type="text" required placeholder="Your name" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" required placeholder="What's on your mind?" />
      </div>

      {/* Honeypot field to deter spam bots (kept off-screen). */}
      <input
        type="text"
        name="_gotcha"
        tabIndex="-1"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px' }}
        aria-hidden="true"
      />

      <button className="btn btn--primary" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'success' && (
        <div className="form-status success">Thanks! Your message is on its way. 🎉</div>
      )}
      {status === 'error' && (
        <div className="form-status error">
          Something went wrong. Email me directly at {profile.email}.
        </div>
      )}
    </form>
  )
}
