import slugify from 'slugify'

export const formatCurrencyVND = (amount: number): string => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

/**
 * Converts a date to a formatted string in Vietnamese time zone.
 * @param date - The date to convert, can be a string, number, or Date object.
 * @returns A formatted date string in 'vi-VN' locale.
 */
export const convertTimeVietnam = (date: string | number | Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh'
  }

  return new Date(date).toLocaleString('vi-VN', options)
}

/**
 * @param string - The string to be converted to a slug.
 * @description This function converts a given string into a URL-friendly slug format.
 * It replaces spaces with hyphens, removes special characters, and converts the string to lowercase.
 * It uses the 'slugify' library to perform the conversion.
 */
export const convertSlugUrl = (string: string) => {
  if (!string) return ''

  const slug = slugify(string, {
    lower: true,
    locale: 'vi'
  })

  return slug
}
