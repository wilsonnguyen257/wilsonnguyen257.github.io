// Liturgical calendar for Sundays — enough to name "this Sunday" on the
// homepage (e.g. "Chúa Nhật XXVI Thường Niên · Năm A") without anyone having
// to type it in. Follows the Roman calendar as observed in Australia, where
// Epiphany, Ascension and Corpus Christi are kept on the following Sunday.
// Weekday feasts are out of scope: this only ever names a Sunday.

import { getMelbourneNow } from './timezone';

export type Season = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary';
type Lang = 'vi' | 'en';

export interface LiturgicalSunday {
  date: Date;
  season: Season;
  cycle: 'A' | 'B' | 'C';
  name: { vi: string; en: string };
}

const DAY = 86_400_000;

const atMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((atMidnight(b).getTime() - atMidnight(a).getTime()) / DAY);
const sameDay = (a: Date, b: Date) => daysBetween(a, b) === 0;

// Anonymous Gregorian computus.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// First Sunday of Advent: the fourth Sunday before Christmas.
function adventStart(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const back = christmas.getDay() === 0 ? 7 : christmas.getDay();
  return addDays(christmas, -back - 21);
}

// Epiphany is kept on the Sunday between 2 and 8 January (Australia). The
// Baptism of the Lord follows on the next Sunday — or on the Monday straight
// after, when Epiphany falls on the 7th or 8th — and closes Christmastide.
function epiphany(year: number): Date {
  const jan2 = new Date(year, 0, 2);
  return addDays(jan2, (7 - jan2.getDay()) % 7);
}
function baptismOfTheLord(year: number): Date {
  const ep = epiphany(year);
  return ep.getDate() >= 7 ? addDays(ep, 1) : addDays(ep, 7);
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];
const ordinalEn = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

// Feasts of the Lord and solemnities that take the place of a Sunday in
// Ordinary Time when they fall on one.
const FIXED_SUNDAY_FEASTS: Record<string, { vi: string; en: string }> = {
  '1-2': { vi: 'Lễ Dâng Chúa Giêsu trong Đền Thánh', en: 'The Presentation of the Lord' },
  '5-24': { vi: 'Lễ Sinh Nhật Thánh Gioan Tẩy Giả', en: 'The Nativity of St John the Baptist' },
  '5-29': { vi: 'Lễ Thánh Phêrô và Thánh Phaolô', en: 'Saints Peter and Paul' },
  '7-6': { vi: 'Lễ Chúa Hiển Dung', en: 'The Transfiguration of the Lord' },
  '7-15': { vi: 'Lễ Đức Mẹ Hồn Xác Lên Trời', en: 'The Assumption of the Blessed Virgin Mary' },
  '8-14': { vi: 'Lễ Suy Tôn Thánh Giá', en: 'The Exaltation of the Holy Cross' },
  '10-1': { vi: 'Lễ Các Thánh Nam Nữ', en: 'All Saints' },
  '10-2': { vi: 'Lễ Cầu Cho Các Tín Hữu Đã Qua Đời', en: 'All Souls' },
  '10-9': { vi: 'Lễ Cung Hiến Đền Thờ Latêranô', en: 'The Dedication of the Lateran Basilica' },
};

const named = (vi: string, en: string) => ({ vi, en });

