import { Typography } from '@mui/material'

export function OverviewPage() {
  return (
    <div>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Overview
      </Typography>
      <Typography component="p" color="text.secondary" sx={{ mb: 2 }}>
        Welcome to the admin workspace. Use the sidebar to open <strong>Students</strong> to manage
        rosters and <strong>Tasks</strong> to assign homework or mark work complete. Only signed-in
        admins can access these pages.
      </Typography>
      <Typography component="p" color="text.secondary" sx={{ mb: 0 }}>
        <strong>Metrics</strong> will be added in a future update—charts and summaries related to
        student and task performance will appear here when they are ready.
      </Typography>
    </div>
  )
}
