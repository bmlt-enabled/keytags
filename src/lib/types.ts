/** Shared domain types for the keytag app. */

/** Compact, URL-encoded card payload (see encode.ts for key meanings). */
export interface Payload {
    /** explicit milestone tag number, e.g. "07" */
    m?: string;
    /** whole-year count for yearly tags */
    y?: number;
    /** recipient name / initial */
    to?: string;
    /** sender name */
    fr?: string;
    /** personal message */
    msg?: string;
    /** language code */
    l?: string;
    /** official (trademarked) faces: 1 = on */
    o?: number | boolean;
    /** show specialty tags: 1 = on */
    s?: number | boolean;
    /** clean date (YYYY-MM-DD) */
    d?: string;
    /** view: "display" | "edit", else card */
    v?: string;
}

/** An earned keytag. */
export interface Tag {
    num: string;
    kind?: string;
    years?: number | null;
}

/** Result of `dateSpan`: total days plus a calendar breakdown. */
export interface DateSpanResult {
    totalDays: number;
    years: number;
    months: number;
    days: number;
}

/** Localized clean-time text (see label.ts). */
export interface TimeText {
    days: string;
    main: string;
    line: string;
}

/** Presentational model consumed by KeytagCard / DisplayView. */
export interface CardModel {
    lang: string;
    official: boolean;
    showSpecial: boolean;
    tag: { num: string; years: number | null };
    headline: string;
    timeText: TimeText;
    to: string;
    from: string;
    msg: string;
}

/** A milestone option in the builder dropdown. */
export interface MilestoneOption {
    key: string;
    label: string;
    num: string;
    years: number | null;
}
