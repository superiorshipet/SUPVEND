import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { adminApi, productsApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router';

export default function ProductsModerationPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll({ limit: 100 });
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(productId);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const pendingProducts = products.filter(p => p.isApproved === 'pending');
  const approvedProducts = products.filter(p => p.isApproved === 'approved');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Moderation ({pendingProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending products</p>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((product) => (
                <div key={product._id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <img src={product.images?.[0]?.url || 'https://placehold.co/80'} alt={product.name} className="size-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">${product.price}</p>
                      <p className="text-sm text-gray-500">Vendor: {product.vendorId?.storeName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        <CheckCircle className="size-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="size-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({approvedProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvedProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url || 'https://placehold.co/40'} alt={product.name} className="size-10 object-cover rounded" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">${product.price}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3 text-sm">{product.vendorId?.storeName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/products/${product._id}`}>
                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <Eye className="size-5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <XCircle className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
