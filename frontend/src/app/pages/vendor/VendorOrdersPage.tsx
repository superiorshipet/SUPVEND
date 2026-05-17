import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
export default function VendorOrdersPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
      <CardContent><p className="text-gray-600">Manage your orders here</p></CardContent>
    </Card>
  );
}
