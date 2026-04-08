import { IconButton, Tooltip } from '@mui/material'
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material'
import { useThemeMode } from '../context/ThemeModeContext'

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode()

  return (
    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        aria-label={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
        size="medium"
      >
        {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  )
}
