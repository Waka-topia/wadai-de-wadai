import { rawTimetables } from '@/data/rawTimetables'
import { convertTimetables } from '@/utils/timetableConverter'

class TimetableService {
  constructor() {
    // Initialize by converting the raw data to rich object structure
    this.timetables = convertTimetables(rawTimetables)
    console.log('[TimetableService] Initialized with keys:', Object.keys(this.timetables))
  }

  isWeekend(date) {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
  }

  getNextDepartures(targetInfo, count = 2) {
    const now = new Date()
    const isWeekend = this.isWeekend(now)
    const dayType = isWeekend ? 'weekend' : 'weekday'

    // Safety check & Debug
    if (!this.timetables[targetInfo]) {
        console.error(`[TimetableService] Target '${targetInfo}' not found. Available:`, Object.keys(this.timetables))
        return []
    }
    if (!this.timetables[targetInfo][dayType]) {
        console.error(`[TimetableService] DayType '${dayType}' not found for '${targetInfo}'`)
        return []
    }

    const scheduleList = this.timetables[targetInfo][dayType]

    // Find upcoming departures
    const upcoming = scheduleList.filter(item => {
        const departureDate = new Date(now)
        departureDate.setHours(item.h, item.m, item.s || 0, 0)

        // Basic check for future
        return departureDate > now
    })

    // Detailed Debug Log if empty
    if (upcoming.length === 0) {
        console.warn(`[TimetableService] No upcoming for ${targetInfo} at ${now.toLocaleTimeString()}. Checked ${scheduleList.length} items.`)
        if (scheduleList.length > 0) {
            const last = scheduleList[scheduleList.length - 1]
            console.log(`[TimetableService] Last scheduled item: ${last.h}:${last.m}`)
        }
    } else {
        // Optional: Log success once in a while or strictly on change?
        // For now, let's log the first one to confirm it's working
        // console.log(`[TimetableService] Next: ${upcoming[0].displayTime}`)
    }

    return upcoming.slice(0, count).map(item => {
      const timeUntil = this.calculateTimeUntil(now, item)

      return {
        ...item, // Pass through all rich properties (type, dest, features)
        departureTime: item.displayTime, // Compatibility with existing UI
        timeUntil: timeUntil,
        formattedUntil: `${timeUntil.minutes}分${timeUntil.seconds}秒`
      }
    })
  }

  calculateTimeUntil(now, item) {
    const departureDate = new Date(now)
    departureDate.setHours(item.h, item.m, item.s || 0, 0)

    let diffMs = departureDate - now
    if (diffMs < 0) diffMs = 0

    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)

    return {
      minutes: diffMins,
      seconds: diffSecs
    }
  }
}

export default new TimetableService()
