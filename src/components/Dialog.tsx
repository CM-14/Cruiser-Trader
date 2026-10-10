import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', k)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-black/55 backdrop-blur-sm sm:place-items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-paper p-7 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="display text-[26px] [font-stretch:112%]">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid size-9 place-items-center rounded-full hover:bg-card">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
