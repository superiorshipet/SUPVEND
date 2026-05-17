import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function VendorsManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendors Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Manage platform vendors</p>
      </CardContent>
    </Card>
  );
}
