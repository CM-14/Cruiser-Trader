import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { BadgeCheck, Check, Circle } from 'lucide-react'
import { cx } from '@/lib/format'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/PageHeader'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

const LEVELS = [
  { level: 1, title: 'Email and phone confirmed', body: 'Message sellers and post wanted ads.' },
  { level: 2, title: 'ID verified', body: 'Publish listings, bid and buy.' },
  { level: 3, title: 'Verified vehicle seller', body: 'Sell vehicles with the Verified Vehicle badge.' },
]

const USERNAME = /^[a-z0-9_]{3,24}$/

function AccountPage() {
  const { user, profile, authReady, setVerifyOpen, updateProfile, signOut, toast } = useStore()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setName(profile.display_name ?? '')
    setUsername(profile.username)
    setCity(profile.city ?? '')
    setState(profile.state ?? '')
  }, [profile])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const u = username.trim().toLowerCase()
    if (!USERNAME.test(u)) return setError('Usernames are 3 to 24 characters: lowercase letters, numbers and underscores.')
    setSaving(true)
    setError('')
    const { error: err } = await updateProfile({
      display_name: name.trim() || null,
      username: u,
      city: city.trim() || null,
      state: state.trim() || null,
    })
    setSaving(false)
    if (err) return setError(err)
    toast('Profile saved')
  }

  if (!authReady) {
    return (
      <>
        <PageHeader title="My account" sub="" />
        <div className="container-x py-12 text-mute">Loading…</div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <PageHeader title="My account" sub="Sign in to manage your profile and verification." />
        <div className="container-x py-12">
          <button className="btn btn-primary" onClick={() => setVerifyOpen(true)}>Sign in or create an account</button>
        </div>
      </>
    )
  }

  const level = profile?.trust_level ?? 0

  return (
    <>
      <PageHeader title="My account" sub={user.email ?? ''} />
      <div className="container-x grid items-start gap-10 pb-24 pt-10 lg:grid-cols-2">
        <form onSubmit={save} className="panel space-y-4 p-6">
          <h2 className="display text-xl [font-stretch:112%]">Profile</h2>
          {!profile && <p className="text-sm text-mute">Loading your profile…</p>}
          <label className="field-label">Name
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label className="field-label">Username
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} />
          </label>
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <label className="field-label">City
              <input className="field" value={city} onChange={(e) => setCity(e.target.value)} maxLength={60} />
            </label>
            <label className="field-label">State
              <input className="field" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="WA" />
            </label>
          </div>
          {error && <p role="alert" className="text-sm font-medium text-rust">{error}</p>}
          <div className="flex flex-wrap gap-3 pt-1">
            <button className="btn btn-primary" disabled={saving || !profile}>{saving ? 'Saving…' : 'Save profile'}</button>
            <Link to="/my-listings" className="btn btn-outline">My listings</Link>
            <button type="button" className="btn btn-outline" onClick={() => void signOut()}>Sign out</button>
          </div>
        </form>

        <section className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display text-xl [font-stretch:112%]">Trust level</h2>
            <span className="eyebrow rounded-full bg-forest px-3 py-1 text-[11px] text-cream">Level {level}</span>
          </div>
          <p className="mt-2 text-sm text-mute">Higher levels unlock more of the marketplace. Level 0 can browse and save.</p>
          <ul className="mt-5 space-y-4">
            {LEVELS.map((l) => (
              <li key={l.level} className="flex gap-3">
                {level >= l.level
                  ? <Check className="mt-0.5 size-5 shrink-0 text-ok" aria-label="Done" />
                  : <Circle className="mt-0.5 size-5 shrink-0 text-line" aria-label="Not yet" />}
                <div>
                  <b className={cx(level >= l.level && 'text-ok')}>Level {l.level}: {l.title}</b>
                  <p className="text-sm text-mute">{l.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
            <dt className="text-mute">Email</dt>
            <dd className="font-medium">{profile?.email_verified ? 'Confirmed' : 'Not confirmed yet'}</dd>
            <dt className="text-mute">Phone</dt>
            <dd className="font-medium">{profile?.phone_verified ? 'Confirmed' : 'Coming soon'}</dd>
            <dt className="text-mute">ID</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              {profile?.id_verified ? <><BadgeCheck className="size-4 text-ok" /> Verified</> : 'Not verified'}
            </dd>
          </dl>
          <button className="btn btn-outline mt-6" disabled>Verify your ID: coming soon</button>
        </section>
      </div>
    </>
  )
}
