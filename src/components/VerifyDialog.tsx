import { useState, type FormEvent } from 'react'
import { useStore } from '@/lib/store'
import { Dialog } from './Dialog'

export function VerifyDialog() {
  const { verifyOpen, setVerifyOpen, verify, toast } = useStore()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    verify()
    setVerifyOpen(false)
    toast('Verified Cruiser badge unlocked')
  }

  return (
    <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Join Cruiser Trader">
      <p className="-mt-2 mb-5 text-mute">Verified Cruisers build trust. Three quick steps, and you can bid, sell and message.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="field-label">Email<input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" /></label>
        <label className="field-label">Phone<input className="field" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0123" autoComplete="tel" /></label>
        <label className="field-label">Photo ID<input className="field" type="file" accept="image/*" /></label>
        <button className="btn btn-primary btn-block mt-2">Submit for verification</button>
        <p className="text-center text-xs text-mute">ID photos are reviewed and never shown publicly.</p>
      </form>
    </Dialog>
  )
}
