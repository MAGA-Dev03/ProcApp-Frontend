import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:block">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 font-semibold">
          ProcApp
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <span className="text-sm text-muted-foreground">Invoice Management System</span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
