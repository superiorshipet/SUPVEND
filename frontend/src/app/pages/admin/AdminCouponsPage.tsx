import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function AdminCouponsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Manage platform coupons</p>
      </CardContent>
    </Card>
  );
}
