import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Clipboard, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { listInvoicesForSiteKeeper, listSuppliers, markAttachmentViewed } from '@/api/client'
import type { InvoiceWithRelations } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { InvoicesFilters } from '@/features/invoices/InvoicesFilters'
import {
  copyRowsToClipboard,
  exportRowsToCsv,
  exportRowsToExcel,
  printRows,
  toReportRow,
} from '@/features/invoices/reportExport'
import { createSiteKeeperColumns } from './siteKeeperColumns'

const PAGE_SIZE = 10

function monthToRange(month: string): { from: string; to: string } | null {
  if (!month) return null
  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` }
}

export function SiteKeeperPage() {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [projectFilter, setProjectFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const debouncedMonth = useDebouncedValue(monthFilter, 300)
  const [pageIndex, setPageIndex] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // Scoped to what this user can see: allProjects users get the full list, everyone else only
  // sees the projects already resolved onto their own user record (their real scope, not a
  // client-editable filter) - the same scope the mock API enforces server-side below.
  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => listSuppliers({ size: 100 }),
  })
  const projectOptions = useMemo(
    () => (currentUser?.projects ?? []).map((p) => ({ value: String(p.id), label: p.name })),
    [currentUser],
  )
  const supplierOptions = useMemo(
    () => (suppliersQuery.data?.content ?? []).map((s) => ({ value: String(s.id), label: s.name })),
    [suppliersQuery.data],
  )

  const monthRange = monthToRange(debouncedMonth)

  const invoicesQuery = useQuery({
    queryKey: [
      'invoices',
      'site-keeper',
      currentUser?.id,
      { projectFilter, supplierFilter, monthRange, pageIndex },
    ],
    queryFn: () =>
      listInvoicesForSiteKeeper(currentUser!.id, {
        projectId: projectFilter ? Number(projectFilter) : undefined,
        supplierId: supplierFilter ? Number(supplierFilter) : undefined,
        receivedDateFrom: monthRange?.from,
        receivedDateTo: monthRange?.to,
        page: pageIndex,
        size: PAGE_SIZE,
      }),
    enabled: Boolean(currentUser),
    placeholderData: (previous) => previous,
  })

  const markViewedMutation = useMutation({
    mutationFn: (invoice: InvoiceWithRelations) =>
      markAttachmentViewed(invoice.id, currentUser!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'site-keeper'] })
    },
  })

  const columns = useMemo(
    () => createSiteKeeperColumns((invoice) => markViewedMutation.mutate(invoice)),
    [markViewedMutation],
  )

  async function fetchAllFilteredRows() {
    const page = await listInvoicesForSiteKeeper(currentUser!.id, {
      projectId: projectFilter ? Number(projectFilter) : undefined,
      supplierId: supplierFilter ? Number(supplierFilter) : undefined,
      receivedDateFrom: monthRange?.from,
      receivedDateTo: monthRange?.to,
      page: 0,
      size: 5000,
    })
    return page.content.map(toReportRow)
  }

  async function handleExport(kind: 'copy' | 'csv' | 'excel' | 'print') {
    setIsExporting(true)
    try {
      const rows = await fetchAllFilteredRows()
      if (rows.length === 0) {
        toast.error('No rows match the current filters.')
        return
      }
      if (kind === 'copy') {
        await copyRowsToClipboard(rows)
        toast.success(`Copied ${rows.length} rows to clipboard`)
      } else if (kind === 'csv') {
        exportRowsToCsv(rows)
      } else if (kind === 'excel') {
        exportRowsToExcel(rows)
      } else {
        printRows(rows)
      }
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Store Keeper"
        description={
          currentUser?.allProjects
            ? 'Invoices across all projects.'
            : 'Invoices for your assigned projects.'
        }
      />

      <div className="space-y-4">
        <InvoicesFilters
          projectOptions={projectOptions}
          supplierOptions={supplierOptions}
          projectId={projectFilter}
          onProjectIdChange={(value) => {
            setProjectFilter(value)
            setPageIndex(0)
          }}
          supplierId={supplierFilter}
          onSupplierIdChange={(value) => {
            setSupplierFilter(value)
            setPageIndex(0)
          }}
          month={monthFilter}
          onMonthChange={(value) => {
            setMonthFilter(value)
            setPageIndex(0)
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport('copy')}
          >
            <Clipboard className="size-4" /> Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport('csv')}
          >
            <FileText className="size-4" /> CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={() => handleExport('print')}
          >
            <Printer className="size-4" /> Print
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={invoicesQuery.data?.content ?? []}
          rowCount={invoicesQuery.data?.totalElements ?? 0}
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          onPageChange={setPageIndex}
          getRowId={(row) => String(row.id)}
          isLoading={invoicesQuery.isLoading}
          isError={invoicesQuery.isError}
          emptyMessage="No invoices found for your projects."
        />
      </div>
    </div>
  )
}
