import { ROLE_NAMES, type Role } from '@/types/role'
import type { User } from '@/types/user'
import type { Project } from '@/types/project'
import type { Supplier } from '@/types/supplier'
import type { Invoice, InvoiceSource, InvoiceType } from '@/types/invoice'
import { addDays, daysAgo, randomInt, randomItem, toIsoDate } from './utils'

export function buildRoles(): Role[] {
  return ROLE_NAMES.map((name, index) => ({ id: index + 1, name }))
}

const roleIdByName = (roles: Role[], name: (typeof ROLE_NAMES)[number]) =>
  roles.find((role) => role.name === name)!.id

export function buildUsers(roles: Role[]): User[] {
  const byName = (name: (typeof ROLE_NAMES)[number]) => roleIdByName(roles, name)
  const roleById = (id: number) => roles.find((role) => role.id === id)!

  const raw: Array<{
    name: string
    email: string
    allProjects: boolean
    active: boolean
    roleIds: number[]
  }> = [
    {
      name: 'Anushka Perera',
      email: 'anushka.perera@maga.lk',
      allProjects: true,
      active: true,
      roleIds: [byName('ADMIN')],
    },
    {
      name: 'Priyanka Jayawardena',
      email: 'priyanka.jayawardena@maga.lk',
      allProjects: false,
      active: true,
      roleIds: [byName('PROCUREMENT')],
    },
    {
      name: 'Nadeesha Silva',
      email: 'nadeesha.silva@maga.lk',
      allProjects: false,
      active: true,
      roleIds: [byName('PROCUREMENT'), byName('PROCUREMENT_MANAGER')],
    },
    {
      name: 'Kasun Rathnayake',
      email: 'kasun.rathnayake@maga.lk',
      allProjects: true,
      active: true,
      roleIds: [byName('PROCUREMENT_MANAGER')],
    },
    {
      name: 'Ruwan Fernando',
      email: 'ruwan.fernando@maga.lk',
      allProjects: true,
      active: true,
      roleIds: [byName('SENIOR_MANAGER')],
    },
    {
      name: 'Chamari Gunawardena',
      email: 'chamari.gunawardena@maga.lk',
      allProjects: true,
      active: true,
      roleIds: [byName('REPORT_USER')],
    },
    {
      name: 'Sunil Bandara',
      email: 'sunil.bandara@maga.lk',
      allProjects: false,
      active: true,
      roleIds: [byName('SITE_STORE_KEEPER')],
    },
    {
      name: 'Dilani Wickramasinghe',
      email: 'dilani.wickramasinghe@maga.lk',
      allProjects: false,
      active: false,
      roleIds: [byName('SITE_STORE_KEEPER'), byName('REPORT_USER')],
    },
    {
      // Demo/testing convenience only - no real employee holds every role at once. Named and
      // emailed so it's unmistakably a test account, not a real hire.
      name: 'Test SuperAdmin',
      email: 'superadmin@maga.lk',
      allProjects: true,
      active: true,
      roleIds: [
        byName('ADMIN'),
        byName('PROCUREMENT'),
        byName('PROCUREMENT_MANAGER'),
        byName('REPORT_USER'),
        byName('SITE_STORE_KEEPER'),
        byName('SENIOR_MANAGER'),
      ],
    },
  ]

  return raw.map((entry, index) => ({
    id: index + 1,
    name: entry.name,
    email: entry.email,
    allProjects: entry.allProjects,
    active: entry.active,
    createdAt: toIsoDate(daysAgo(randomInt(200, 900))),
    roles: entry.roleIds.map(roleById),
  }))
}

