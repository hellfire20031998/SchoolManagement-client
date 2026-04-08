import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
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
  InputAdornment,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { ClassAutocomplete } from './ClassAutocomplete'
import { DialogTitleWithClose } from './DialogTitleWithClose'
import { api } from '../lib/api'
import { compactDialogPaperSx, largeDialogPaperSx } from '../lib/dialogPaperSx'
import { formatClassLabel } from '../lib/classLabel'
import type { PaginationMeta, SchoolClass, Student } from '../types'

type Props = { onStudentsChanged?: () => void }

const emptyForm = {
  fullName: '',
  classId: '',
  rollNumber: '',
  email: '',
  phone: '',
  dateOfBirth: '',
}

function studentClassLabel(s: Student): string {
  if (s.classLabel) return s.classLabel
  const c = s.classId
  if (c && typeof c === 'object') return formatClassLabel(c)
  return '—'
}

function studentClassId(s: Student): string {
  const c = s.classId
  return typeof c === 'object' ? c._id : c
}

export function StudentSection({ onStudentsChanged }: Props) {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [classesLoading, setClassesLoading] = useState(true)

  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  /** Bumps after save so the list refetches even when `page` stays 0 */
  const [listRefresh, setListRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [classForm, setClassForm] = useState({
    classNumber: '',
    section: '',
    batchYear: String(new Date().getFullYear()),
  })
  const [classSaving, setClassSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)

  const [listSearchInput, setListSearchInput] = useState('')
  const [listSearchDebounced, setListSearchDebounced] = useState('')
  const [listClassFilter, setListClassFilter] = useState('')

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
    loadClasses()
  }, [loadClasses])

  useEffect(() => {
    const id = window.setTimeout(() => setListSearchDebounced(listSearchInput.trim()), 350)
    return () => window.clearTimeout(id)
  }, [listSearchInput])

  useEffect(() => {
    setPage(0)
  }, [listSearchDebounced, listClassFilter])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      })
      if (listSearchDebounced) params.set('search', listSearchDebounced)
      if (listClassFilter) params.set('classId', listClassFilter)
      const data = await api<{ students: Student[]; pagination: PaginationMeta }>(
        `/students?${params.toString()}`,
      )
      setStudents(Array.isArray(data.students) ? data.students : [])
      const total = data.pagination?.total ?? 0
      setTotal(total)
      const totalPages = data.pagination?.totalPages ?? 1
      if (totalPages >= 1 && page >= totalPages) {
        setPage(Math.max(0, totalPages - 1))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, listRefresh, listSearchDebounced, listClassFilter])

  useEffect(() => {
    load()
  }, [load])

  function openClassDialog() {
    setClassForm({
      classNumber: '',
      section: '',
      batchYear: String(new Date().getFullYear()),
    })
    setClassDialogOpen(true)
  }

  async function saveClass() {
    const num = parseInt(classForm.classNumber, 10)
    const year = parseInt(classForm.batchYear, 10)
    const sec = classForm.section.trim().toUpperCase()
    if (!Number.isFinite(num) || num < 1) {
      setSnackbar('Enter a valid class number')
      return
    }
    if (!/^[A-Z]{1,2}$/.test(sec)) {
      setSnackbar('Section must be 1–2 letters (A–Z)')
      return
    }
    if (!Number.isFinite(year) || year < 1990 || year > 2100) {
      setSnackbar('Enter a valid batch year')
      return
    }
    setClassSaving(true)
    try {
      const data = await api<{ schoolClass: SchoolClass }>('/classes', {
        method: 'POST',
        json: { classNumber: num, section: sec, batchYear: year },
      })
      const created = data.schoolClass
      setClasses((prev) =>
        [...prev, { ...created, label: created.label ?? formatClassLabel(created) }].sort((a, b) => {
          if (b.batchYear !== a.batchYear) return b.batchYear - a.batchYear
          if (a.classNumber !== b.classNumber) return a.classNumber - b.classNumber
          return a.section.localeCompare(b.section)
        }),
      )
      if (dialogOpen) {
        setForm((f) => ({ ...f, classId: created._id }))
      }
      setSnackbar('Class created')
      setClassDialogOpen(false)
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Could not create class')
    } finally {
      setClassSaving(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      classId: classes[0]?._id ?? '',
    })
    setDialogOpen(true)
  }

  function openEdit(s: Student) {
    setEditing(s)
    setForm({
      fullName: s.fullName,
      classId: studentClassId(s),
      rollNumber: s.rollNumber ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
    })
    setDialogOpen(true)
  }

  async function saveStudent() {
    setSaving(true)
    try {
      if (editing) {
        await api(`/students/${editing._id}`, {
          method: 'PUT',
          json: {
            fullName: form.fullName,
            classId: form.classId,
            rollNumber: form.rollNumber || undefined,
            email: form.email || undefined,
            phone: form.phone || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
          },
        })
        setSnackbar('Student updated')
      } else {
        await api('/students', {
          method: 'POST',
          json: {
            fullName: form.fullName,
            classId: form.classId,
            rollNumber: form.rollNumber || undefined,
            email: form.email || undefined,
            phone: form.phone || undefined,
            dateOfBirth: form.dateOfBirth || undefined,
          },
        })
        setSnackbar('Student added')
      }
      setDialogOpen(false)
      if (!editing) setPage(0)
      setListRefresh((n) => n + 1)
      onStudentsChanged?.()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await api(`/students/${deleteTarget._id}`, { method: 'DELETE' })
      setSnackbar('Student removed')
      setDeleteTarget(null)
      await load()
      onStudentsChanged?.()
    } catch (e) {
      setSnackbar(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  return (
    <Paper className="overflow-hidden shadow-sm" elevation={1}>
      <Box
        className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign each student to a class. Search by name, class, or roll; optionally narrow by class.
            Paginated list.
          </Typography>
        </Box>
        <Box className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={openClassDialog}
            disabled={classesLoading}
          >
            Class
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} className="shrink-0">
            Add student
          </Button>
        </Box>
      </Box>

      {classes.length === 0 && !classesLoading && (
        <Alert severity="info" className="mx-4 mt-4">
          Add a student, then use <strong>Add class</strong> in the form (or <strong>Class</strong> above) to
          create Class_#, Section, and Batch before saving.
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="m-4">
          {error}
        </Alert>
      )}

      <Box
        className="flex flex-col gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-end"
        sx={{ pt: 2, pb: 1 }}
      >
        <TextField
          size="small"
          label="Search"
          placeholder="Name, class, roll…"
          value={listSearchInput}
          onChange={(e) => setListSearchInput(e.target.value)}
          sx={{ minWidth: 220, flex: '1 1 220px' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: listSearchInput ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    edge="end"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setListSearchInput('')}
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
          valueId={listClassFilter}
          onChangeId={setListClassFilter}
          label="Class"
          allowClear
          placeholder="All classes"
          disabled={classesLoading}
          size="small"
          margin="none"
          sx={{ minWidth: 200, flex: '1 1 200px' }}
        />
      </Box>

      <TableContainer
        className="max-h-[min(420px,55vh)]"
        sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell className="hidden sm:table-cell">Roll</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading…</TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">
                    No students on this page. Use Add student and Add class in the form to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s._id} hover>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>{studentClassLabel(s)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.rollNumber ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(s)} aria-label="edit student">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(s)}
                        aria-label="delete student"
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
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
        open={classDialogOpen}
        onClose={() => !classSaving && setClassDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: compactDialogPaperSx } }}
      >
        <DialogTitleWithClose
          onClose={() => !classSaving && setClassDialogOpen(false)}
          disabled={classSaving}
        >
          New class
        </DialogTitleWithClose>
        <DialogContent className="flex flex-col gap-2 pt-2">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Stored as <strong>Class_</strong> (number), <strong>Section</strong> (A–Z),{' '}
            <strong>Batch</strong> (year) — e.g. Class_10, Section A, Batch 2026.
          </Typography>
          <TextField
            label="Class number"
            required
            fullWidth
            margin="dense"
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
            placeholder="10"
            value={classForm.classNumber}
            onChange={(e) => setClassForm((f) => ({ ...f, classNumber: e.target.value }))}
          />
          <TextField
            label="Section (letter)"
            required
            fullWidth
            margin="dense"
            placeholder="A"
            slotProps={{ htmlInput: { maxLength: 2 } }}
            value={classForm.section}
            onChange={(e) =>
              setClassForm((f) => ({
                ...f,
                section: e.target.value.toUpperCase().replace(/[^A-Za-z]/g, ''),
              }))
            }
          />
          <TextField
            label="Batch year"
            required
            fullWidth
            margin="dense"
            type="number"
            slotProps={{ htmlInput: { min: 1990, max: 2100 } }}
            value={classForm.batchYear}
            onChange={(e) => setClassForm((f) => ({ ...f, batchYear: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassDialogOpen(false)} disabled={classSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveClass} disabled={classSaving}>
            {classSaving ? 'Saving…' : 'Create class'}
          </Button>
        </DialogActions>
      </Dialog>

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
          {editing ? 'Edit student' : 'New student'}
        </DialogTitleWithClose>
        <DialogContent
          className="flex flex-col gap-2 pt-2"
          sx={{ overflowY: 'auto', maxHeight: { xs: 'calc(100dvh - 200px)', sm: 'none' } }}
        >
          <TextField
            label="Full name"
            required
            fullWidth
            margin="dense"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          />
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
            <ClassAutocomplete
              classes={classes}
              valueId={form.classId}
              onChangeId={(id) => setForm((f) => ({ ...f, classId: id }))}
              label="Class"
              required
              disabled={classesLoading}
              placeholder={
                classes.length === 0
                  ? 'Add a class with + — or search when classes exist'
                  : 'Open and type to search classes…'
              }
              margin="dense"
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Tooltip title="Add class">
              <span>
                <Button
                  variant="outlined"
                  aria-label="Add class"
                  disabled={classesLoading}
                  onClick={openClassDialog}
                  sx={(theme) => ({
                    flexShrink: 0,
                    alignSelf: 'flex-end',
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    p: 0,
                    borderRadius: `${theme.shape.borderRadius}px`,
                    borderColor: alpha(theme.palette.text.primary, 0.23),
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: alpha(theme.palette.text.primary, 0.87),
                      backgroundColor: alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
                    },
                  })}
                >
                  <AddIcon fontSize="small" />
                </Button>
              </span>
            </Tooltip>
          </Box>
          <TextField
            label="Roll number"
            fullWidth
            margin="dense"
            value={form.rollNumber}
            onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <TextField
            label="Date of birth"
            type="date"
            fullWidth
            margin="dense"
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.dateOfBirth}
            onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveStudent}
            disabled={saving || !form.fullName.trim() || !form.classId}
          >
            {saving ? 'Saving…' : 'Save'}
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
          Delete student?
        </DialogTitleWithClose>
        <DialogContent>
          <Typography>
            This will remove <strong>{deleteTarget?.fullName}</strong> and all tasks assigned to them.
          </Typography>
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
