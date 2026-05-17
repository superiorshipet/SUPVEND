import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../services/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });
      
      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-[#4F46E5]" />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-[#4F46E5] hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#4F46E5] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
