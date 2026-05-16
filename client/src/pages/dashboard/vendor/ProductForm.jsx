import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { productSchema } from '@/utils/validators';
import { productAPI, categoryAPI } from '@/api/endpoints';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    categoryAPI.getAll().then((r) => setCategories((r.data?.data?.categories || r.data?.categories || []).map((c) => ({ value: c._id, label: c.name })))).catch(() => {});
    if (isEdit) {
      productAPI.getById(id).then((r) => {
        const p = r.data?.data?.product || r.data?.data;
        if (p) reset({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category?._id || p.category, brand: p.brand });
      }).catch(() => {});
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') formData.append(k, v); });
      images.forEach((img) => formData.append('images', img));
      if (isEdit) { await productAPI.update(id, formData); toast.success('Product updated!'); }
      else { await productAPI.create(formData); toast.success('Product created!'); }
      navigate('/vendor/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const handleImageChange = (e) => { setImages([...images, ...Array.from(e.target.files)]); };
  const removeImage = (i) => { setImages(images.filter((_, idx) => idx !== i)); };

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">{isEdit ? 'Edit' : 'Add'} Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card>
          <div className="space-y-4">
            <Input label="Product Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
              <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Category" options={categories} placeholder="Select category" error={errors.category?.message} {...register('category')} />
              <Input label="Brand" error={errors.brand?.message} {...register('brand')} />
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Product Images</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700">
                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger-500 text-white flex items-center justify-center cursor-pointer"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="h-5 w-5 text-surface-400 mb-1" />
              <span className="text-xs text-surface-400">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" isLoading={loading} variant="gradient">{isEdit ? 'Update' : 'Create'} Product</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/vendor/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
