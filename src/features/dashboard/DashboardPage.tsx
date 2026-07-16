import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to ProcApp</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        The Invoice Management System scaffold is up and running.
      </CardContent>
    </Card>
  )
}
