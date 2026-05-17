import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Welcome to Admin Dashboard</p>
      </CardContent>
    </Card>
  );
}
