import { downloadInvoiceAttachment, downloadSiteKeeperAttachment } from '@/api/client'

function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  // Revoke after a delay so the new tab has time to load it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/** Fetches an invoice attachment (the endpoint needs the bearer token, so a
 * plain <a href> can't reach it) and opens it in a new browser tab. */
export async function openInvoiceAttachment(invoiceId: number): Promise<void> {
  openBlobInNewTab(await downloadInvoiceAttachment(invoiceId))
}

/** Site-keeper variant, scoped to the keeper's assigned projects server-side. */
export async function openSiteKeeperAttachment(invoiceId: number): Promise<void> {
  openBlobInNewTab(await downloadSiteKeeperAttachment(invoiceId))
}
