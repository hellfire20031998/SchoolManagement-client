import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center" sx={{ bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
