import { formatClassLabel } from './classLabel'
import type { SchoolClass, Student } from '../types'

/** Lowercase string used for matching name, roll, and class label text. */
export function studentSearchHaystack(s: Student): string {
  const cls =
    s.classLabel ??
    (typeof s.classId === 'object' && s.classId && 'classNumber' in s.classId
      ? formatClassLabel(s.classId as SchoolClass)
      : '')
  return `${s.fullName} ${s.rollNumber ?? ''} ${cls}`.toLowerCase()
}

/**
 * All whitespace-separated terms must appear somewhere in the haystack (name, roll, or class).
 * Empty query matches everyone.
 */
export function matchesStudentSearchQuery(s: Student, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = studentSearchHaystack(s)
  const tokens = q.split(/\s+/).filter(Boolean)
  return tokens.every((t) => hay.includes(t))
}
