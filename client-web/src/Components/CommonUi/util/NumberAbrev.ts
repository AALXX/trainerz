/**
 * Abreviate a big number
 * @param {number} number
 * @return {string}
 */
function abbreviateNumber(number: number): string {
    const SOCIAL_MEDIA_SYMBOLS: { [key: string]: string } = {
        K: 'K',
        M: 'M',
        B: 'B',
        T: 'T'
    }

    // Limit to trillion (10^12) for simplicity, adjust as needed
    const MAX_LIMIT = Math.pow(10, 12)

    // Convert number to absolute value
    const absNumber = Math.abs(number)

    // Check if number is within range
    if (absNumber < 1000 || absNumber >= MAX_LIMIT) {
        return number.toString() // No abbreviation needed
    }

    // Determine the appropriate SI symbol
    let symbol = ''
    if (absNumber < 1000000) {
        symbol = SOCIAL_MEDIA_SYMBOLS.K
    } else if (absNumber < 1000000000) {
        symbol = SOCIAL_MEDIA_SYMBOLS.M
    } else if (absNumber < 1000000000000) {
        symbol = SOCIAL_MEDIA_SYMBOLS.B
    } else {
        symbol = SOCIAL_MEDIA_SYMBOLS.T
    }

    // Calculate the abbreviated value
    const abbreviatedValue = number / Math.pow(10, 3 * Math.floor(Math.log10(absNumber) / 3))

    // Format the value with a maximum of 2 decimal places
    const formattedValue = abbreviatedValue.toFixed(2)

    // Return the abbreviated value with the appropriate symbol
    return formattedValue + symbol
}

export { abbreviateNumber }
