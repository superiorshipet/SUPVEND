import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
export default function VendorProfilePage() {
  return (
    <Card>
      <CardHeader><CardTitle>Store Profile</CardTitle></CardHeader>
      <CardContent><p className="text-gray-600">Manage your store settings</p></CardContent>
    </Card>
  );
}
