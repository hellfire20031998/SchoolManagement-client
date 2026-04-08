import type { SxProps, Theme } from '@mui/material/styles'

/** Large forms (students, assign task): safe on phones, capped width on wide screens */
export const largeDialogPaperSx: SxProps<Theme> = {
  width: { xs: 'calc(100vw - 24px)', sm: 'min(80vw, 920px)' },
  maxWidth: { xs: 'calc(100vw - 24px)', sm: 'min(80vw, 920px)' },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: '85vh' },
  m: { xs: 1.5, sm: 2 },
}

/** Small confirmations / compact forms */
export const compactDialogPaperSx: SxProps<Theme> = {
  m: { xs: 1.5, sm: 2 },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: '90vh' },
}
