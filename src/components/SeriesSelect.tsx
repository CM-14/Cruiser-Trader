import { SERIES } from '@/data/fixtures'
import { yearsFor } from '@/lib/format'

export function SeriesOptions({ any }: { any?: boolean }) {
  return <>
    {any && <option value="">Any series</option>}
    {SERIES.map((s) => <option key={s.id} value={s.id}>{s.id} Series</option>)}
  </>
}

export function YearOptions({ series, any }: { series: number | ''; any?: boolean }) {
  return <>
    {any && <option value="">Any year</option>}
    {yearsFor(series).map((y) => <option key={y} value={y}>{y}</option>)}
  </>
}
