import { useOutletContext } from 'react-router-dom'
import { StudentSection } from '../../components/StudentSection'
import type { DashboardOutletContext } from './DashboardLayout'

export function StudentsPage() {
  const { bumpTasks } = useOutletContext<DashboardOutletContext>()

  return <StudentSection onStudentsChanged={bumpTasks} />
}
