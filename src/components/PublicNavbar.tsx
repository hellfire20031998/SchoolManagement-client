import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Menu as MenuIcon } from '@mui/icons-material'
import { SchoolBrandLockup } from './SchoolBrandLockup'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../context/AuthContext'

const sectionLinkClass = 'text-slate-600 dark:text-slate-300'

export function PublicNavbar() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isLogin = pathname === '/login'
  const isRegister = pathname === '/register'
  const isDashboard = pathname.startsWith('/dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  const mobileDrawer = (
    <Box sx={{ width: 280, pt: 2 }} role="presentation">
      <List disablePadding>
        <ListItemButton
          component={RouterLink}
          to={{ pathname: '/', hash: 'about' }}
          onClick={closeMobile}
        >
          <ListItemText primary="About" />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to={{ pathname: '/', hash: 'programs' }}
          onClick={closeMobile}
        >
          <ListItemText primary="Programs" />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to={{ pathname: '/', hash: 'portal' }}
          onClick={closeMobile}
        >
          <ListItemText primary="Admin portal" />
        </ListItemButton>
      </List>
      <Divider sx={{ my: 1 }} />
      <List disablePadding>
        {user ? (
          <ListItemButton component={RouterLink} to="/dashboard" onClick={closeMobile} selected={isDashboard}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        ) : (
          <>
            <ListItemButton component={RouterLink} to="/login" onClick={closeMobile} selected={isLogin}>
              <ListItemText primary="Sign in" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/register"
              onClick={closeMobile}
              selected={isRegister}
            >
              <ListItemText primary="Create admin account" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95"
      color="transparent"
    >
      <Toolbar className="mx-auto max-w-6xl gap-1 px-3 sm:gap-2 sm:px-6">
        {!isMdUp && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            sx={{ mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box className="min-w-0 flex-1">
          <SchoolBrandLockup to="/" />
        </Box>
        <Box className="hidden items-center gap-1 md:flex">
          <Button
            color="inherit"
            component={RouterLink}
            to={{ pathname: '/', hash: 'about' }}
            className={sectionLinkClass}
          >
            About
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to={{ pathname: '/', hash: 'programs' }}
            className={sectionLinkClass}
          >
            Programs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to={{ pathname: '/', hash: 'portal' }}
            className={sectionLinkClass}
          >
            Admin portal
          </Button>
        </Box>
        <Box className="flex shrink-0 items-center gap-0 sm:gap-1">
          <ThemeToggle />
          {user ? (
            <Button
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
              variant={isDashboard ? 'outlined' : 'contained'}
              size="small"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
                variant={isLogin ? 'outlined' : 'text'}
                size="small"
              >
                Sign in
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant={isRegister ? 'outlined' : 'contained'}
                size="small"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Admin setup
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: 'none' } }}
      >
        {mobileDrawer}
      </Drawer>
    </AppBar>
  )
}
