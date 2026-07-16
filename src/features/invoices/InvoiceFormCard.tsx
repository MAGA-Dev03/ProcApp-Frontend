import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { checkDuplicateInvoiceNumber } from '@/api/client'
import type { InvoiceWithRelations } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ComboboxField,
  CurrencyField,
  DatePickerField,
  FileUploadField,
  SelectField,
  TextField,
  TextareaField,
  type ComboboxOption,
} from '@/components/form'
import { useHasRole } from '@/features/auth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'
import {
  EMPTY_INVOICE_FORM_VALUES,
  FREEZABLE_FIELDS,
  INVOICE_SOURCE_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  invoiceFormSchema,
  type FreezableField,
  type InvoiceFormValues,
} from './invoiceFormSchema'

function attachmentFileName(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() ?? url)
  } catch {
    return url
  }
}

function invoiceToFormValues(invoice: InvoiceWithRelations): InvoiceFormValues {
  return {
    invoiceType: invoice.invoiceType,
    invoiceSource: invoice.invoiceSource,
    projectId: String(invoice.projectId),
    supplierId: String(invoice.supplierId),
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    receivedDate: invoice.receivedDate,
    purchaseOrderNumber: invoice.purchaseOrderNumber,
    value: invoice.value,
    pioNumber: invoice.pioNumber,
    grnNumber: invoice.grnNumber ?? '',
    grnReceivedDate: invoice.grnReceivedDate ?? '',
    attachment: null,
    remarks: invoice.remarks ?? '',
  }
}

function FreezeToggle({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
      <Checkbox
        checked={active}
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="size-3.5"
      />
      Keep for next entry
    </label>
  )
}

interface InvoiceFormCardProps {
  mode: 'create' | 'edit'
  invoice?: InvoiceWithRelations
  projectOptions: ComboboxOption[]
  supplierOptions: ComboboxOption[]
  onSubmit: (values: InvoiceFormValues, attachmentRemoved: boolean) => Promise<void>
  onCancelEdit?: () => void
  isSubmitting?: boolean
}

/** Keyed by invoice id at the call site so switching invoices (or entering/leaving edit mode)
 * remounts this fresh instead of syncing via an effect. */
