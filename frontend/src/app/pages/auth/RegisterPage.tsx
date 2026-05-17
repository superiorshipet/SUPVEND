import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    storeName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success('Account created successfully!');
      navigate('/login');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join SupVend today</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                role === 'customer'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                role === 'vendor'
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vendor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />

            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
            />

            {role === 'vendor' && (
              <Input
                label="Store Name"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="My Store"
              />
            )}

            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#4F46E5] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
