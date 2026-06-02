import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { categoriesApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoriesApi.create(formData);
      toast.success('Category created');
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Categories Management</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">New Category</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category._id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description || 'No description'}</p>
              </div>
              <button onClick={() => handleDelete(category._id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="size-5" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
