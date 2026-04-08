import { useEffect, useMemo, useState } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { formatClassLabel } from '../lib/classLabel'
import { api } from '../lib/api'
import type { SchoolClass } from '../types'

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(t)
  }, [value, ms])
  return debounced
}

type Props = {
  /** Full list from parent when search is empty; also used to resolve the selected option. */
  classes: SchoolClass[]
  valueId: string
  onChangeId: (id: string) => void
  label: string
  disabled?: boolean
  allowClear?: boolean
  required?: boolean
  placeholder?: string
  size?: 'small' | 'medium'
  margin?: 'dense' | 'normal' | 'none'
  fullWidth?: boolean
  noOptionsText?: string
  sx?: SxProps<Theme>
}

export function ClassAutocomplete({
  classes,
  valueId,
  onChangeId,
  label,
  disabled,
  allowClear,
  required,
  placeholder,
  size = 'small',
  margin = 'dense',
  fullWidth = true,
  noOptionsText = 'No matching class',
  sx,
}: Props) {
  /** Drives server search only (Autocomplete input stays uncontrolled for typing UX). */
  const [searchDraft, setSearchDraft] = useState('')
  const debouncedSearch = useDebouncedValue(searchDraft, 320)
  const [options, setOptions] = useState<SchoolClass[]>(classes)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    setSearchDraft('')
  }, [valueId])

  const value = useMemo(() => {
    if (!valueId) return null
    return (
      classes.find((c) => c._id === valueId) ??
      options.find((c) => c._id === valueId) ??
      null
    )
  }, [valueId, classes, options])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setOptions(classes)
      setFetchError(null)
    }
  }, [classes, debouncedSearch])

  useEffect(() => {
    const q = debouncedSearch.trim()
    if (!q) return

    let cancelled = false
    setLoading(true)
    setFetchError(null)
    const params = new URLSearchParams({ search: q })
    api<{ classes: SchoolClass[] }>(`/classes?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setOptions(Array.isArray(data.classes) ? data.classes : [])
      })
      .catch((e) => {
        if (!cancelled) {
          setOptions([])
          setFetchError(e instanceof Error ? e.message : 'Search failed')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  const mergedOptions = useMemo(() => {
    if (!value) return options
    if (options.some((o) => o._id === value._id)) return options
    return [value, ...options]
  }, [options, value])

  const emptyHint = classes.length === 0 ? 'No classes yet — add one first' : noOptionsText

  return (
    <Autocomplete<SchoolClass, false, boolean, false>
      key={valueId || '__none__'}
      sx={sx}
      options={mergedOptions}
      value={value}
      onChange={(_, newVal) => {
        onChangeId(newVal?._id ?? '')
        setSearchDraft('')
      }}
      onInputChange={(_, _v, reason) => {
        if (reason === 'input') setSearchDraft(_v)
        else if (reason === 'clear') setSearchDraft('')
      }}
      getOptionLabel={(c) => c.label ?? formatClassLabel(c)}
      isOptionEqualToValue={(a, b) => a._id === b._id}
      disabled={disabled}
      disableClearable={!allowClear}
      loading={loading}
      filterOptions={(opts) => opts}
      clearOnEscape
      noOptionsText={fetchError ?? emptyHint}
      slotProps={{
        listbox: {
          sx: { maxHeight: 280 },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          margin={margin}
          size={size}
          fullWidth={fullWidth}
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              autoComplete: 'off',
            },
          }}
        />
      )}
    />
  )
}
