import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
export default function VendorAuctionsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Auctions</CardTitle></CardHeader>
      <CardContent><p className="text-gray-600">Create and manage auctions</p></CardContent>
    </Card>
  );
}
