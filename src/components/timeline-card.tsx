import { cn } from '@/lib/utils'
import { TimelineItem } from '@/types/timeline'
import { addTextBreakOpportunities, formatDate } from '@/utils'

interface TimelineCardProps {
  data: TimelineItem
}

export function TimelineCard({ data }: TimelineCardProps) {
  return (
    <article
      className={cn(
        'relative flex w-full items-start gap-3 overflow-hidden rounded-lg p-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <div className="w-full break-words text-foreground">
        <h2 className="mb-1 line-clamp-3 pr-7 text-sm font-medium leading-snug">
          {addTextBreakOpportunities(data.content_title)}
        </h2>

        <p className="line-clamp-6 font-normal">{addTextBreakOpportunities(data.title)}</p>

        <div className="mt-2 inline-flex w-fit items-center justify-start gap-2 rounded-md text-xs font-medium text-foreground">
          {`${formatDate(data.start_date)}${data.end_date ? ` – ${formatDate(data.end_date)}` : ''}`}
        </div>
      </div>
    </article>
  )
}
