/** Minimal sprintf supporting %d (integer) placeholders. */
export function sprintf(format: string, ...args: Array<number | string>): string {
    let i = 0;
    return format.replace(/%d/g, () => {
        const val = args[i++];
        return val != null ? String(Math.floor(Number(val))) : '';
    });
}
