import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, IconButton, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { ACTIVITY_CAMPUS_IMAGES } from '../../data/landingMedia'

const AUTO_MS = 5500

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5, ease: 'easeInOut' as const },
}

type Props = {
  /** Override default images from `public/activity/`. */
  images?: readonly string[]
}

export function CampusLifeCarousel({ images = ACTIVITY_CAMPUS_IMAGES }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides = images.length > 0 ? [...images] : []
  const len = slides.length

  const go = useCallback(
    (dir: -1 | 1) => {
      if (len === 0) return
      setIndex((i) => (i + dir + len) % len)
    },
    [len],
  )

  useEffect(() => {
    if (len <= 1 || paused) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % len), AUTO_MS)
    return () => window.clearInterval(t)
  }, [len, paused])

  if (len === 0) {
    return (
      <Box
        className="flex aspect-[4/3] items-end rounded-2xl bg-gradient-to-br from-teal-100 to-slate-200 p-8 shadow-inner dark:from-teal-950 dark:to-slate-800"
        aria-hidden
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }} className="text-teal-900 dark:text-teal-100">
            Campus life
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add images under public/activity and list them in src/data/landingMedia.ts.
          </Typography>
        </Box>
      </Box>
    )
  }

  const src = slides[index]

  return (
    <Box
      className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={src} className="absolute inset-0" {...fade}>
          <Box
            component="img"
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      <Box
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
        aria-hidden
      />

      <Box className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-6">
        <Box className="min-w-0 pr-2">
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white' }}>
            Campus life
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
            Arts, athletics, and community service — learning beyond the classroom.
          </Typography>
        </Box>
        {len > 1 && (
          <Box className="pointer-events-auto flex shrink-0 gap-0.5">
            <IconButton
              size="small"
              onClick={() => go(-1)}
              sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.35)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
              aria-label="Previous campus photo"
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => go(1)}
              sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.35)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
              aria-label="Next campus photo"
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {len > 1 && (
        <Box className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className="rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label={`Campus photo ${i + 1} of ${len}`}
              aria-current={i === index}
            >
              <motion.span
                className="block h-1.5 rounded-full bg-white/40"
                animate={{
                  width: i === index ? 22 : 6,
                  backgroundColor: i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </button>
          ))}
        </Box>
      )}
    </Box>
  )
}
