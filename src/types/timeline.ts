export interface TimelineResponse {
  data: TimelineItem[]
  nextPage: number | null
  prevPage: number | null
}

export interface TimelineItem {
  content_title: string
  end_date: string | null
  formatted_t_date: string
  id: number
  start_date: string
  t_date: string
  title: string
}

export interface TimelineGroup {
  data?: TimelineItem
  index?: number
  isRecent?: boolean
  label?: string
  type: 'header' | 'item'
}
