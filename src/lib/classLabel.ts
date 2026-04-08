export type ClassParts = {
  classNumber: number
  section: string
  batchYear: number
}

/** Class_(number), Section (letter), Batch (year) */
export function formatClassLabel(c: ClassParts | null | undefined): string {
  if (!c || c.classNumber == null || c.section == null || c.batchYear == null) return ''
  return `Class_${c.classNumber}, Section ${String(c.section).toUpperCase()}, Batch ${c.batchYear}`
}
