import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from './AuthContext'

export function ProfilePage() {
  const { currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="text-muted-foreground">Name</div>
          <div className="font-medium">{currentUser.name}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Email</div>
          <div className="font-medium">{currentUser.email}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Roles</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {currentUser.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
