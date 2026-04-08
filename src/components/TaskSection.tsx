import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { ClassAutocomplete } from './ClassAutocomplete'
import { DialogTitleWithClose } from './DialogTitleWithClose'
import { api } from '../lib/api'
import { compactDialogPaperSx, largeDialogPaperSx } from '../lib/dialogPaperSx'
import { formatClassLabel } from '../lib/classLabel'
import { matchesStudentSearchQuery } from '../lib/studentSearch'
import type { PaginationMeta, SchoolClass, Student, Task } from '../types'

function studentClassIdStr(s: Student): string {
  const c = s.classId
  if (c && typeof c === 'object' && '_id' in c) return (c as SchoolClass)._id
  return typeof c === 'string' ? c : ''
}

export function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskTotal, setTaskTotal] = useState(0)
  const [taskPage, setTaskPage] = useState(0)
  const [taskRowsPerPage, setTaskRowsPerPage] = useState(10)

  const [students, setStudents] = useState<Student[]>([])
  const [studentsLoading, setStudentsLoading] = useState(true)

  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [classesLoading, setClassesLoading] = useState(true)

  const [tasksLoading, setTasksLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())
  /** Empty string = show all students; otherwise filter by class */
  const [classFilter, setClassFilter] = useState('')
  /** Search by name and/or class (and roll); terms are ANDed */
  const [studentListSearch, setStudentListSearch] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const loadSelectStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const data = await api<{ students: Student[] }>('/students/minimal')
      setStudents(data.students)
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Failed to load students for dropdown')
    } finally {
      setStudentsLoading(false)
    }
  }, [])

  const loadClasses = useCallback(async () => {
    setClassesLoading(true)
    try {
      const data = await api<{ classes: SchoolClass[] }>('/classes')
      setClasses(data.classes)
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Failed to load classes')
    } finally {
      setClassesLoading(false)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    setTasksLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(taskPage + 1),
        limit: String(taskRowsPerPage),
      })
      const data = await api<{ tasks: Task[]; pagination: PaginationMeta }>(
        `/tasks?${params.toString()}`,
      )
      setTasks(data.tasks)
      setTaskTotal(data.pagination.total)
      const { totalPages } = data.pagination
      if (totalPages >= 1 && taskPage >= totalPages) {
        setTaskPage(Math.max(0, totalPages - 1))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setTasksLoading(false)
    }
  }, [taskPage, taskRowsPerPage])

  useEffect(() => {
    loadSelectStudents()
    loadClasses()
  }, [loadSelectStudents, loadClasses])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const studentOptions = useMemo(() => students.filter((s) => s.isActive !== false), [students])

  const filteredStudents = useMemo(() => {
    let list = classFilter
      ? studentOptions.filter((s) => studentClassIdStr(s) === classFilter)
      : studentOptions
    if (studentListSearch.trim()) {
      list = list.filter((s) => matchesStudentSearchQuery(s, studentListSearch))
    }
    return list
  }, [studentOptions, classFilter, studentListSearch])

  const loading = tasksLoading

  function openCreate() {
    setSelectedIds(new Set())
    setClassFilter('')
    setStudentListSearch('')
    setTitle('')
    setDescription('')
    setDueDate('')
    setDialogOpen(true)
  }

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const s of filteredStudents) next.add(s._id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function createTask() {
    const t = title.trim()
    const ids = [...selectedIds]
    if (!t || ids.length === 0) return
    setSaving(true)
    try {
      const data = await api<{ createdCount: number }>('/tasks/bulk', {
        method: 'POST',
        json: {
          studentIds: ids,
          title: t,
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
        },
      })
      setSnackbar(
        data.createdCount === 1
          ? 'Task assigned to 1 student'
          : `Task assigned to ${data.createdCount} students`,
      )
      setDialogOpen(false)
      setTaskPage(0)
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Could not create task')
    } finally {
      setSaving(false)
    }
  }

  async function markComplete(task: Task) {
    try {
      await api(`/tasks/${task._id}/complete`, { method: 'PATCH' })
      setSnackbar('Marked complete')
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await api(`/tasks/${deleteTarget._id}`, { method: 'DELETE' })
      setSnackbar('Task removed')
      setDeleteTarget(null)
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleTaskChangePage = (_: unknown, newPage: number) => {
    setTaskPage(newPage)
  }

  const handleTaskChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskRowsPerPage(parseInt(e.target.value, 10))
    setTaskPage(0)
  }

  const selectedCount = selectedIds.size

  return (
    <Paper className="overflow-hidden shadow-sm" elevation={1}>
      <Box
        className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tasks & assignments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select one or more students, then assign the same task to all of them. Mark complete when done.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={studentsLoading || studentOptions.length === 0}
          className="shrink-0"
        >
          Assign task
        </Button>
      </Box>

      {studentOptions.length === 0 && !studentsLoading && (
        <Alert severity="info" className="m-4">
          Add at least one student before you can assign tasks.
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="m-4">
          {error}
        </Alert>
      )}

      <TableContainer
        className="max-h-[min(420px,55vh)]"
        sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell className="hidden md:table-cell">Student</TableCell>
              <TableCell className="hidden sm:table-cell">Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    No tasks on this page. Assign homework to one or more students.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{task.title}</Typography>
                    {task.description ? (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {task.description}
                      </Typography>
                    ) : null}
                    <Typography variant="caption" color="text.secondary" className="md:hidden">
                      {studentLabel(task)}
                    </Typography>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{studentLabel(task)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={task.status === 'completed' ? 'Completed' : 'Pending'}
                      color={task.status === 'completed' ? 'success' : 'default'}
                      variant={task.status === 'completed' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {task.status === 'pending' ? (
                      <Tooltip title="Mark complete">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => markComplete(task)}
                          aria-label="mark complete"
                        >
                          <CheckCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(task)}
                        aria-label="delete task"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={taskTotal}
        page={taskPage}
        onPageChange={handleTaskChangePage}
        rowsPerPage={taskRowsPerPage}
        onRowsPerPageChange={handleTaskChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Rows"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: { xs: 'center', sm: 'flex-end' },
          },
        }}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth={false}
        slotProps={{ paper: { sx: largeDialogPaperSx } }}
      >
        <DialogTitleWithClose
          onClose={() => !saving && setDialogOpen(false)}
          disabled={saving}
        >
          Assign task
        </DialogTitleWithClose>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 0,
            p: 0,
            overflow: { xs: 'auto', sm: 'hidden' },
            maxHeight: { xs: 'min(70dvh, 520px)', sm: 'none' },
            minHeight: { sm: 320 },
          }}
        >
          <Box
            sx={{
              flex: '1 1 50%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: { xs: 1.5, sm: 2 },
              borderRight: { sm: 1 },
              borderBottom: { xs: 1, sm: 0 },
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Students
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search by name, class, or roll (use several words to narrow). Open <strong>Filter by class</strong>{' '}
              and type in the field to search classes. Select all visible uses the current list.
            </Typography>
            <TextField
              fullWidth
              size="small"
              margin="dense"
              placeholder="Search name, class, or roll…"
              value={studentListSearch}
              onChange={(e) => setStudentListSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: studentListSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear search"
                        edge="end"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setStudentListSearch('')}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <ClassAutocomplete
              classes={classes}
              valueId={classFilter}
              onChangeId={setClassFilter}
              label="Filter by class"
              allowClear
              placeholder="All classes — open to search"
              disabled={classesLoading}
              size="small"
              margin="dense"
              fullWidth
            />
            <Box className="flex flex-wrap items-center gap-1">
              <Chip size="small" label={`${selectedCount} selected`} variant="outlined" />
              <Button size="small" variant="outlined" onClick={selectAllFiltered} disabled={filteredStudents.length === 0}>
                Select all visible
              </Button>
              <Button size="small" variant="outlined" onClick={clearSelection} disabled={selectedCount === 0}>
                Clear
              </Button>
            </Box>
            <Box
              sx={{
                flex: 1,
                minHeight: 200,
                maxHeight: { xs: 280, sm: 'min(45vh, 360px)' },
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'auto',
              }}
            >
              {studentsLoading ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  Loading students…
                </Typography>
              ) : filteredStudents.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  No students match this filter.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {filteredStudents.map((s) => {
                    const checked = selectedIds.has(s._id)
                    return (
                      <ListItem key={s._id} disablePadding>
                        <ListItemButton onClick={() => toggleStudent(s._id)} dense>
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            <Checkbox
                              edge="start"
                              checked={checked}
                              tabIndex={-1}
                              disableRipple
                              slotProps={{
                                input: {
                                  'aria-label': `Assign task to ${s.fullName}`,
                                },
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={s.fullName}
                            secondary={
                              s.classLabel ??
                              (typeof s.classId === 'object' && s.classId
                                ? formatClassLabel(s.classId as SchoolClass)
                                : undefined)
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              flex: '1 1 50%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: { xs: 1.5, sm: 2 },
              overflow: 'auto',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Task
            </Typography>
            <TextField
              label="Title"
              required
              fullWidth
              margin="dense"
              placeholder="e.g. Math homework – Chapter 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              margin="dense"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Due date"
              type="date"
              fullWidth
              margin="dense"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: 1,
            px: { xs: 2, sm: 3 },
            pb: 2,
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createTask}
            disabled={saving || !title.trim() || selectedCount === 0}
          >
            {saving
              ? 'Saving…'
              : selectedCount === 0
                ? 'Assign'
                : `Assign to ${selectedCount} student${selectedCount === 1 ? '' : 's'}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: compactDialogPaperSx } }}
      >
        <DialogTitleWithClose onClose={() => setDeleteTarget(null)}>
          Delete task?
        </DialogTitleWithClose>
        <DialogContent>
          <Typography>Remove &quot;{deleteTarget?.title}&quot;? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  )
}
