export type User = {
  id: string
  email: string
  name: string
  role: string
}

export type SchoolClass = {
  _id: string
  classNumber: number
  section: string
  batchYear: number
  label?: string
}

export type Student = {
  _id: string
  fullName: string
  classId: string | SchoolClass
  /** Set by API for convenience */
  classLabel?: string
  rollNumber?: string | null
  email?: string
  phone?: string
  dateOfBirth?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type TaskStudentRef = {
  _id: string
  fullName: string
  classId?: string | SchoolClass
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Task = {
  _id: string
  studentId: string | TaskStudentRef
  title: string
  description?: string
  dueDate?: string
  status: 'pending' | 'completed'
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}
