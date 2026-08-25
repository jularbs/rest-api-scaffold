export function getDate(date?: Date | string): string {
  const dateValue =
    date instanceof Date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : date;

  return dateValue as string;
}
