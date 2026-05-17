import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
export default function CouponsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Coupons</CardTitle></CardHeader>
      <CardContent><p className="text-gray-600">Create and manage coupons</p></CardContent>
    </Card>
  );
}
