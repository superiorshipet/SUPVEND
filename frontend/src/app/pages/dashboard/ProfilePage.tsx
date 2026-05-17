import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../../store/authStore';

export default function ProfilePage() {
  const { user } = useAuthStore();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input label="Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} disabled />
          <Input label="Phone" placeholder="Add phone number" />
          <Button>Update Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
