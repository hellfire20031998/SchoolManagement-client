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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
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
  Edit as EditIcon,
  Replay as ReplayIcon,
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

function studentLabel(task: Task): string {
  const ref = task.studentId
  if (ref == null || ref === '') return '—'
  if (typeof ref === 'string') return ref
  const name = ref.fullName?.trim() || 'Student'
  const c = ref.classId
  if (c && typeof c === 'object' && 'classNumber' in c) {
    const label = formatClassLabel(c as SchoolClass)
    return label ? `${name} · ${label}` : name
  }
  return name
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

  const [taskSearchInput, setTaskSearchInput] = useState('')
  const [taskSearchDebounced, setTaskSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedTaskIds, setSelectedTaskIds] = useState(() => new Set<string>())

  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editStatus, setEditStatus] = useState<'pending' | 'completed'>('pending')
  const [editSaving, setEditSaving] = useState(false)

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkWorking, setBulkWorking] = useState(false)

  const loadSelectStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const data = await api<{ students: Student[] }>('/students/minimal')
      setStudents(Array.isArray(data.students) ? data.students : [])
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
      setClasses(Array.isArray(data.classes) ? data.classes : [])
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Failed to load classes')
    } finally {
      setClassesLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => setTaskSearchDebounced(taskSearchInput.trim()), 350)
    return () => window.clearTimeout(id)
  }, [taskSearchInput])

  useEffect(() => {
    setTaskPage(0)
  }, [taskSearchDebounced, statusFilter])

  useEffect(() => {
    setSelectedTaskIds(new Set())
  }, [taskSearchDebounced, statusFilter])

  const loadTasks = useCallback(async () => {
    setTasksLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(taskPage + 1),
        limit: String(taskRowsPerPage),
      })
      if (taskSearchDebounced) params.set('search', taskSearchDebounced)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const data = await api<{ tasks: Task[]; pagination: PaginationMeta }>(
        `/tasks?${params.toString()}`,
      )
      setTasks(Array.isArray(data.tasks) ? data.tasks : [])
      const total = data.pagination?.total ?? 0
      setTaskTotal(total)
      const totalPages = data.pagination?.totalPages ?? 1
      if (totalPages >= 1 && taskPage >= totalPages) {
        setTaskPage(Math.max(0, totalPages - 1))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setTasksLoading(false)
    }
  }, [taskPage, taskRowsPerPage, taskSearchDebounced, statusFilter])

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

  async function setTaskStatus(task: Task, status: 'pending' | 'completed') {
    try {
      await api(`/tasks/${task._id}`, {
        method: 'PUT',
        json: { status },
      })
      setSnackbar(status === 'completed' ? 'Marked complete' : 'Marked pending')
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Update failed')
    }
  }

  function openEdit(task: Task) {
    setEditTarget(task)
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
    const d = task.dueDate
    setEditDueDate(d ? String(d).slice(0, 10) : '')
    setEditStatus(task.status)
  }

  async function saveEdit() {
    if (!editTarget || !editTitle.trim()) return
    setEditSaving(true)
    try {
      await api(`/tasks/${editTarget._id}`, {
        method: 'PUT',
        json: {
          title: editTitle.trim(),
          description: editDescription,
          dueDate: editDueDate ? editDueDate : null,
          status: editStatus,
        },
      })
      setSnackbar('Task updated')
      setEditTarget(null)
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Could not save task')
    } finally {
      setEditSaving(false)
    }
  }

  function toggleTaskRow(id: string) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllOnPage() {
    setSelectedTaskIds((prev) => {
      if (tasks.length === 0) return prev
      const allSelected = tasks.every((t) => prev.has(t._id))
      const next = new Set(prev)
      if (allSelected) {
        for (const t of tasks) next.delete(t._id)
      } else {
        for (const t of tasks) next.add(t._id)
      }
      return next
    })
  }

  async function bulkSetStatus(status: 'pending' | 'completed') {
    if (selectedTaskIds.size === 0) return
    setBulkWorking(true)
    try {
      const data = await api<{ modifiedCount: number }>('/tasks/bulk-status', {
        method: 'POST',
        json: { taskIds: [...selectedTaskIds], status },
      })
      setSelectedTaskIds(new Set())
      setSnackbar(`Updated ${data.modifiedCount} task(s)`)
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Bulk update failed')
    } finally {
      setBulkWorking(false)
    }
  }

  async function confirmBulkDelete() {
    if (selectedTaskIds.size === 0) return
    setBulkWorking(true)
    try {
      const data = await api<{ deletedCount: number }>('/tasks/bulk-delete', {
        method: 'POST',
        json: { taskIds: [...selectedTaskIds] },
      })
      setBulkDeleteOpen(false)
      setSelectedTaskIds(new Set())
      setSnackbar(`Deleted ${data.deletedCount} task(s)`)
      await loadTasks()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Bulk delete failed')
    } finally {
      setBulkWorking(false)
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
            Assign tasks to students, search and filter the list, edit details, or change status any time. Use row
            checkboxes for bulk status or delete.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={studentsLoading || studentOptions.length === 0}
          sx={{ width: { xs: '100%', sm: 'auto' }, alignSelf: { xs: 'stretch', sm: 'auto' } }}
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

      <Box
        className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-end"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <TextField
          size="small"
          label="Search title, description, or student"
          placeholder="Type to filter…"
          value={taskSearchInput}
          onChange={(e) => setTaskSearchInput(e.target.value)}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 220 }, flex: { sm: '1 1 220px' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: taskSearchInput ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear task search"
                    edge="end"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setTaskSearchInput('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 0, sm: 160 } }}>
          <InputLabel id="task-status-filter-label">Status</InputLabel>
          <Select
            labelId="task-status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {selectedTaskIds.size > 0 && (
        <Box
          className="flex flex-wrap items-center gap-2 px-3 py-2"
          sx={{
            bgcolor: 'action.selected',
            borderBottom: 1,
            borderColor: 'divider',
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedTaskIds.size} selected
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={bulkWorking}
            onClick={() => bulkSetStatus('pending')}
            sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}
          >
            Mark pending
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={bulkWorking}
            onClick={() => bulkSetStatus('completed')}
            sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}
          >
            Mark complete
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={bulkWorking}
            onClick={() => setBulkDeleteOpen(true)}
            sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}
          >
            Delete selected
          </Button>
          <Button
            size="small"
            onClick={() => setSelectedTaskIds(new Set())}
            disabled={bulkWorking}
            sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
          >
            Clear selection
          </Button>
        </Box>
      )}

      <TableContainer
        className="max-h-[min(420px,55vh)]"
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            /** Auto layout + min width: horizontal scroll on narrow viewports instead of squashed/overlapping columns */
            tableLayout: 'auto',
            width: '100%',
            minWidth: { xs: 720, sm: 800, md: 960 },
            '& .MuiTableCell-root': { px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 }, verticalAlign: 'top' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 48, whiteSpace: 'nowrap' }}>
                <Checkbox
                  size="small"
                  indeterminate={
                    tasks.some((t) => selectedTaskIds.has(t._id)) &&
                    !tasks.every((t) => selectedTaskIds.has(t._id))
                  }
                  checked={tasks.length > 0 && tasks.every((t) => selectedTaskIds.has(t._id))}
                  onChange={toggleSelectAllOnPage}
                  disabled={tasks.length === 0 || loading}
                  slotProps={{ input: { 'aria-label': 'Select all tasks on this page' } }}
                />
              </TableCell>
              <TableCell sx={{ minWidth: { xs: 200, sm: 220 } }}>Title</TableCell>
              <TableCell className="hidden md:table-cell" sx={{ minWidth: 160 }}>
                Student
              </TableCell>
              <TableCell className="hidden sm:table-cell" sx={{ minWidth: 104, whiteSpace: 'nowrap' }}>
                Due
              </TableCell>
              <TableCell sx={{ minWidth: 112, whiteSpace: 'nowrap' }}>Status</TableCell>
              <TableCell align="right" sx={{ minWidth: { xs: 44, sm: 120 }, whiteSpace: 'nowrap', pr: { xs: 1, sm: 2 } }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading…</TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">
                    No tasks match your filters. Try adjusting search or status, or assign new tasks.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id} hover selected={selectedTaskIds.has(task._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedTaskIds.has(task._id)}
                      onChange={() => toggleTaskRow(task._id)}
                      slotProps={{ input: { 'aria-label': `Select task ${task.title}` } }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          wordBreak: 'break-word',
                        }}
                        component="span"
                      >
                        {task.title}
                      </Typography>
                      {task.description ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            wordBreak: 'break-word',
                          }}
                        >
                          {task.description}
                        </Typography>
                      ) : null}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 0.25,
                          display: { xs: 'block', md: 'none' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {studentLabel(task)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell className="hidden md:table-cell" sx={{ maxWidth: 220 }}>
                    <Typography sx={{ wordBreak: 'break-word' }} component="span">
                      {studentLabel(task)}
                    </Typography>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" sx={{ whiteSpace: 'nowrap' }}>
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
                      sx={{ maxWidth: '100%' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: { xs: 1, sm: 2 } }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-end', sm: 'center' },
                        justifyContent: 'flex-end',
                        gap: 0,
                      }}
                    >
                      <Tooltip title="Edit task">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEdit(task)}
                          aria-label="edit task"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      {task.status === 'pending' ? (
                        <Tooltip title="Mark complete">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setTaskStatus(task, 'completed')}
                            aria-label="mark complete"
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <CheckCircleOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mark pending">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => setTaskStatus(task, 'pending')}
                            aria-label="mark pending"
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <ReplayIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(task)}
                          aria-label="delete task"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
          px: { xs: 0.5, sm: 2 },
          overflow: 'hidden',
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1.5, sm: 1 },
            justifyContent: { xs: 'center', sm: 'flex-end' },
            minHeight: { xs: 'auto', sm: 52 },
            py: { xs: 1.5, sm: 0.5 },
          },
          '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': {
            fontSize: { xs: '0.8125rem', sm: '1rem' },
          },
          '& .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.8125rem', sm: '1rem' },
            textAlign: { xs: 'center', sm: 'right' },
            margin: { xs: '0 auto', sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 3, sm: 0 },
          },
          '& .MuiTablePagination-actions': {
            marginLeft: { xs: 0, sm: 'auto' },
            alignSelf: { xs: 'center', sm: 'auto' },
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

      <Dialog
        open={Boolean(editTarget)}
        onClose={() => !editSaving && setEditTarget(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: compactDialogPaperSx } }}
      >
        <DialogTitleWithClose onClose={() => !editSaving && setEditTarget(null)} disabled={editSaving}>
          Edit task
        </DialogTitleWithClose>
        <DialogContent className="flex flex-col gap-2 pt-1">
          {editTarget ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Student: {studentLabel(editTarget)}
              </Typography>
              <TextField
                label="Title"
                required
                fullWidth
                margin="dense"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={editSaving}
              />
              <TextField
                label="Description"
                fullWidth
                margin="dense"
                multiline
                minRows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={editSaving}
              />
              <TextField
                label="Due date"
                type="date"
                fullWidth
                margin="dense"
                slotProps={{ inputLabel: { shrink: true } }}
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                disabled={editSaving}
              />
              <FormControl fullWidth margin="dense" disabled={editSaving}>
                <InputLabel id="edit-task-status-label">Status</InputLabel>
                <Select
                  labelId="edit-task-status-label"
                  label="Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'pending' | 'completed')}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={editSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEdit} disabled={editSaving || !editTitle.trim()}>
            {editSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteOpen}
        onClose={() => !bulkWorking && setBulkDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: compactDialogPaperSx } }}
      >
        <DialogTitleWithClose onClose={() => !bulkWorking && setBulkDeleteOpen(false)}>
          Delete {selectedTaskIds.size} task{selectedTaskIds.size === 1 ? '' : 's'}?
        </DialogTitleWithClose>
        <DialogContent>
          <Typography>This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={bulkWorking}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmBulkDelete} disabled={bulkWorking}>
            {bulkWorking ? 'Deleting…' : 'Delete'}
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
