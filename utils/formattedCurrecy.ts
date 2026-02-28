export function formatNumberWithCommas(value: number): string {
    if (value === null || value === undefined || isNaN(value)) return ''

    return Number(value).toLocaleString('en-US')
} 