import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function PageHeader({ title, sub, crumbs, children }: { title: string; sub?: string; crumbs?: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-card pb-10 pt-[120px]">
      <div className="container-x">
        <nav className="font-mono text-xs text-mute" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-rust">Home</Link> / {crumbs ?? title}
        </nav>
        <h1 className="display mt-4 text-[clamp(34px,5vw,64px)]">{title}</h1>
        {sub && <p className="mt-3 max-w-xl text-[17px] text-mute">{sub}</p>}
        {children}
      </div>
    </div>
  )
}