const PROJECT_DEFS: Array<{ name: string; status: Project['status']; contractRef: string }> = [
  { name: 'Colombo City Tower Phase 1', status: 'WORKING', contractRef: 'MAGA/CTR/2023/101' },
  { name: 'Kandy Multi-Complex Development', status: 'WORKING', contractRef: 'MAGA/CTR/2023/102' },
  { name: 'Galle Face Residencies', status: 'WORKING', contractRef: 'MAGA/CTR/2024/103' },
  { name: 'Negombo Beach Resort', status: 'WORKING', contractRef: 'MAGA/CTR/2024/104' },
  { name: 'Kurunegala Industrial Park', status: 'WORKING', contractRef: 'MAGA/CTR/2023/105' },
  { name: 'Jaffna Cultural Center', status: 'WORKING', contractRef: 'MAGA/CTR/2024/106' },
  { name: 'Ella Hillside Villas', status: 'WORKING', contractRef: 'MAGA/CTR/2024/107' },
  { name: 'Batticaloa Port Expansion', status: 'WORKING', contractRef: 'MAGA/CTR/2023/108' },
  { name: 'Anuradhapura Heritage Museum', status: 'WORKING', contractRef: 'MAGA/CTR/2024/109' },
  { name: 'Trincomalee Naval Housing', status: 'WORKING', contractRef: 'MAGA/CTR/2023/110' },
  { name: 'Ratnapura Gem Market Complex', status: 'WORKING', contractRef: 'MAGA/CTR/2024/111' },
  { name: 'Matara Southern Expressway Depot', status: 'WORKING', contractRef: 'MAGA/CTR/2024/112' },
  {
    name: 'Nuwara Eliya Tea Factory Renovation',
    status: 'FINISHED',
    contractRef: 'MAGA/CTR/2022/113',
  },
  { name: 'Hambantota Logistics Hub', status: 'FINISHED', contractRef: 'MAGA/CTR/2022/114' },
  { name: 'Polonnaruwa Irrigation Office', status: 'FINISHED', contractRef: 'MAGA/CTR/2021/115' },
]

export function buildProjects(): Project[] {
  return PROJECT_DEFS.map((def, index) => ({
    id: index + 1,
    code: `MAG0001${String(index + 1).padStart(2, '0')}`,
    name: def.name,
    status: def.status,
    contractName: def.contractRef,
  }))
}

const SUPPLIER_DEFS: Array<{ name: string; email: string; address: string; contact: string }> = [
  {
    name: 'Lanka Hardware (Pvt) Ltd',
    email: 'sales@lankahardware.lk',
    address: 'No. 45, Baseline Road, Colombo 09',
    contact: '011-2345001',
  },
  {
    name: 'Ceylon Steel Corporation',
    email: 'orders@ceylonsteel.lk',
    address: 'No. 12, Industrial Estate, Ekala',
    contact: '011-2345002',
  },
  {
    name: 'Colombo Cement Traders',
    email: 'info@colombocement.lk',
    address: 'No. 78, Grandpass Road, Colombo 14',
    contact: '011-2345003',
  },
  {
    name: 'Kandy Electrical Supplies',
    email: 'sales@kandyelectrical.lk',
    address: 'No. 23, Peradeniya Road, Kandy',
    contact: '081-2233004',
  },
  {
    name: 'Southern Timber Mills',
    email: 'contact@southerntimber.lk',
    address: 'No. 9, Matara Road, Galle',
    contact: '091-2233005',
  },
  {
    name: 'Horana Sand & Metal Suppliers',
    email: 'info@horanasand.lk',
    address: 'No. 5, Panadura Road, Horana',
    contact: '034-2233006',
  },
  {
    name: 'Nawaloka Plumbing Solutions',
    email: 'sales@nawalokaplumbing.lk',
    address: 'No. 66, Union Place, Colombo 02',
    contact: '011-2345007',
  },
  {
    name: 'Galle Paints & Coatings',
    email: 'orders@gallepaints.lk',
    address: 'No. 31, Wakwella Road, Galle',
    contact: '091-2233008',
  },
  {
    name: 'Jaffna Glass & Aluminium',
    email: 'info@jaffnaglass.lk',
    address: 'No. 14, Hospital Road, Jaffna',
    contact: '021-2233009',
  },
  {
    name: 'Trinco Safety Equipment (Pvt) Ltd',
    email: 'sales@trincosafety.lk',
    address: 'No. 8, Dockyard Road, Trincomalee',
    contact: '026-2233010',
  },
]

