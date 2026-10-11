import { useState, type FormEvent } from 'react'
import { useStore } from '@/lib/store'
import { Dialog } from './Dialog'

type Mode = 'signin' | 'signup'

/** Sign in / create account dialog. (File name kept from the earlier demo; `verifyOpen` opens it.) */
export function VerifyDialog() {
  const { verifyOpen, setVerifyOpen, signIn, signUp, toast } = useStore()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const close = () => {
    setVerifyOpen(false)
    setError('')
    setSent(false)
    setPassword('')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = mode === 'signup' ? await signUp(email.trim(), password, name.trim()) : await signIn(email.trim(), password)
    setBusy(false)
    if (result.error) return setError(result.error)
    if (result.needsConfirm) return setSent(true)
    toast(mode === 'signup' ? 'Account created' : 'Signed in')
    close()
  }

  return (
    <Dialog open={verifyOpen} onClose={close} title={sent ? 'Check your email' : mode === 'signup' ? 'Create your account' : 'Sign in'}>
      {sent ? (
        <div className="space-y-4">
          <p className="text-mute">We sent a confirmation link to <b className="text-ink">{email}</b>. Click it to finish creating your account, then come back and sign in.</p>
          <button className="btn btn-primary btn-block" onClick={close}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="-mt-2 text-mute">
            {mode === 'signup' ? 'Join the Land Cruiser marketplace. You can verify your ID later to sell and bid.' : 'Welcome back to Cruiser Trader.'}
          </p>
          {mode === 'signup' && (
            <label className="field-label">Name
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="How you'll appear to others" autoComplete="name" />
            </label>
          )}
          <label className="field-label">Email
            <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
          </label>
          <label className="field-label">Password
            <input className="field" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </label>
          {error && <p role="alert" className="text-sm font-medium text-rust">{error}</p>}
          <button className="btn btn-primary btn-block mt-2" disabled={busy}>
            {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          <button type="button" className="w-full text-center text-sm font-medium text-mute hover:text-rust"
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}>
            {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>
      )}
    </Dialog>
  )
}
