/**
 * Pluralization, date formatting, and tabular numeral quantity helpers
 */

export function formatPlural(count: number, singular: string, plural: string, isTamil = false, singularTa?: string, pluralTa?: string): string {
  if (isTamil) {
    return `${count} ${count === 1 ? (singularTa || singular) : (pluralTa || plural || singularTa || singular)}`;
  }
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '15 Aug 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatQuantity(value: number, unit: string): string {
  const formattedNum = value.toLocaleString('en-IN');
  return `${formattedNum}\u00A0${unit}`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
