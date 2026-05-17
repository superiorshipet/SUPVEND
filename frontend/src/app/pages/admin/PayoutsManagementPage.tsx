import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function PayoutsManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payouts Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Manage vendor payouts</p>
      </CardContent>
    </Card>
  );
}
