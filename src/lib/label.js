/**
 * Localized clean-time sentence ("This is 1 year and 3 days.").
 * Ported from NACC `nacc2/src/nacc.js` formatYearsBlurb / formatMonthsBlurb
 * and displayCalculationResults, using the shared language packs.
 */
import { languages } from './lang/index.js';
import { sprintf } from './sprintf.js';

function formatYearsBlurb(L, r) {
    const { years: y, months: m, days: d } = r;

    if (y === 1) {
        if (m === 0 && d === 0) return L.result_1_year;
        if (m === 1 && d === 0) return L.result_1_year_and_1_month;
        if (m === 1 && d === 1) return L.result_1_year_1_month_and_1_day;
        if (m === 0 && d === 1) return L.result_1_year_and_1_day;
        if (m === 0 && d > 1) return sprintf(L.result_1_year_days_format, d);
        if (m > 1 && d > 1) return sprintf(L.result_1_year_months_and_days_format, m, d);
        if (m > 1 && d === 1) return sprintf(L.result_1_year_months_and_1_day_format, m);
        if (m > 1 && d === 0) return sprintf(L.result_years_months_format, 1, m);
    }

    if (m === 0 && d === 0) return sprintf(L.result_years_format, y);
    if (m === 1 && d === 0) return sprintf(L.result_years_and_1_month_format, y);
    if (m === 0 && d === 1) return sprintf(L.result_years_and_1_day_format, y);
    if (m === 0 && d > 1) return sprintf(L.result_years_and_days_format, y, d);
    if (m > 1 && d === 0) return sprintf(L.result_years_months_format, y, m);
    if (m === 1 && d === 1) return sprintf(L.result_years_1_month_and_1_day_format, y);
    if (m === 1 && d > 1) return sprintf(L.result_years_1_month_and_days_format, y, d);
    if (m > 1 && d === 1) return sprintf(L.result_years_months_and_1_day_format, y, m);
    return sprintf(L.result_years_months_and_days_format, y, m, d);
}

function formatMonthsBlurb(L, r) {
    const { months: m, days: d } = r;
    if (m > 1 && d === 0) return sprintf(L.result_months_format, m);
    if (m > 1 && d === 1) return sprintf(L.result_months_and_1_day_format, m);
    if (m > 1 && d > 1) return sprintf(L.result_months_and_days_format, m, d);
    return '';
}

/** Resolve a language pack, falling back to English. */
export function getLang(code) {
    return languages[code] ?? languages.en;
}

/**
 * The two-line clean-time text for a span.
 * @returns {{ days: string, main: string }}
 */
export function cleanTimeText(r, langCode) {
    const L = getLang(langCode);

    if (r.totalDays === 0) return { days: L.result_invalid, main: '' };
    if (r.totalDays === 1) return { days: L.result_1_day, main: '' };

    const days = sprintf(L.result_days_format, r.totalDays);
    let main = '';
    if (r.totalDays > 90) {
        main = r.years > 0 ? formatYearsBlurb(L, r) : formatMonthsBlurb(L, r);
    }
    return { days, main };
}
