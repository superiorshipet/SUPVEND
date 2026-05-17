import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>NotFound</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">This page is under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
