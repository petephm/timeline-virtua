import { QueryKey, useInfiniteQuery } from '@tanstack/react-query'
import { groupBy, throttle } from 'lodash'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CustomItemComponentProps, VList, VListHandle } from 'virtua'

import { TimelineCard } from '@/components/timeline-card'
import { cn } from '@/lib/utils'
import mockData from '@/mock-data.json'
import { TimelineGroup, TimelineResponse } from '@/types/timeline'
import { getIsToday, getParsedTimeline } from '@/utils'

type InfiniteTimelineQueryResult = {
  pages: TimelineResponse[]
  pageParams: number[]
}

const fetchTimelinePage = async (page: number = 0, pageSize: number = 100): Promise<TimelineResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const data = mockData.slice(page * pageSize, (page + 1) * pageSize)
  const hasMore = page < mockData.length / pageSize - 1
  const hasPrevious = page > 0

  return {
    data,
    nextPage: hasMore ? page + 1 : null,
    prevPage: hasPrevious ? page - 1 : null,
  }
}

export const Timeline = () => {
  const listRef = useRef<VListHandle>(null)
  const startFetchedCountRef = useRef(-1)
  const endFetchedCountRef = useRef(-1)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isShifting, setIsShifting] = useState(false)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasPreviousPage,
    fetchPreviousPage,
    isLoading,
  } = useInfiniteQuery<TimelineResponse, Error, InfiniteTimelineQueryResult, QueryKey, number>({
    queryKey: ['timeline'],
    queryFn: ({ pageParam = 0 }) => fetchTimelinePage(pageParam, 100),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    initialPageParam: 5,
  })

  const StickyItem = forwardRef<HTMLDivElement, CustomItemComponentProps>(({ children, index, style }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...style,
          ...(activeIndex === index && {
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }),
        }}
      >
        {children}
      </div>
    )
  })

  const rawData = useMemo(() => data?.pages.flatMap((page) => page.data || []) || [], [data])

  const groupedData = useMemo(() => groupBy(getParsedTimeline(rawData), 'formatted_t_date'), [rawData])

  const timelineRows = useMemo(() => {
    return Object.keys(groupedData)
      .reduce<TimelineGroup[]>((prev, key) => {
        const group = groupedData[key]
        const isRecent = !!group.find((t) => t.is_recent)

        return [
          ...prev,
          {
            type: 'header' as const,
            label: key,
            isRecent,
          },
          ...group.map((item) => ({
            type: 'item' as const,
            data: item,
          })),
        ]
      }, [])
      .map((row, index) => ({
        ...row,
        index,
      }))
  }, [groupedData])

  const stickyIndexes = useMemo(() => {
    return timelineRows.map(({ type }, index) => (type === 'header' ? index : -1)).filter((i) => i !== -1)
  }, [timelineRows])

  const handleListScroll = useCallback(
    throttle(async () => {
      if (!listRef.current) return

      const start = listRef.current.findStartIndex()

      const activeStickyIndex = [...stickyIndexes].reverse().find((index) => start >= index)!

      setActiveIndex(activeStickyIndex)

      if (isFetching) {
        return
      }

      const count = timelineRows.length
      const isNearTop = endFetchedCountRef.current < count && listRef.current.findEndIndex() + 10 > count
      const isNearBottom = startFetchedCountRef.current < count && listRef.current.findStartIndex() - 10 < 0

      if (isNearTop && hasNextPage) {
        endFetchedCountRef.current = count
        await fetchNextPage()
      } else if (isNearBottom && hasPreviousPage) {
        startFetchedCountRef.current = count
        setIsShifting(true)
        await fetchPreviousPage()
      }
    }, 100),
    [fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage, isFetching, stickyIndexes, timelineRows.length],
  )

  const items = useMemo(
    () =>
      timelineRows.map((item, index) => {
        if (item?.type === 'header') {
          const isRecent = item?.isRecent ?? false
          const isFirst = index === 0
          const isToday = getIsToday(item?.label ?? '')
          const label = item?.label ?? ''

          return (
            <div
              {...(isRecent && {
                id: 'timeline-recent',
              })}
              key={index}
              data-index={index}
              data-recent={isRecent}
              className={cn({
                'bg-background z-10 border-b shadow-sm': activeIndex === index,
                'border-b-0 shadow-none': isFirst,
              })}
            >
              <h2 className="flex h-[38px] w-full items-center px-6 text-sm font-medium text-muted-foreground">
                {isToday && 'Today, '}
                {label}
              </h2>
            </div>
          )
        }

        if (item?.type === 'item' && item?.data) {
          const data = item?.data
          const isBeforeHeader = timelineRows[index + 1]?.type === 'header'

          return (
            <div key={index} data-index={index}>
              <div
                className={cn('px-4 py-1', {
                  'after:absolute after:inset-x-0 after:bottom-2 after:h-px after:bg-border pb-6': isBeforeHeader,
                })}
              >
                <TimelineCard data={data} />
              </div>
            </div>
          )
        }

        return null
      }),
    [timelineRows, activeIndex],
  )

  useEffect(() => {
    if (!isLoading && timelineRows.length > 0) {
      setIsShifting(true)
      fetchPreviousPage()
    }
  }, [isLoading])

  useEffect(() => {
    if (!isFetching && isShifting) {
      setIsShifting(false)
    }
  }, [timelineRows.length])

  return (
    <div className="absolute inset-0 overflow-y-auto">
      {isLoading && <div>Loading...</div>}

      {timelineRows.length > 0 && (
        <VList
          ref={listRef}
          className="h-full"
          item={StickyItem}
          shift={isShifting}
          keepMounted={timelineRows.length > 0 ? [activeIndex] : undefined}
          onScroll={handleListScroll}
        >
          {items}
        </VList>
      )}
    </div>
  )
}
