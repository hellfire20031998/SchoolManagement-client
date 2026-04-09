import { NavLink, useLocation } from 'react-router-dom'
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import {
  AssignmentOutlined,
  DashboardOutlined,
  GroupsOutlined,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { SchoolBrandLockup } from './SchoolBrandLockup'
import { useAuth } from '../context/AuthContext'

export type DashboardNavSection = 'overview' | 'students' | 'tasks'

type NavItem = {
  id: DashboardNavSection
  label: string
  Icon: typeof DashboardOutlined
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', Icon: DashboardOutlined },
  { id: 'students', label: 'Students', Icon: GroupsOutlined },
  { id: 'tasks', label: 'Tasks', Icon: AssignmentOutlined },
]

const ROUTES: Record<DashboardNavSection, string> = {
  overview: '/dashboard/overview',
  students: '/dashboard/students',
  tasks: '/dashboard/tasks',
}

type Props = {
  /** Close temporary drawer after navigation (mobile). */
  onMobileNavigate?: () => void
}

function navItemSelected(pathname: string, to: string, id: DashboardNavSection): boolean {
  const p = pathname.replace(/\/$/, '') || '/'
  const t = to.replace(/\/$/, '') || '/'
  if (p === t) return true
  if (id === 'overview' && p === '/dashboard') return true
  return false
}

export function DashboardSidebarContent({ onMobileNavigate }: Props) {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  return (
    <Box className="flex h-full flex-col">
      <Box className="px-3 py-4">
        <SchoolBrandLockup to="/dashboard/overview" />
      </Box>
      <Divider />
      <List dense sx={{ px: 1, py: 2 }} className="flex-1">
        {navItems.map(({ id, label, Icon }) => {
          const to = ROUTES[id]
          const selected = navItemSelected(pathname, to, id)
          return (
            <ListItemButton
              key={id}
              component={NavLink}
              to={to}
              end
              selected={selected}
              onClick={() => onMobileNavigate?.()}
              aria-current={selected ? 'page' : undefined}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }} />
            </ListItemButton>
          )
        })}
      </List>
      <Divider sx={{ mx: 1 }} />
      <List dense sx={{ px: 1, py: 1 }}>
        <ListItemButton
          onClick={() => {
            onMobileNavigate?.()
            logout()
          }}
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }} />
        </ListItemButton>
      </List>
    </Box>
  )
}
