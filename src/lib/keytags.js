/**
 * Clean-time math and milestone→keytag rules.
 *
 * `dateSpan` is lifted verbatim from NACC's `nacc2/src/calc.js`.
 * `earnedTags` is a pure extraction of the tag-selection thresholds in
 * `nacc2/src/nacc.js` `createTagsArray`, returning structured data instead of
 * building DOM.
 */

/** Midnight at the start of the day the given date falls in, in local time. */
function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * @param {Date} fromDate
 * @param {Date} [now]
 * @returns {{ totalDays: number, years: number, months: number, days: number }}
 */
export function dateSpan(fromDate, now = new Date()) {
    const diff = { totalDays: 0, years: 0, months: 0, days: 0 };

    if (now <= fromDate) return diff;

    // Count whole calendar days (DST-safe): normalise both ends to local
    // midnight before dividing, and round rather than floor. See calc.js.
    diff.totalDays = Math.round(
        (startOfDay(now).getTime() - startOfDay(fromDate).getTime()) / 86400000,
    );

    diff.years = now.getFullYear() - fromDate.getFullYear();
    diff.months = now.getMonth() - fromDate.getMonth();
    diff.days = now.getDate() - fromDate.getDate();

    if (diff.days < 0) {
        // Borrow the length of the month we are borrowing *into* — the one
        // before `now`'s month, in `now`'s year (day 0 of `now`'s month is the
        // last day of the previous month). Using `fromDate`'s month/year here
        // grabs the wrong length when the two months differ (e.g. a leap
        // February), skewing the calendar breakdown by a day or two.
        const numDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        diff.months -= 1;
        diff.days += numDays;
    }

    if (diff.months < 0) {
        diff.months += 12;
        diff.years -= 1;
    }

    return diff;
}

/**
 * Parse a YYYY-MM-DD string into a local Date (no timezone surprises).
 * @param {string} iso
 * @returns {Date|null}
 */
export function parseCleanDate(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return null;
    // Reject impossible dates the Date constructor silently rolls over
    // (e.g. 2025-02-31 → Mar 3; 2025-13-01 → Jan 1 2026).
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }
    return date;
}

/**
 * The ordered set of keytags a person has earned.
 *
 * Mirrors `createTagsArray` exactly. Each entry:
 *   { num: '07', kind: 'standard'|'yearly'|'special', years?: number }
 *
 * @param {number} totalDays
 * @param {number} totalMonths  (years*12 + months)
 * @param {boolean} [showSpecial]
 * @returns {Array<{num: string, kind: string, years?: number}>}
 */
export function earnedTags(totalDays, totalMonths, showSpecial = false) {
    /** @type {Array<{num: string, kind: string, years?: number}>} */
    const tags = [];

    if (totalDays >= 1) tags.push({ num: '01', kind: 'standard' });
    if (totalDays >= 30) tags.push({ num: '02', kind: 'standard' });
    if (totalDays >= 60) tags.push({ num: '03', kind: 'standard' });
    if (totalDays >= 90) tags.push({ num: '04', kind: 'standard' });

    if (totalDays > 90) {
        if (totalMonths > 5) tags.push({ num: '05', kind: 'standard' });
        if (totalMonths > 8) tags.push({ num: '06', kind: 'standard' });
        if (totalMonths > 11) tags.push({ num: '07', kind: 'standard' });
        if (totalMonths > 17) tags.push({ num: '08', kind: 'standard' });
        if (totalMonths > 23) tags.push({ num: '09', kind: 'yearly', years: 2 });

        for (let i = 24; i <= totalMonths - 12; i += 12) {
            const comp = i + 12;
            const years = comp / 12;
            let specialTag = false;

            if (showSpecial) {
                if (comp === 60) {
                    specialTag = true;
                    tags.push({ num: '15', kind: 'special', years });
                }
                if (comp === 120) {
                    specialTag = true;
                    tags.push({ num: '10', kind: 'special', years });
                }
                if (comp === 180) {
                    specialTag = true;
                    tags.push({ num: '16', kind: 'special', years });
                }
                if (!specialTag && comp === 300) {
                    specialTag = true;
                    tags.push({ num: '12', kind: 'special', years });
                }
                if (!specialTag && comp === 360) {
                    specialTag = true;
                    tags.push({ num: '14', kind: 'special', years });
                }
                if (!specialTag && comp % 120 === 0) {
                    specialTag = true;
                    tags.push({ num: '11', kind: 'special', years });
                }
            }

            if (!specialTag) tags.push({ num: '09', kind: 'yearly', years });

            if (showSpecial && comp === 324 && totalDays > 9999) {
                tags.push({ num: '13', kind: 'special', years });
            }
        }
    }

    return tags;
}

/**
 * Short English milestone name for a tag, used as the card headline.
 * @param {{num: string, kind: string, years?: number}} tag
 * @returns {string}
 */
export function milestoneLabel(tag) {
    const NAMES = {
        '01': 'Welcome',
        '02': '30 Days',
        '03': '60 Days',
        '04': '90 Days',
        '05': '6 Months',
        '06': '9 Months',
        '07': '1 Year',
        '08': '18 Months',
    };
    if (NAMES[tag.num]) return NAMES[tag.num];
    if (tag.years) return `${tag.years} Year${tag.years === 1 ? '' : 's'}`;
    return 'Clean Time';
}
