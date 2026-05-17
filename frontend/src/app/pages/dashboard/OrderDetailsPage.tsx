import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
export default function OrderDetailsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
      <CardContent><p className="text-gray-600">View order details here</p></CardContent>
    </Card>
  );
}
