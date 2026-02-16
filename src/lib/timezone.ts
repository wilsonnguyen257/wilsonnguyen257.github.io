// Timezone utility functions for Melbourne, Australia
// Melbourne uses AEDT (UTC+11) during daylight saving time (October - April)
// and AEST (UTC+10) during standard time (April - October)

export const MELBOURNE_TIMEZONE = 'Australia/Melbourne';

/**
 * Parse a date string (YYYY-MM-DD) as a local date object
 * This avoids timezone issues where "2023-10-25" is parsed as UTC and shows as 24th in US
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing the date in local timezone
 */
export function parseEventDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parse event time in AM/PM format and convert to 24-hour format
 * @param timeStr - Time string like "5:00 PM" or "10:30 AM"
 * @returns Object with hours and minutes in 24-hour format
 */
export function parseEventTime(timeStr: string) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  
  if (!match) {
    // Try 24h format if AM/PM missing
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
    }
    console.warn(`Invalid time format: ${timeStr}. Expected format like "5:00 PM"`);
    return { hours: 0, minutes: 0 };
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  
  // Convert to 24-hour format
  if (meridiem === 'PM' && hours !== 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
}

/**
 * Get the current wall-clock time in Melbourne as a Date object.
 * The Date object will have the local computer's timezone offset, but the components (Year, Month, Day, Hour, Minute)
 * will match the current time in Melbourne.
 * This is useful for comparing "Now in Melbourne" vs "Event in Melbourne".
 */
export function getMelbourneNow(): Date {
  const now = new Date();
  
  // Use Intl to extract Melbourne components
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MELBOURNE_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  
  return new Date(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    getPart('hour'),
    getPart('minute'),
    getPart('second')
  );
}

/**
 * Create a Date object representing the Event's wall-clock time.
 * @param dateISO - Date in ISO format (YYYY-MM-DD)
 * @param timeStr - Time string like "5:00 PM"
 * @returns Date object representing the event time (components match event time)
 */
export function createMelbourneEventDate(dateISO: string, timeStr: string): Date {
  const { hours, minutes } = parseEventTime(timeStr);
  const eventDate = parseEventDate(dateISO);
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
}

/**
 * Format a date to display in Melbourne timezone
 * @param date - Date to format
 * @param locale - Locale string (e.g., 'en-AU' or 'vi-VN')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in Melbourne timezone
 */
export function formatDateInMelbourne(
  date: Date, 
  locale: string = 'en-AU', 
  options: Intl.DateTimeFormatOptions = {}
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: MELBOURNE_TIMEZONE,
    ...options
  });
  
  return formatter.format(date);
}

/**
 * Get current time in Melbourne timezone
 * @returns Date object representing current time in Melbourne
 */
export function getMelbourneTime(): Date {
  return new Date(); // The date will be converted when formatting with timezone
}

/**
 * Check if an event date/time has passed relative to Melbourne timezone
 * @param eventDate - ISO date string (YYYY-MM-DD)
 * @param eventTime - Time string like "5:00 PM"
 * @returns true if event has passed
 */
export function hasEventPassed(eventDate: string, eventTime: string): boolean {
  try {
    // 1. Get Event Wall Clock Time (as a Date object)
    const eventDateTime = createMelbourneEventDate(eventDate, eventTime);
    
    // 2. Get Melbourne Current Wall Clock Time (as a Date object)
    const melbourneNow = getMelbourneNow();
    
    // 3. Compare directly
    return melbourneNow > eventDateTime;
  } catch (error) {
    console.error('Error checking if event has passed:', error);
    return false;
  }
}