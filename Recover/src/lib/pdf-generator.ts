import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Generator utilities for Recover reports
 */

export interface ReportOptions {
  dateRange: 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
  includeGrowthLogs?: boolean;
  includeGratitude?: boolean;
}

/**
 * Generate a PDF from an HTML element
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Get date range description
 */
export function getDateRangeDescription(options: ReportOptions): string {
  if (options.dateRange === 'all') {
    return 'All Time';
  }

  const now = new Date();
  const startDate = options.startDate ? new Date(options.startDate) : now;
  const endDate = options.endDate ? new Date(options.endDate) : now;

  switch (options.dateRange) {
    case 'week':
      return 'Past 7 Days';
    case 'month':
      return 'Past 30 Days';
    case 'year':
      return 'Past Year';
    default:
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  options: ReportOptions
): T[] {
  if (options.dateRange === 'all') {
    return data;
  }

  const now = new Date();
  const endDate = options.endDate ? new Date(options.endDate) : now;

  let startDate: Date;
  switch (options.dateRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = options.startDate ? new Date(options.startDate) : new Date(0);
  }

  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Generate filename for report
 */
export function generateReportFilename(options: ReportOptions): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const rangeStr = options.dateRange === 'all'
    ? 'all-time'
    : options.dateRange;

  return `recovery-report-${rangeStr}-${dateStr}.pdf`;
}
