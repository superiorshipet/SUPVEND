import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function UsersManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Manage platform users</p>
      </CardContent>
    </Card>
  );
}
