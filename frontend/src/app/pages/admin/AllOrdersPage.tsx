import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function AllOrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">View all platform orders</p>
      </CardContent>
    </Card>
  );
}
