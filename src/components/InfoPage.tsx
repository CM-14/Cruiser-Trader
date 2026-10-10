import type { ReactNode } from 'react'
import { PageHeader } from './PageHeader'

export function InfoPage({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} sub={sub} />
      <div className="container-x pb-24 pt-12">
        <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed">{children}</div>
      </div>
    </>
  )
}
