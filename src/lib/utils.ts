
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth Date of birth
 * @returns Age in years
 */
export function getAge(dateOfBirth: Date | undefined): number {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();
  
  // If birthday hasn't occurred yet this year, subtract one year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}
