import { useOutletContext } from 'react-router-dom'
import { TaskSection } from '../../components/TaskSection'
import type { DashboardOutletContext } from './DashboardLayout'

export function TasksPage() {
  const { taskRefreshKey } = useOutletContext<DashboardOutletContext>()

  return <TaskSection key={taskRefreshKey} />
}
