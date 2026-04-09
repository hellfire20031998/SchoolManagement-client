import { useEffect } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Link,
} from '@mui/material'
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Groups as GroupsIcon,
  Lock as LockIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import { PublicNavbar } from '../components/PublicNavbar'
import { HeroCarousel } from '../components/landing/HeroCarousel'
import { CampusLifeCarousel } from '../components/landing/CampusLifeCarousel'
import { useAuth } from '../context/AuthContext'

const viewportOnce = { once: true as const, margin: '-72px' as const, amount: 0.25 }
const easeOut = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: viewportOnce,
  transition: { duration: 0.55, ease: easeOut },
}

const statStaggerParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09 },
  },
}

const statStaggerChild = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
}

const cardStaggerParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardStaggerChild = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
}

function LandingView() {
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [location.hash, location.pathname])

  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <HeroCarousel />

      {/* Quick stats strip */}
      <Box className="border-b border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <Container maxWidth="lg" className="px-4">
          <motion.div
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={statStaggerParent}
          >
            {[
              { label: 'Founded', value: '1998' },
              { label: 'Grades', value: 'K–12' },
              { label: 'Student focus', value: 'Holistic' },
              { label: 'Digital tools', value: 'Secure' },
            ].map((item) => (
              <motion.div key={item.label} className="text-center" variants={statStaggerChild}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Box>

      {/* About */}
      <Container maxWidth="lg" className="px-4 py-12 sm:py-16 md:py-20" id="about">
        <Box className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div {...fadeUp}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              About our school
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Where curiosity meets care
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 2 }}>
              Gridaan Academy is committed to academic rigor, creativity, and character. Our faculty
              partners with families to help every learner feel known, challenged, and supported.
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 0 }}>
              Behind the scenes, our administration uses a private portal to keep student information
              organized and assignments on track — so teachers can focus on what matters most.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: easeOut }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <CampusLifeCarousel />
            </motion.div>
          </motion.div>
        </Box>
      </Container>

      {/* Programs / portal features */}
      <Box className="bg-slate-100 py-16 sm:py-20 dark:bg-slate-900/80" id="programs">
        <Container maxWidth="lg" className="px-4">
          <motion.div className="mb-10 text-center" {...fadeUp}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
              What we offer
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Programs & support
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560, mx: 'auto' }}>
              From structured academics to digital administration — everything works together for a
              smoother school day.
            </Typography>
          </motion.div>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={cardStaggerParent}
          >
            {[
              {
                icon: <GroupsIcon fontSize="large" color="primary" />,
                title: 'Student records',
                text: 'Keep rosters, classes, and contact details organized in one place.',
              },
              {
                icon: <AssignmentTurnedInIcon fontSize="large" color="primary" />,
                title: 'Assignments',
                text: 'Assign homework, track due dates, and mark work as completed.',
              },
              {
                icon: <LockIcon fontSize="large" color="primary" />,
                title: 'Secure access',
                text: 'Only authorized administrators can open the management dashboard.',
              },
              {
                icon: <SchoolIcon fontSize="large" color="primary" />,
                title: 'School-wide view',
                text: 'See students and tasks together for a clear operational snapshot.',
              },
            ].map((card) => (
              <motion.div key={card.title} variants={cardStaggerChild}>
                <Card
                  elevation={0}
                  className="h-full border border-slate-200/80 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <CardContent className="flex flex-col gap-2 p-5">
                    <motion.div
                      className="mb-1 w-fit"
                      whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.45 } }}
                    >
                      {card.icon}
                    </motion.div>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.text}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Box>

      {/* Admin CTA */}
      <Box className="py-16 sm:py-20" id="portal">
        <Container maxWidth="md" className="px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Administrator portal
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 3 }}>
              Staff and school administrators can sign in to manage students and tasks. New schools can
              create their first admin account to begin.
            </Typography>
            <Box className="flex flex-wrap justify-center gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  component={RouterLink}
                  to={user ? '/dashboard' : '/login'}
                  variant="contained"
                  size="large"
                >
                  {user ? 'Go to dashboard' : 'Sign in to dashboard'}
                </Button>
              </motion.div>
              {!user ? (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button component={RouterLink} to="/register" variant="outlined" size="large">
                    Create admin account
                  </Button>
                </motion.div>
              ) : null}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950"
      >
        <Container
          maxWidth="lg"
          className="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row"
        >
          <Box className="flex items-center gap-2">
            <SchoolIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Gridaan Academy. All rights reserved.
            </Typography>
          </Box>
          <Box className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit" variant="body2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link component={RouterLink} to="/login" underline="hover" color="inherit" variant="body2">
                  Sign in
                </Link>
                <Link component={RouterLink} to="/register" underline="hover" color="inherit" variant="body2">
                  Register
                </Link>
              </>
            )}
            <Link href="#top" underline="hover" color="inherit" variant="body2">
              Back to top
            </Link>
          </Box>
        </Container>
      </motion.footer>
    </Box>
  )
}

export function LandingPage() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    )
  }

  return <LandingView />
}
