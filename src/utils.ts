import dayjs from 'dayjs'

import { TimelineItem } from './types/timeline'

export const getParsedTimeline = (data: TimelineItem[]) => {
  // Find the last event that is today or in the future. This will be marked as the "recent" event, otherwise default to first in the list
  const recentDayIndex = Math.max(
    data.findLastIndex((t) => dayjs().isSameOrBefore(t.t_date, 'day')),
    0,
  )

  return data.map((timeline, i) => {
    return {
      ...timeline,
      is_recent: i === recentDayIndex,
    }
  })
}

export const getIsToday = (date: string) => dayjs().isSame(date, 'day')

// This is a helper function to add break opportunities to the text.
// Mainly to breakup long URLs in the text.
export const addTextBreakOpportunities = (text: string) =>
  text.replace(/\//g, '/\u200B').replace(/\./g, '.\u200B').replace(/\?/g, '?\u200B').replace(/&/g, '&\u200B')

export function formatDate(dateStr: string) {
  if (!dateStr) {
    return ''
  }

  const date = dayjs(dateStr)

  return date.isValid() ? date.format('D MMM YYYY') : dateStr
}
