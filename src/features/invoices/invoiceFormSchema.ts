import { z } from 'zod'

export const INVOICE_TYPE_OPTIONS = [
  { value: 'CREDIT', label: 'Credit' },
  { value: 'ADVANCE', label: 'Advance' },
  { value: 'LC', label: 'Letter of Credit' },
]

export const INVOICE_SOURCE_OPTIONS = [
  { value: 'DIRECT', label: 'Direct' },
  { value: 'STORES', label: 'Stores' },
  { value: 'PROJECT', label: 'Project' },
]

export const invoiceFormSchema = z.object({
  invoiceType: z.string().min(1, 'Select an invoice type'),
  invoiceSource: z.string().min(1, 'Select an invoice source'),
  projectId: z.string().min(1, 'Select a project'),
  supplierId: z.string().min(1, 'Select a supplier'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  receivedDate: z.string().min(1, 'Received date is required'),
  purchaseOrderNumber: z.string().min(1, 'PO number is required'),
  value: z
    .number()
    .optional()
    .refine((v) => v !== undefined, { message: 'Value is required' })
    .refine((v) => v === undefined || v > 0, { message: 'Value must be greater than zero' }),
  pioNumber: z.string().min(1, 'PIO number is required'),
  grnNumber: z.string().optional(),
  grnReceivedDate: z.string().optional(),
  attachment: z.instanceof(File).nullable().optional(),
  remarks: z.string().optional(),
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

export const FREEZABLE_FIELDS = [
  'invoiceType',
  'invoiceSource',
  'projectId',
  'supplierId',
  'invoiceDate',
  'receivedDate',
] as const satisfies ReadonlyArray<keyof InvoiceFormValues>

export type FreezableField = (typeof FREEZABLE_FIELDS)[number]

export const EMPTY_INVOICE_FORM_VALUES: InvoiceFormValues = {
  invoiceType: '',
  invoiceSource: '',
  projectId: '',
  supplierId: '',
  invoiceNumber: '',
  invoiceDate: '',
  receivedDate: '',
  purchaseOrderNumber: '',
  value: undefined,
  pioNumber: '',
  grnNumber: '',
  grnReceivedDate: '',
  attachment: null,
  remarks: '',
}
