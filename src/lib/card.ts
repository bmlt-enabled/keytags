/**
 * Turn a URL payload into a card view-model, and provide the milestone menu
 * and image-path helpers shared by every view.
 */
import { dateSpan, parseCleanDate, earnedTags } from './keytags';
import { cleanTimeText } from './label';
import { milestoneHeadline, uiStrings } from './ui';
import type { CardModel, MilestoneOption, Payload, Tag, TimeText } from './types';

const BASE = import.meta.env.BASE_URL;

export function tagFront(lang: string, num: string, official: boolean): string {
    // Generic (trademark-safe) mode uses the back face for the front too.
    return `${BASE}images/${lang}/${num}${official ? '_Front' : ''}.png`;
}
export function tagBack(lang: string, num: string): string {
    return `${BASE}images/${lang}/${num}.png`;
}
export const ringTopSrc = `${BASE}images/00_RingTop.png`;

/** The specialty-aware tag number for a whole-year milestone (mirrors createTagsArray). */
export function yearlyTag(years: number, showSpecial: boolean): string {
    const comp = years * 12;
    if (showSpecial) {
        if (comp === 60) return '15';
        if (comp === 120) return '10';
        if (comp === 180) return '16';
        if (comp === 300) return '12';
        if (comp === 360) return '14';
        if (comp % 120 === 0) return '11';
    }
    return '09';
}

const STANDARD = [
    { key: 'welcome', label: 'Welcome', num: '01' },
    { key: '30d', label: '30 Days', num: '02' },
    { key: '60d', label: '60 Days', num: '03' },
    { key: '90d', label: '90 Days', num: '04' },
    { key: '6m', label: '6 Months', num: '05' },
    { key: '9m', label: '9 Months', num: '06' },
    { key: '1y', label: '1 Year', num: '07' },
    { key: '18m', label: '18 Months', num: '08' },
];

/**
 * The ordered milestone menu for the builder dropdown.
 *
 * `maxYears` is the highest whole-year option to include (at least 50). The
 * builder raises it to cover a clean date beyond 50 years, so a long-term
 * milestone is never silently dropped back to "Welcome".
 */
export function milestoneOptions(showSpecial: boolean, maxYears = 50): MilestoneOption[] {
    const top = Math.max(50, Math.floor(maxYears) || 0);
    const opts: MilestoneOption[] = STANDARD.map((o) => ({ ...o, years: null }));
    for (let y = 2; y <= top; y++) {
        opts.push({ key: `y${y}`, label: `${y} Years`, num: yearlyTag(y, showSpecial), years: y });
    }
    return opts;
}

/** Find the menu key that matches an earned tag {num, years}. */
export function keyForTag(tag: Tag): string {
    if (tag.years) return `y${tag.years}`;
    const match = STANDARD.find((o) => o.num === tag.num);
    return match ? match.key : 'welcome';
}

/** The highest milestone earned as of a clean date. */
export function milestoneForDate(iso: string | undefined, showSpecial: boolean): Tag | null {
    const date = parseCleanDate(iso);
    if (!date) return null;
    const span = dateSpan(date);
    const tags = earnedTags(span.totalDays, span.years * 12 + span.months, showSpecial);
    return tags.at(-1) ?? { num: '01', kind: 'standard' };
}

/** Build the presentational model consumed by KeytagCard / DisplayView. */
export function buildCard(payload: Payload): CardModel {
    const lang = payload.l || 'en';
    const official = payload.o === 1 || payload.o === true;
    const showSpecial = payload.s === 1 || payload.s === true;
    const tag: { num: string; years: number | null } = {
        num: payload.m || '01',
        years: payload.y || null,
    };

    let timeText: TimeText = { days: '', main: '', line: '' };
    const date = parseCleanDate(payload.d);
    if (date) timeText = cleanTimeText(dateSpan(date), lang);

    return {
        lang,
        official,
        showSpecial,
        tag,
        headline: milestoneHeadline(tag, uiStrings(lang)),
        timeText,
        to: payload.to || '',
        from: payload.fr || '',
        msg: payload.msg || '',
    };
}
