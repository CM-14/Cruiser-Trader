import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { cx } from '@/lib/format'
import { useStore } from '@/lib/store'
import { messagesSearch } from '@/lib/search'
import { PageHeader } from '@/components/PageHeader'

export const Route = createFileRoute('/messages')({
  validateSearch: messagesSearch,
  component: MessagesPage,
})

function MessagesPage() {
  const { t } = Route.useSearch()
  const { threads, sendMessage } = useStore()
  const active = threads.find((x) => x.id === t) ?? threads[0]
  const [draft, setDraft] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length])

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !active) return
    sendMessage(active.id, draft.trim())
    setDraft('')
  }

  return (
    <>
      <PageHeader title="Messages" sub="Chat with buyers and sellers without leaving Cruiser Trader." />
      <div className="container-x pb-24 pt-10">
        <div className="panel grid h-[min(640px,75dvh)] overflow-hidden md:grid-cols-[300px_1fr]">
          <ul className={cx('overflow-y-auto border-line md:border-r', t && 'hidden md:block')}>
            {threads.map((x) => (
              <li key={x.id}>
                <Link to="/messages" search={{ t: x.id }}
                  className={cx('block border-b border-line px-5 py-4 transition-colors hover:bg-paper', x.id === active?.id && 'bg-paper shadow-[inset_3px_0_var(--rust)]')}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-cream">{x.with[0]}</span>
                    <div className="min-w-0">
                      <b className="block text-[15px]">{x.with}</b>
                      <small className="block truncate text-xs text-mute">{x.subject}</small>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {active ? (
            <div className={cx('flex min-h-0 flex-col', !t && 'hidden md:flex')}>
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <Link to="/messages" search={{}} className="md:hidden" aria-label="Back to conversations"><ArrowLeft className="size-5" /></Link>
                <div className="min-w-0">
                  <b className="block">{active.with}</b>
                  <small className="block truncate text-xs text-mute">{active.subject}</small>
                </div>
              </div>
              <div ref={scroller} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-5" aria-live="polite">
                {active.messages.length ? active.messages.map((m, i) => (
                  <p key={i} className={cx('max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px]',
                    m.fromMe ? 'self-end rounded-br-md bg-forest text-cream' : 'self-start rounded-bl-md border border-line bg-paper')}>
                    {m.text}
                  </p>
                )) : <p className="m-auto text-mute">Say hello to {active.with}.</p>}
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
                <label htmlFor="msg" className="sr-only">Message</label>
                <input id="msg" className="field mt-0" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${active.with}`} autoComplete="off" />
                <button className="btn btn-primary h-11 shrink-0" aria-label="Send"><Send className="size-4" /></button>
              </form>
            </div>
          ) : (
            <p className="m-auto p-10 text-mute">No conversations yet.</p>
          )}
        </div>
      </div>
    </>
  )
}
