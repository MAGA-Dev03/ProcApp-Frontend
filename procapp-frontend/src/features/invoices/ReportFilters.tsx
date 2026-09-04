import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { ComboboxOption } from '@/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { INVOICE_SOURCE_OPTIONS, INVOICE_TYPE_OPTIONS } from './invoiceFormSchema'

const ALL_VALUE = '__all__'

const DATE_TYPE_OPTIONS = [
  { value: 'invoiceDate', label: 'Invoice Date' },
  { value: 'receivedDate', label: 'Received Date' },
  { value: 'grnReceivedDate', label: 'GRN Received Date' },
  { value: 'financeSubmitDate', label: 'Finance Submit Date' },
]

const STATUS_OPTIONS = [
  { value: 'NOT_SUBMITTED', label: 'Not Submitted' },
  { value: 'GRN_PENDING', label: 'GRN Pending' },
  { value: 'GRN_RECEIVED', label: 'GRN Received' },
  { value: 'SUBMITTED', label: 'Submitted' },
]

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Cancelled' },
]

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  width = 'w-44',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder: string
  width?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || ALL_VALUE} onValueChange={(v) => onChange(v === ALL_VALUE ? '' : v)}>
        <SelectTrigger id={id} className={width}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ListNoFilter({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <div className="space-y-1.5">
      <Label htmlFor="filter-list-no">List No</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="filter-list-no"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-48 justify-between font-normal"
          >
            <span className={cn('truncate', !selected && 'text-muted-foreground')}>
              {selected ? selected.label : 'All list numbers'}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder="Search list numbers…" />
            <CommandList>
              <CommandEmpty>No list numbers found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="All list numbers"
                  onSelect={() => {
                    onChange('')
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 size-4', !value ? 'opacity-100' : 'opacity-0')} />
                  All list numbers
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        option.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export interface ReportFiltersValue {
  invoiceType: string
  invoiceSource: string
  projectId: string
  supplierId: string
  month: string
  dateType: string
  dateExact: string
  reportStatus: string
  active: string
  listNo: string
}

interface ReportFiltersProps {
  value: ReportFiltersValue
  onChange: (value: ReportFiltersValue) => void
  projectOptions: ComboboxOption[]
  supplierOptions: ComboboxOption[]
  listNoOptions: ComboboxOption[]
}

export function ReportFilters({
  value,
  onChange,
  projectOptions,
  supplierOptions,
  listNoOptions,
}: ReportFiltersProps) {
  function set<K extends keyof ReportFiltersValue>(key: K, next: ReportFiltersValue[K]) {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        id="filter-type"
        label="Type"
        value={value.invoiceType}
        onChange={(v) => set('invoiceType', v)}
        options={INVOICE_TYPE_OPTIONS}
        placeholder="All types"
        width="w-36"
      />
      <FilterSelect
        id="filter-source"
        label="Source"
        value={value.invoiceSource}
        onChange={(v) => set('invoiceSource', v)}
        options={INVOICE_SOURCE_OPTIONS}
        placeholder="All sources"
        width="w-36"
      />
      <FilterSelect
        id="filter-project"
        label="Project"
        value={value.projectId}
        onChange={(v) => set('projectId', v)}
        options={projectOptions}
        placeholder="All projects"
      />
      <FilterSelect
        id="filter-supplier"
        label="Supplier"
        value={value.supplierId}
        onChange={(v) => set('supplierId', v)}
        options={supplierOptions}
        placeholder="All suppliers"
      />

      <div className="space-y-1.5">
        <Label htmlFor="filter-month">Received in</Label>
        <Input
          id="filter-month"
          type="month"
          className="w-40"
          value={value.month}
          onChange={(event) => set('month', event.target.value)}
        />
      </div>

      <div className="flex items-end gap-1.5">
        <FilterSelect
          id="filter-date-type"
          label="Date Type"
          value={value.dateType}
          onChange={(v) => set('dateType', v || 'invoiceDate')}
          options={DATE_TYPE_OPTIONS}
          placeholder="Invoice Date"
          width="w-40"
        />
        <div className="space-y-1.5">
          <Label htmlFor="filter-date-exact">On date</Label>
          <Input
            id="filter-date-exact"
            type="date"
            className="w-40"
            value={value.dateExact}
            onChange={(event) => set('dateExact', event.target.value)}
          />
        </div>
      </div>

      <FilterSelect
        id="filter-status"
        label="Status"
        value={value.reportStatus}
        onChange={(v) => set('reportStatus', v)}
        options={STATUS_OPTIONS}
        placeholder="All statuses"
      />
      <FilterSelect
        id="filter-active"
        label="Active/Cancelled"
        value={value.active}
        onChange={(v) => set('active', v)}
        options={ACTIVE_OPTIONS}
        placeholder="All"
      />
      <ListNoFilter
        value={value.listNo}
        onChange={(v) => set('listNo', v)}
        options={listNoOptions}
      />
    </div>
  )
}
