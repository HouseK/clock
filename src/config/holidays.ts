export const holidays: Record<string, string> = {
  '3-13': 'L. Ron Hubbard Bday',
  '5-9': 'Dianetics Day',
  '6-6': 'Maiden Voyage',
  '10-7': 'IAS Anniv',
  '12-31': 'NYE',
};

export function getAuditorsDay(date: Date): string {
  // Auditor's Day is the 2nd Sunday in Sept
  if (date.getMonth() === 8 && date.getDay() === 0 && date.getDate() >= 8 && date.getDate() <= 14) {
    return "Auditor's Day";
  }
  return '';
}

export function getHoliday(date: Date): string {
  const dKey = `${date.getMonth() + 1}-${date.getDate()}`;
  return holidays[dKey] || getAuditorsDay(date) || '';
}
