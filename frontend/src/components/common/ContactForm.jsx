import { useState, useRef } from 'react'
import { Send, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import Alert from './Alert'
import { CONTACT_EMAIL } from '../../config'

const TOPICS = [
  'Feedback',
  'Bug report',
  'Feature request',
  'Collaboration',
  'Other',
]

export default function ContactForm({ className = '' }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'Feedback',
    message: '',
    honeypot: '', // Hidden field to trap spam bots
  })

  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const messageRef = useRef(null)

  // Validate single field or all fields
  const validate = (values = form) => {
    const newErrors = {}

    if (!values.name.trim()) {
      newErrors.name = 'Please enter your name.'
    }

    if (!values.email.trim()) {
      newErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!values.message.trim()) {
      newErrors.message = 'Please enter a message.'
    } else if (values.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.'
    } else if (values.message.length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters.'
    }

    return newErrors
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const currentErrors = validate()
    setErrors(currentErrors)
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (touched[field]) {
      setErrors(validate(updated))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Honeypot check for bots
    if (form.honeypot) {
      // Silently swallow bot submission
      setStatus('success')
      return
    }

    const validationErrors = validate()
    setErrors(validationErrors)

    // Mark all as touched
    setTouched({ name: true, email: true, topic: true, message: true })

    if (Object.keys(validationErrors).length > 0) {
      // Focus first invalid element
      if (validationErrors.name) nameRef.current?.focus()
      else if (validationErrors.email) emailRef.current?.focus()
      else if (validationErrors.message) messageRef.current?.focus()
      return
    }

    setStatus('sending')

    try {
      // Simulate API submission delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      topic: 'Feedback',
      message: '',
      honeypot: '',
    })
    setTouched({})
    setErrors({})
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className={`card p-8 bg-surface border border-line text-center space-y-6 shadow-e2 ${className}`}>
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-h2 font-display font-semibold text-ink">
            Message Sent Successfully
          </h3>
          <p className="text-caption text-ink-muted text-pretty max-w-[45ch] mx-auto">
            Thank you for reaching out! We read every message and typically reply within 2 business days.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="btn-ghost border border-line bg-surface text-caption font-semibold text-ink hover:text-accent inline-flex items-center gap-2 focus-ring shadow-e1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Send another message</span>
        </button>
      </div>
    )
  }

  const messageLength = form.message.length
  return (
    <div className={`card p-6 md:p-8 bg-surface border border-line shadow-e2 font-sans ${className}`}>
      {status === 'error' && (
        <div className="mb-6 space-y-2">
          <Alert tone="error">
            Unable to send message. Please try again or email us directly at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline font-semibold">
              {CONTACT_EMAIL}
            </a>.
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Hidden Honeypot Field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="form-honeypot">Leave this blank</label>
          <input
            id="form-honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(e) => handleChange('honeypot', e.target.value)}
          />
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="contact-name" className="block text-caption font-medium mb-1.5 text-ink">
            Name <span className="text-rose-600">*</span>
          </label>
          <input
            ref={nameRef}
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            aria-invalid={Boolean(touched.name && errors.name)}
            aria-describedby={touched.name && errors.name ? 'contact-name-error' : undefined}
            placeholder="Ada Lovelace"
            className={`w-full h-11 rounded-md bg-surface border px-3.5 text-body text-ink placeholder:text-ink-faint focus-ring ${
              touched.name && errors.name ? 'border-rose-500 bg-rose-50/20' : 'border-line'
            }`}
          />
          {touched.name && errors.name && (
            <p id="contact-name-error" className="mt-1 text-caption text-rose-600 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="contact-email" className="block text-caption font-medium mb-1.5 text-ink">
            Email Address <span className="text-rose-600">*</span>
          </label>
          <input
            ref={emailRef}
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? 'contact-email-error' : undefined}
            placeholder="ada@example.com"
            className={`w-full h-11 rounded-md bg-surface border px-3.5 text-body text-ink placeholder:text-ink-faint focus-ring ${
              touched.email && errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-line'
            }`}
          />
          {touched.email && errors.email && (
            <p id="contact-email-error" className="mt-1 text-caption text-rose-600 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Topic Select */}
        <div>
          <label htmlFor="contact-topic" className="block text-caption font-medium mb-1.5 text-ink">
            Topic <span className="text-rose-600">*</span>
          </label>
          <select
            id="contact-topic"
            value={form.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="w-full h-11 rounded-md bg-surface border border-line px-3.5 text-body text-ink focus-ring cursor-pointer"
          >
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Message Input with Live Character Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="contact-message" className="block text-caption font-medium text-ink">
              Message <span className="text-rose-600">*</span>
            </label>
            <span
              className={`font-mono text-micro tabular-nums font-semibold ${
                messageLength > 1000
                  ? 'text-rose-600'
                  : messageLength >= 10
                  ? 'text-emerald-700'
                  : 'text-ink-faint'
              }`}
            >
              {messageLength} / 1000 chars
            </span>
          </div>
          <textarea
            ref={messageRef}
            id="contact-message"
            required
            rows={5}
            minLength={10}
            maxLength={1000}
            value={form.message}
            onChange={(e) => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            aria-invalid={Boolean(touched.message && errors.message)}
            aria-describedby={touched.message && errors.message ? 'contact-message-error' : undefined}
            placeholder="Tell us about a feature request, bug report, or general feedback..."
            className={`w-full rounded-md bg-surface border px-3.5 py-2.5 text-body text-ink placeholder:text-ink-faint focus-ring ${
              touched.message && errors.message ? 'border-rose-500 bg-rose-50/20' : 'border-line'
            }`}
          />
          {touched.message && errors.message ? (
            <p id="contact-message-error" className="mt-1 text-caption text-rose-600 font-medium">
              {errors.message}
            </p>
          ) : (
            <p className="mt-1 text-caption text-ink-faint">
              Minimum 10 characters. Plain text only.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary w-full h-11 font-semibold flex items-center justify-center gap-2 focus-ring shadow-e1 disabled:opacity-50 cursor-pointer"
        >
          {status === 'sending' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending message...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send message</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
