import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">View platform analytics and reports</p>
      </CardContent>
    </Card>
  );
}
