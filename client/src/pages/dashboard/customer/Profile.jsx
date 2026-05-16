import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock } from 'lucide-react';
import { changePasswordSchema } from '@/utils/validators';
import { authAPI } from '@/api/endpoints';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [changingPw, setChangingPw] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onPasswordChange = async (data) => {
    setChangingPw(true);
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed!');
      reset();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setChangingPw(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-surface-500">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <p className="text-xs text-surface-500 mb-1">Role</p>
            <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">{user?.role}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <p className="text-xs text-surface-500 mb-1">Email Verified</p>
            <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.isEmailVerified ? '✓ Yes' : '✗ No'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</h3>
        <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-4 max-w-md">
          <Input label="Current Password" type="password" error={errors.currentPassword?.message} {...register('currentPassword')} />
          <Input label="New Password" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
          <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" isLoading={changingPw}>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
