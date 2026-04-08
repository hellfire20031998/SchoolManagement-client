import type { ReactNode } from 'react'
import { DialogTitle, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

type Props = {
  children: ReactNode
  onClose: () => void
  /** When true, the close control is inactive (e.g. while saving). */
  disabled?: boolean
}

export function DialogTitleWithClose({ children, onClose, disabled }: Props) {
  return (
    <DialogTitle sx={{ position: 'relative', pr: 6 }}>
      {children}
      <IconButton
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={disabled}
        size="small"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  )
}
