import { useState } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { HomeOutlined as HomeOutlinedIcon, Menu as MenuIcon } from '@mui/icons-material'
import { DashboardSidebarContent } from '../../components/DashboardSidebarContent'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

export const DRAWER_WIDTH = 268

export type DashboardOutletContext = {
  taskRefreshKey: number
  bumpTasks: () => void
}

const titleFromPath: Record<string, string> = {
  overview: 'Overview',
  students: 'Students',
  tasks: 'Tasks',
}

export function DashboardLayout() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [taskRefreshKey, setTaskRefreshKey] = useState(0)

  const pathParts = pathname.split('/').filter(Boolean)
  const leaf = pathParts[pathParts.length - 1] ?? 'overview'
  const segment = leaf === 'dashboard' ? 'overview' : leaf
  const toolbarTitle = titleFromPath[segment] ?? 'Dashboard'

  const bumpTasks = () => setTaskRefreshKey((k) => k + 1)

  const drawer = (
    <DashboardSidebarContent onMobileNavigate={() => setMobileOpen(false)} />
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          zIndex: (z) => z.zIndex.drawer + 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar className="gap-1 sm:gap-2" sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {!isMdUp && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 0.5 }}
              aria-label="open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              minWidth: 0,
            }}
            noWrap
          >
            {toolbarTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="hidden sm:block" noWrap>
            {user?.name || user?.email}
          </Typography>
          <ThemeToggle />
          <Tooltip title="School website — public landing page">
            <IconButton
              component={RouterLink}
              to="/"
              color="inherit"
              aria-label="School website"
            >
              <HomeOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Dashboard sections"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, sm: 3 },
            pb: { xs: 5, sm: 6 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <Outlet context={{ taskRefreshKey, bumpTasks } as DashboardOutletContext} />
        </Container>
      </Box>
    </Box>
  )
}