export function buildSuppliers(): Supplier[] {
  return SUPPLIER_DEFS.map((def, index) => ({
    id: index + 1,
    businessPartnerCode: `BP-${String(1001 + index)}`,
    name: def.name,
    email: def.email,
    address: def.address,
    contact: def.contact,
  }))
}

type InvoiceBucket = 'OPEN' | 'GRN_ONLY' | 'SUBMITTED' | 'INACTIVE'

const INVOICE_BUCKET_PLAN: Array<{ bucket: InvoiceBucket; count: number }> = [
  { bucket: 'OPEN', count: 45 },
  { bucket: 'GRN_ONLY', count: 50 },
  { bucket: 'SUBMITTED', count: 45 },
  { bucket: 'INACTIVE', count: 10 },
]

const INVOICE_TYPES: InvoiceType[] = ['CREDIT', 'ADVANCE', 'LC']
const INVOICE_SOURCES: InvoiceSource[] = ['DIRECT', 'STORES', 'PROJECT']
const REMARKS_SAMPLES = [
  'Awaiting site engineer confirmation.',
  'Partial delivery, balance pending.',
  'Urgent - contractor requested early settlement.',
  'Rate variance approved by project manager.',
  null,
  null,
  null,
]

/** SUBMITTED-bucket invoices are grouped into batches sharing one listNo each (a "batch" is what
 * one Add-to-Finance submission produces) - sums to the SUBMITTED count in INVOICE_BUCKET_PLAN. */
const SUBMITTED_BATCH_SIZES = [6, 5, 4, 5, 3, 4, 5, 3, 5, 5]

