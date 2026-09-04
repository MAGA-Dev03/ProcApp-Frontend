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

const ALL_VALUE = '__all__'

interface InvoicesFiltersProps {
  projectOptions: ComboboxOption[]
  supplierOptions: ComboboxOption[]
  projectId: string
  onProjectIdChange: (value: string) => void
  supplierId: string
  onSupplierIdChange: (value: string) => void
  month: string
  onMonthChange: (value: string) => void
}

export function InvoicesFilters({
  projectOptions,
  supplierOptions,
  projectId,
  onProjectIdChange,
  supplierId,
  onSupplierIdChange,
  month,
  onMonthChange,
}: InvoicesFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="filter-project">Project</Label>
        <Select
          value={projectId || ALL_VALUE}
          onValueChange={(value) => onProjectIdChange(value === ALL_VALUE ? '' : value)}
        >
          <SelectTrigger id="filter-project" className="w-48">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All projects</SelectItem>
            {projectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-supplier">Supplier</Label>
        <Select
          value={supplierId || ALL_VALUE}
          onValueChange={(value) => onSupplierIdChange(value === ALL_VALUE ? '' : value)}
        >
          <SelectTrigger id="filter-supplier" className="w-48">
            <SelectValue placeholder="All suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All suppliers</SelectItem>
            {supplierOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-month">Received in</Label>
        <Input
          id="filter-month"
          type="month"
          className="w-40"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </div>
    </div>
  )
}
