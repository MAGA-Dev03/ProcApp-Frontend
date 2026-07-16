import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getAgingBuckets,
  getReceivedVsSubmittedTrend,
  getTopSuppliersByPayable,
  type AgingBucketKey,
} from '@/api/client'
import { PageHeader } from '@/components/PageHeader'
import { AgingBucketChart } from './AgingBucketChart'
import { AgingBucketDrilldownModal } from './AgingBucketDrilldownModal'
import { ChartCard } from './ChartCard'
import { ReceivedVsSubmittedTrend } from './ReceivedVsSubmittedTrend'
import { TopSuppliersDonut } from './TopSuppliersDonut'

export function DashboardPage() {
  const [selectedBucket, setSelectedBucket] = useState<AgingBucketKey | null>(null)

  const agingQuery = useQuery({
    queryKey: ['dashboard', 'aging-buckets'],
    queryFn: getAgingBuckets,
  })
  const suppliersQuery = useQuery({
    queryKey: ['dashboard', 'top-suppliers'],
    queryFn: () => getTopSuppliersByPayable(10),
  })
  const trendQuery = useQuery({
    queryKey: ['dashboard', 'received-vs-submitted'],
    queryFn: getReceivedVsSubmittedTrend,
  })

  const agingIsEmpty = agingQuery.data?.every((bucket) => bucket.invoiceCount === 0) ?? false
  const trendIsEmpty =
    trendQuery.data?.every((point) => point.receivedValue === 0 && point.submittedValue === 0) ??
    false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Outstanding receivables at a glance - aging, top suppliers by payable, and submission trend."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartCard
            title="Outstanding Invoices by Age"
            description="Click a bar to see which suppliers and projects make up that bucket."
            isLoading={agingQuery.isLoading}
            isError={agingQuery.isError}
            isEmpty={agingIsEmpty}
            emptyTitle="Nothing outstanding"
            emptyDescription="Every invoice has been submitted to finance or cancelled."
          >
            {agingQuery.data && (
              <AgingBucketChart data={agingQuery.data} onBucketClick={setSelectedBucket} />
            )}
          </ChartCard>
        </div>

        <div className="min-w-0">
          <ChartCard
            title="Top 10 Suppliers by Outstanding Payable"
            isLoading={suppliersQuery.isLoading}
            isError={suppliersQuery.isError}
            isEmpty={(suppliersQuery.data?.length ?? 0) === 0}
            emptyTitle="No outstanding payables"
            height={340}
          >
            {suppliersQuery.data && <TopSuppliersDonut data={suppliersQuery.data} />}
          </ChartCard>
        </div>
      </div>

      <ChartCard
        title="Received vs Submitted"
        description="Trailing 12 months, by invoice value."
        isLoading={trendQuery.isLoading}
        isError={trendQuery.isError}
        isEmpty={trendIsEmpty}
        emptyTitle="No trend data yet"
        height={300}
      >
        {trendQuery.data && <ReceivedVsSubmittedTrend data={trendQuery.data} />}
      </ChartCard>

      <AgingBucketDrilldownModal
        bucket={selectedBucket}
        onOpenChange={(open) => !open && setSelectedBucket(null)}
      />
    </div>
  )
}
