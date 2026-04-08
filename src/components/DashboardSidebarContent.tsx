import { NavLink, useLocation } from 'react-router-dom'
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  AssignmentOutlined,
  DashboardOutlined,
  GroupsOutlined,
  School as SchoolIcon,
} from '@mui/icons-material'

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

export function DashboardSidebarContent({ onMobileNavigate }: Props) {
  const { pathname } = useLocation()

  return (
    <Box className="flex h-full flex-col">
      <Box className="flex items-center gap-2 px-3 py-4">
        <Box
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
          sx={{ bgcolor: 'primary.main' }}
        >
          <SchoolIcon fontSize="small" />
        </Box>
        <Box className="min-w-0">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            School Management
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Admin workspace
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List dense sx={{ px: 1, py: 2 }} className="flex-1">
        {navItems.map(({ id, label, Icon }) => {
          const to = ROUTES[id]
          const selected = pathname === to
          return (
            <ListItemButton
              key={id}
              component={NavLink}
              to={to}
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
    </Box>
  )
}