function describeSunday(sunday: Date): Pick<LiturgicalSunday, 'season' | 'name'> {
  const y = sunday.getFullYear();
  const advent = adventStart(y);
  const christmas = new Date(y, 11, 25);

  // Advent
  if (sunday >= advent && sunday < christmas) {
    const n = daysBetween(advent, sunday) / 7 + 1;
    return { season: 'advent', name: named(`Chúa Nhật ${ROMAN[n]} Mùa Vọng`, `${ordinalEn(n)} Sunday of Advent`) };
  }

  // Christmastide, late December
  if (sunday >= christmas) {
    if (sameDay(sunday, christmas)) return { season: 'christmas', name: named('Lễ Chúa Giáng Sinh', 'The Nativity of the Lord') };
    return { season: 'christmas', name: named('Lễ Thánh Gia Thất', 'The Holy Family') };
  }

  // Christmastide, early January
  const ep = epiphany(y);
  const baptism = baptismOfTheLord(y);
  if (sunday <= baptism) {
    if (sameDay(sunday, ep)) return { season: 'christmas', name: named('Lễ Chúa Hiển Linh', 'The Epiphany of the Lord') };
    if (sameDay(sunday, baptism)) return { season: 'christmas', name: named('Lễ Chúa Giêsu Chịu Phép Rửa', 'The Baptism of the Lord') };
    // A Sunday on 1 January is Mary, Mother of God; one before Epiphany is the 2nd Sunday after Christmas.
    if (sunday.getMonth() === 0 && sunday.getDate() === 1) return { season: 'christmas', name: named('Lễ Đức Maria Mẹ Thiên Chúa', 'Mary, the Holy Mother of God') };
    return { season: 'christmas', name: named('Chúa Nhật II Sau Giáng Sinh', 'Second Sunday after Christmas') };
  }

  const easter = easterSunday(y);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);

  // Lent
  if (sunday > ashWednesday && sunday < easter) {
    const n = Math.floor(daysBetween(ashWednesday, sunday) / 7) + 1;
    if (n === 6) return { season: 'lent', name: named('Chúa Nhật Lễ Lá', 'Palm Sunday of the Passion of the Lord') };
    return { season: 'lent', name: named(`Chúa Nhật ${ROMAN[n]} Mùa Chay`, `${ordinalEn(n)} Sunday of Lent`) };
  }

  // Eastertide
  if (sunday >= easter && sunday <= pentecost) {
    const n = daysBetween(easter, sunday) / 7 + 1;
    if (n === 1) return { season: 'easter', name: named('Chúa Nhật Phục Sinh', 'Easter Sunday') };
    if (n === 7) return { season: 'easter', name: named('Lễ Chúa Thăng Thiên', 'The Ascension of the Lord') };
    if (n === 8) return { season: 'easter', name: named('Lễ Chúa Thánh Thần Hiện Xuống', 'Pentecost Sunday') };
    return { season: 'easter', name: named(`Chúa Nhật ${ROMAN[n]} Phục Sinh`, `${ordinalEn(n)} Sunday of Easter`) };
  }

  // Ordinary Time
  const fixed = FIXED_SUNDAY_FEASTS[`${sunday.getMonth()}-${sunday.getDate()}`];
  if (sunday > pentecost) {
    if (sameDay(sunday, addDays(pentecost, 7))) return { season: 'ordinary', name: named('Lễ Chúa Ba Ngôi', 'The Most Holy Trinity') };
    if (sameDay(sunday, addDays(pentecost, 14))) return { season: 'ordinary', name: named('Lễ Mình Máu Thánh Chúa', 'The Body and Blood of Christ') };
    if (fixed) return { season: 'ordinary', name: fixed };
    // Counted back from Christ the King, the 34th and last Sunday.
    const n = 34 - daysBetween(sunday, addDays(advent, -7)) / 7;
    if (n === 34) return { season: 'ordinary', name: named('Lễ Chúa Giêsu Kitô Vua Vũ Trụ', 'Our Lord Jesus Christ, King of the Universe') };
    return { season: 'ordinary', name: named(`Chúa Nhật ${ROMAN[n]} Thường Niên`, `${ordinalEn(n)} Sunday in Ordinary Time`) };
  }

  if (fixed) return { season: 'ordinary', name: fixed };
  // Before Lent: the first Sunday after the Baptism is the 2nd in Ordinary Time.
  const firstSunday = addDays(baptism, 7 - baptism.getDay() || 7);
  const n = daysBetween(firstSunday, sunday) / 7 + 2;
  return { season: 'ordinary', name: named(`Chúa Nhật ${ROMAN[n]} Thường Niên`, `${ordinalEn(n)} Sunday in Ordinary Time`) };
}

// Sunday readings cycle: the liturgical year starting at Advent is named for
// the calendar year it ends in, and year % 3 gives 1 → A, 2 → B, 0 → C.
function cycleFor(sunday: Date): 'A' | 'B' | 'C' {
  const y = sunday >= adventStart(sunday.getFullYear()) ? sunday.getFullYear() + 1 : sunday.getFullYear();
  return (['C', 'A', 'B'] as const)[y % 3];
}

export function describeLiturgicalSunday(date: Date): LiturgicalSunday {
  const sunday = atMidnight(date);
  return { date: sunday, cycle: cycleFor(sunday), ...describeSunday(sunday) };
}

/**
 * The Sunday of the next Mass, in Melbourne time. On a Sunday this stays
 * "today" until Mass has ended, then rolls over to next week.
 */
export function nextMassSunday(massEndHour: number, now: Date = getMelbourneNow()): LiturgicalSunday {
  const today = atMidnight(now);
  const dow = now.getDay();
  const offset = dow === 0 ? (now.getHours() >= massEndHour ? 7 : 0) : 7 - dow;
  return describeLiturgicalSunday(addDays(today, offset));
}

export const SEASON_NAME: Record<Season, Record<Lang, string>> = {
  advent: { vi: 'Mùa Vọng', en: 'Advent' },
  christmas: { vi: 'Mùa Giáng Sinh', en: 'Christmas' },
  lent: { vi: 'Mùa Chay', en: 'Lent' },
  easter: { vi: 'Mùa Phục Sinh', en: 'Easter' },
  ordinary: { vi: 'Mùa Thường Niên', en: 'Ordinary Time' },
};
