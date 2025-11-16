/**
 * Composable for formatting numbers, currency, and other display values
 */
export const useFormatter = () => {
  /**
   * Format large numbers into readable format
   * Examples: 1234 -> "1.2K", 1000000 -> "1M", 1500000 -> "1.5M"
   */
  const formatNumber = (num: number): string => {
    if (num === 0) return "0"
    
    const absNum = Math.abs(num)
    
    if (absNum >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
    }
    if (absNum >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (absNum >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    
    return num.toString()
  }

  /**
   * Format views count with proper suffix
   */
  const formatViews = (views: number): string => {
    const formatted = formatNumber(views)
    return `${formatted} ${views === 1 ? 'view' : 'views'}`
  }

  /**
   * Format views count in Indonesian
   */
  const formatViewsId = (views: number): string => {
    const formatted = formatNumber(views)
    return `${formatted} dilihat`
  }

  /**
   * Format sales count with proper suffix
   */
  const formatSales = (sales: number): string => {
    const formatted = formatNumber(sales)
    return `${formatted} ${sales === 1 ? 'sale' : 'sales'}`
  }

  /**
   * Format sales count in Indonesian
   */
  const formatSalesId = (sales: number): string => {
    const formatted = formatNumber(sales)
    return `${formatted} terjual`
  }

  /**
   * Format price in Indonesian Rupiah
   */
  const formatPrice = (price: number): string => {
    if (price === 0) return 'Gratis'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  /**
   * Format date in Indonesian locale
   */
  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  /**
   * Format date and time in Indonesian locale
   */
  const formatDateTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Format file size in human readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Format percentage
   */
  const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`
  }

  /**
   * Format rating with stars
   */
  const formatRating = (rating: number): string => {
    return `${rating.toFixed(1)} ★`
  }

  return {
    formatNumber,
    formatViews,
    formatViewsId,
    formatSales,
    formatSalesId,
    formatPrice,
    formatDate,
    formatDateTime,
    formatFileSize,
    formatPercentage,
    formatRating
  }
}