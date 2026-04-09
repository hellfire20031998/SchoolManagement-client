import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, Button, Container, IconButton, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { SCHOOL_HERO_IMAGES } from '../../data/landingMedia'

const AUTO_MS = 6500

const HERO_COPY = [
  {
    kicker: 'Excellence in education',
    title: 'Nurturing minds, building futures',
    description:
      'A welcoming place for students to grow — with modern tools for administrators to manage enrollment, student records, and assignments in one secure place.',
  },
  {
    kicker: 'Community & character',
    title: 'Together we learn, lead, and belong',
    description:
      'Small classes, caring mentors, and rich activities help every student discover strengths, build confidence, and contribute to a vibrant school community.',
  },
  {
    kicker: 'Digital school operations',
    title: 'Run your school with clarity and control',
    description:
      'Our admin portal keeps rosters, classes, and homework organized — so staff spend less time on paperwork and more time supporting students.',
  },
] as const

const GRADIENT_FALLBACK_SLIDES = [
  {
    id: 'slide-1',
    gradient: 'from-teal-700 via-teal-800 to-slate-900',
    ...HERO_COPY[0],
  },
  {
    id: 'slide-2',
    gradient: 'from-indigo-800 via-teal-900 to-slate-950',
    ...HERO_COPY[1],
  },
  {
    id: 'slide-3',
    gradient: 'from-emerald-800 via-cyan-900 to-slate-900',
    ...HERO_COPY[2],
  },
] as const

const heroSlidesFromSchoolImages =
  SCHOOL_HERO_IMAGES.length > 0
    ? SCHOOL_HERO_IMAGES.map((image, i) => ({
        id: `hero-school-${i}`,
        image,
        ...HERO_COPY[i % HERO_COPY.length],
      }))
    : null

function HeroCtaButtons() {
  const { user } = useAuth()
  if (user) {
    return (
      <Button
        component={RouterLink}
        to="/dashboard"
        variant="contained"
        size="large"
        className="bg-white text-teal-900 shadow-lg hover:bg-slate-100"
        sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
      >
        Open dashboard
      </Button>
    )
  }
  return (
    <>
      <Button
        component={RouterLink}
        to="/register"
        variant="contained"
        size="large"
        className="bg-white text-teal-900 shadow-lg hover:bg-slate-100"
        sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
      >
        Get started
      </Button>
      <Button
        component={RouterLink}
        to="/login"
        variant="outlined"
        size="large"
        className="border-white text-white hover:border-white hover:bg-white/10"
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        Staff sign in
      </Button>
    </>
  )
}

const contentMotion = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
}

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = heroSlidesFromSchoolImages ?? [...GRADIENT_FALLBACK_SLIDES]
  const len = slides.length
  const go = useCallback((dir: -1 | 1) => {
    setIndex((i) => (i + dir + len) % len)
  }, [len])

  useEffect(() => {
    if (paused) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % len), AUTO_MS)
    return () => window.clearInterval(t)
  }, [paused, len])

  const slide = slides[index]
  const usePhotos = heroSlidesFromSchoolImages != null

  return (
    <Box
      id="top"
      className="relative min-h-[min(520px,85vh)] overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        {usePhotos ? (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            <Box
              component="img"
              src={(slide as { image: string }).image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <Box
              className="absolute inset-0 bg-gradient-to-br from-teal-950/88 via-slate-950/75 to-slate-950/92"
              aria-hidden
            />
          </motion.div>
        ) : (
          <motion.div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${(slide as (typeof GRADIENT_FALLBACK_SLIDES)[number]).gradient}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <Box
        className="pointer-events-none absolute inset-0 opacity-30"
        sx={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <Container
        maxWidth="lg"
        className="relative z-10 flex min-h-[min(520px,85vh)] flex-col justify-center px-4 py-10 sm:py-14 md:py-20"
      >
        <Box className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.id} {...contentMotion} className="max-w-2xl">
              <Typography
                variant="overline"
                sx={{ letterSpacing: '0.2em', opacity: 0.9, fontWeight: 600 }}
              >
                {slide.kicker}
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mt: 1,
                  mb: 2,
                  fontSize: { xs: '1.65rem', sm: '2.125rem', md: '2.75rem' },
                  lineHeight: { xs: 1.2, sm: 1.25 },
                }}
              >
                {slide.title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.92,
                  fontWeight: 400,
                  mb: 4,
                  maxWidth: 520,
                  fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                }}
              >
                {slide.description}
              </Typography>
              <Box className="flex flex-wrap gap-2 sm:gap-3">
                <HeroCtaButtons />
              </Box>
            </motion.div>
          </AnimatePresence>

          <Box className="hidden items-center justify-end gap-1 lg:flex">
            <IconButton
              onClick={() => go(-1)}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => go(1)}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
              aria-label="Next slide"
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        <Box className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Box className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className="group rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
              >
                <motion.span
                  className="block h-2 rounded-full bg-white/35 transition-colors group-hover:bg-white/55"
                  animate={{
                    width: i === index ? 28 : 8,
                    backgroundColor:
                      i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              </button>
            ))}
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>
            {paused ? 'Paused' : 'Auto-advancing'} · use dots or arrows
          </Typography>
        </Box>

        <Box className="mt-4 flex justify-center gap-2 lg:hidden">
          <IconButton
            onClick={() => go(-1)}
            size="small"
            sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => go(1)}
            size="small"
            sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
            aria-label="Next slide"
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Container>
    </Box>
  )
}