export function buildInvoices(
  projects: Project[],
  suppliers: Supplier[],
  users: User[],
): Invoice[] {
  const authors = users.filter((user) =>
    user.roles.some((role) => role.name === 'PROCUREMENT' || role.name === 'SITE_STORE_KEEPER'),
  )
  const approvers = users.filter((user) =>
    user.roles.some(
      (role) => role.name === 'PROCUREMENT_MANAGER' || role.name === 'SENIOR_MANAGER',
    ),
  )

  /** Mirrors the real batchAddToFinance: one listNo per batch, NNN resets per calendar month. */
  const listNoCounterByMonth = new Map<string, number>()
  const nextListNo = (financeSubmitDate: Date): string => {
    const [year, month, day] = toIsoDate(financeSubmitDate).split('-')
    const monthKey = `${year}${month}`
    const seq = (listNoCounterByMonth.get(monthKey) ?? 0) + 1
    listNoCounterByMonth.set(monthKey, seq)
    return `${year}/${month}/${day}/${String(seq).padStart(3, '0')}`
  }

  const invoices: Invoice[] = []
  let id = 1

  function buildCoreFields(bucket: InvoiceBucket) {
    const invoiceDate = daysAgo(randomInt(1, 365))
    const receivedDate = addDays(invoiceDate, randomInt(0, 5))
    const project = randomItem(projects)
    const supplier = randomItem(suppliers)
    const author = randomItem(authors.length > 0 ? authors : users)
    const value = randomInt(5_000, 2_500_000)
    const hasGrn = bucket === 'GRN_ONLY' || bucket === 'SUBMITTED'
    const grnReceivedDate = hasGrn ? addDays(receivedDate, randomInt(1, 10)) : null

    return { invoiceDate, receivedDate, project, supplier, author, value, hasGrn, grnReceivedDate }
  }

  for (const { bucket, count } of INVOICE_BUCKET_PLAN) {
    if (bucket === 'SUBMITTED') {
      for (const batchSize of SUBMITTED_BATCH_SIZES) {
        const batch = Array.from({ length: batchSize }, () => buildCoreFields(bucket))
        const latestGrnReceivedDate = batch.reduce(
          (latest, entry) => (entry.grnReceivedDate! > latest ? entry.grnReceivedDate! : latest),
          batch[0].grnReceivedDate!,
        )
        const financeSubmitDate = addDays(latestGrnReceivedDate, randomInt(1, 5))
        const listNo = nextListNo(financeSubmitDate)
        const approver = randomItem(approvers.length > 0 ? approvers : users)

        for (const entry of batch) {
          const { invoiceDate, receivedDate, project, supplier, author, value, grnReceivedDate } =
            entry
          invoices.push({
            id,
            invoiceType: randomItem(INVOICE_TYPES),
            invoiceSource: randomItem(INVOICE_SOURCES),
            projectId: project.id,
            supplierId: supplier.id,
            invoiceNumber: `INV-${project.code.slice(-3)}-${String(id).padStart(4, '0')}`,
            invoiceDate: toIsoDate(invoiceDate),
            receivedDate: toIsoDate(receivedDate),
            purchaseOrderNumber: `PO-${randomInt(10000, 99999)}`,
            value,
            pioNumber: `PIO-${randomInt(1000, 9999)}`,
            grnNumber: `GRN-${randomInt(10000, 99999)}`,
            grnReceivedDate: toIsoDate(grnReceivedDate!),
            listNo,
            financeSubmitDate: toIsoDate(financeSubmitDate),
            remarks: randomItem(REMARKS_SAMPLES),
            attachmentUrl: Math.random() < 0.7 ? `https://files.maga.lk/invoices/${id}.pdf` : null,
            attachmentViewed: Math.random() < 0.5,
            active: true,
            authorUserId: author.id,
            updatedByUserId: approver.id,
            createdAt: toIsoDate(receivedDate),
            updatedAt: toIsoDate(financeSubmitDate),
          })
          id++
        }
      }
      continue
    }

    for (let i = 0; i < count; i++) {
      const {
        invoiceDate,
        receivedDate,
        project,
        supplier,
        author,
        value,
        hasGrn,
        grnReceivedDate,
      } = buildCoreFields(bucket)
      const isInactive = bucket === 'INACTIVE'
      const updatedBy = isInactive ? randomItem(approvers.length > 0 ? approvers : users) : null
      const createdAt = receivedDate
      const updatedAt = grnReceivedDate ?? receivedDate

      invoices.push({
        id,
        invoiceType: randomItem(INVOICE_TYPES),
        invoiceSource: randomItem(INVOICE_SOURCES),
        projectId: project.id,
        supplierId: supplier.id,
        invoiceNumber: `INV-${project.code.slice(-3)}-${String(id).padStart(4, '0')}`,
        invoiceDate: toIsoDate(invoiceDate),
        receivedDate: toIsoDate(receivedDate),
        purchaseOrderNumber: `PO-${randomInt(10000, 99999)}`,
        value,
        pioNumber: `PIO-${randomInt(1000, 9999)}`,
        grnNumber: hasGrn ? `GRN-${randomInt(10000, 99999)}` : null,
        grnReceivedDate: grnReceivedDate ? toIsoDate(grnReceivedDate) : null,
        listNo: null,
        financeSubmitDate: null,
        remarks: randomItem(REMARKS_SAMPLES),
        attachmentUrl: Math.random() < 0.7 ? `https://files.maga.lk/invoices/${id}.pdf` : null,
        attachmentViewed: Math.random() < 0.5,
        active: !isInactive,
        authorUserId: author.id,
        updatedByUserId: updatedBy ? updatedBy.id : null,
        createdAt: toIsoDate(createdAt),
        updatedAt: toIsoDate(updatedAt),
      })

      id++
    }
  }

  return invoices
}
