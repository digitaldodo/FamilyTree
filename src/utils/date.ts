import { format, formatDistanceToNow, differenceInYears, isBefore, addYears, startOfDay } from 'date-fns';

export function formatDate(date: Date | string, formatString: string = 'PP'): string {
  if (!date) return '';
  return format(new Date(date), formatString);
}

export function getRelativeTime(date: Date | string): string {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateAge(birthDate: Date | string, deathDate?: Date | string | null): number | null {
  if (!birthDate) return null;
  const end = deathDate ? new Date(deathDate) : new Date();
  return differenceInYears(end, new Date(birthDate));
}

export function getNextBirthday(birthDate: Date | string): { date: Date; ageTurning: number; daysRemaining: number } | null {
  if (!birthDate) return null;
  
  const today = startOfDay(new Date());
  const birth = new Date(birthDate);
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  
  if (isBefore(nextBirthday, today)) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  const ageTurning = differenceInYears(nextBirthday, birth);
  const daysRemaining = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return { date: nextBirthday, ageTurning, daysRemaining };
}

export function getGenerationLabel(birthYear: number | string | null | undefined): string | null {
  if (!birthYear) return null;
  
  let year: number;
  if (typeof birthYear === 'string') {
    const d = new Date(birthYear);
    year = isNaN(d.getTime()) ? parseInt(birthYear, 10) : d.getFullYear();
  } else {
    year = birthYear;
  }
  
  if (isNaN(year)) return null;

  if (year >= 1928 && year <= 1945) return 'Silent Generation';
  if (year >= 1946 && year <= 1964) return 'Baby Boomer';
  if (year >= 1965 && year <= 1980) return 'Gen X';
  if (year >= 1981 && year <= 1996) return 'Millennial';
  if (year >= 1997 && year <= 2012) return 'Gen Z';
  if (year >= 2013) return 'Gen Alpha';
  
  return null;
}
