import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function CategoriesManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Manage product categories</p>
      </CardContent>
    </Card>
  );
}
