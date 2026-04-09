import { Link as RouterLink } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { School as SchoolIcon } from '@mui/icons-material'

type Props = {
  to: string
  /** Smaller icon/text for the dashboard app bar */
  dense?: boolean
}

export function SchoolBrandLockup({ to, dense }: Props) {
  const box = dense ? 36 : 40
  const iconPx = dense ? 20 : 24

  return (
    <Box
      component={RouterLink}
      to={to}
      className="flex min-w-0 items-center gap-2 no-underline sm:gap-2"
      sx={{ color: 'inherit', textDecoration: 'none' }}
    >
      <Box
        sx={{
          width: box,
          height: box,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 1,
        }}
      >
        <SchoolIcon sx={{ fontSize: iconPx }} />
      </Box>
      <Box className="min-w-0">
        <Typography
          variant={dense ? 'subtitle2' : 'subtitle1'}
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: dense ? undefined : { xs: '0.9rem', sm: '1rem' },
          }}
          noWrap
        >
          Greenwood Academy
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            display: dense ? { xs: 'none', sm: 'block' } : { xs: 'none', sm: 'block' },
          }}
        >
          School Management Portal
        </Typography>
      </Box>
    </Box>
  )
}
