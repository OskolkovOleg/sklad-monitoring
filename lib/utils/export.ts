/**
 * Utility functions for exporting data to various formats
 */

export interface ExportDataItem {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Convert data array to CSV string
 */
export function convertToCSV(data: ExportDataItem[], columns?: string[]): string {
  if (!data || data.length === 0) {
    return ''
  }

  // If columns not specified, extract from first item
  const headers = columns || Object.keys(data[0])
  
  // Create CSV header row
  const csvHeaders = headers.map(h => `"${h}"`).join(',')
  
  // Create CSV data rows
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item[header]
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '""'
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value).replace(/"/g, '""')
      return `"${stringValue}"`
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(csvContent: string, filename: string): void {
  console.log('downloadCSV called with filename:', filename)
  console.log('CSV content length:', csvContent.length)
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  console.log('Blob created:', blob)
  
  const link = document.createElement('a')
  console.log('link.download supported:', link.download !== undefined)
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob)
    console.log('Blob URL created:', url)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    
    console.log('About to click link...')
    link.click()
    console.log('Link clicked')
    
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('Cleanup complete')
  } else {
    console.error('Download attribute not supported')
  }
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV(
  data: ExportDataItem[],
  filename: string,
  columns?: string[]
): void {
  console.log('exportToCSV called')
  console.log('Data rows:', data.length)
  console.log('First row:', data[0])
  
  const csv = convertToCSV(data, columns)
  console.log('CSV converted, calling downloadCSV...')
  downloadCSV(csv, filename)
  console.log('downloadCSV completed')
}

/**
 * Format date for filename
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}