function InvoiceForm({
  mode,
  invoice,
  projectOptions,
  supplierOptions,
  onSubmit,
  onCancelEdit,
  isSubmitting,
}: InvoiceFormCardProps) {
  const isProcurementManager = useHasRole('PROCUREMENT_MANAGER')
  const [isOpen, setIsOpen] = useState(mode === 'edit')
  const [frozenFields, setFrozenFields] = useState<Set<FreezableField>>(new Set())
  const [attachmentRemoved, setAttachmentRemoved] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues:
      mode === 'edit' && invoice ? invoiceToFormValues(invoice) : EMPTY_INVOICE_FORM_VALUES,
  })

  const supplierId = watch('supplierId')
  const invoiceNumber = watch('invoiceNumber')
  const invoiceDate = watch('invoiceDate')
  const receivedDate = watch('receivedDate')

  const debouncedInvoiceNumber = useDebouncedValue(invoiceNumber, 400)

  const { data: duplicateCheck } = useQuery({
    queryKey: ['invoices', 'duplicate-check', supplierId, debouncedInvoiceNumber, invoice?.id],
    queryFn: () =>
      checkDuplicateInvoiceNumber({
        supplierId: Number(supplierId),
        invoiceNumber: debouncedInvoiceNumber,
        excludeInvoiceId: invoice?.id,
      }),
    enabled: Boolean(supplierId) && debouncedInvoiceNumber.trim().length >= 2,
  })

  const receivedBeforeInvoice = invoiceDate && receivedDate ? receivedDate < invoiceDate : false

  async function handleFormSubmit(values: InvoiceFormValues) {
    await onSubmit(values, attachmentRemoved)

    if (mode === 'create') {
      const current = getValues()
      const preserved: Partial<InvoiceFormValues> = {}
      for (const field of FREEZABLE_FIELDS) {
        if (frozenFields.has(field)) {
          ;(preserved as Record<string, unknown>)[field] = current[field]
        }
      }
      reset({ ...EMPTY_INVOICE_FORM_VALUES, ...preserved })
      setAttachmentRemoved(false)
    }
  }

  function toggleFrozen(field: FreezableField, checked: boolean) {
    setFrozenFields((prev) => {
      const next = new Set(prev)
      if (checked) next.add(field)
      else next.delete(field)
      return next
    })
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <button type="button" className="flex w-full items-center justify-between text-left">
              <CardTitle>{mode === 'edit' ? 'Edit Invoice' : 'Add Invoice'}</CardTitle>
              <ChevronDown
                className={cn('size-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
              />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('invoiceType')}
                      onToggle={(v) => toggleFrozen('invoiceType', v)}
                    />
                  </div>
                  <SelectField
                    control={control}
                    name="invoiceType"
                    label="Invoice Type"
                    options={INVOICE_TYPE_OPTIONS}
                    placeholder="Select a type"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('invoiceSource')}
                      onToggle={(v) => toggleFrozen('invoiceSource', v)}
                    />
                  </div>
                  <SelectField
                    control={control}
                    name="invoiceSource"
                    label="Invoice Source"
                    options={INVOICE_SOURCE_OPTIONS}
                    placeholder="Select a source"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('projectId')}
                      onToggle={(v) => toggleFrozen('projectId', v)}
                    />
                  </div>
                  <ComboboxField
                    control={control}
                    name="projectId"
                    label="Project"
                    options={projectOptions}
                    placeholder="Select a project"
                    searchPlaceholder="Search projects…"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('supplierId')}
                      onToggle={(v) => toggleFrozen('supplierId', v)}
                    />
                  </div>
                  <ComboboxField
                    control={control}
                    name="supplierId"
                    label="Supplier"
                    options={supplierOptions}
                    placeholder="Select a supplier"
                    searchPlaceholder="Search suppliers…"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <TextField control={control} name="invoiceNumber" label="Invoice No" required />
                  {duplicateCheck?.isDuplicate && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      This looks like a duplicate - invoice #{debouncedInvoiceNumber} already exists
                      for this supplier.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('invoiceDate')}
                      onToggle={(v) => toggleFrozen('invoiceDate', v)}
                    />
                  </div>
                  <DatePickerField
                    control={control}
                    name="invoiceDate"
                    label="Invoice Date"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-end">
                    <FreezeToggle
                      active={frozenFields.has('receivedDate')}
                      onToggle={(v) => toggleFrozen('receivedDate', v)}
                    />
                  </div>
                  <DatePickerField
                    control={control}
                    name="receivedDate"
                    label="Received Date"
                    required
                  />
                  {receivedBeforeInvoice && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Received date is before the invoice date - double-check this is correct.
                    </p>
                  )}
                </div>

                <TextField
                  control={control}
                  name="purchaseOrderNumber"
                  label="PO Number"
                  required
                />
                <CurrencyField control={control} name="value" label="Value" required />
                <TextField control={control} name="pioNumber" label="PIO No" required />
                <TextField control={control} name="grnNumber" label="GRN No" />
                <DatePickerField
                  control={control}
                  name="grnReceivedDate"
                  label="GRN Received Date"
                />

                <FileUploadField
                  control={control}
                  name="attachment"
                  label="Attachment"
                  existingFileName={
                    !attachmentRemoved && invoice?.attachmentUrl
                      ? attachmentFileName(invoice.attachmentUrl)
                      : null
                  }
                  onRemoveExisting={() => setAttachmentRemoved(true)}
                />

                {isProcurementManager && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <TextareaField
                      control={control}
                      name="remarks"
                      label="Remarks"
                      placeholder="Optional notes (Procurement Manager only)"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Please fix the highlighted fields and try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Invoice'}
                </Button>
                {mode === 'edit' && onCancelEdit && (
                  <Button type="button" variant="outline" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function InvoiceFormCard(props: InvoiceFormCardProps) {
  return <InvoiceForm key={props.invoice?.id ?? 'create'} {...props} />
}
