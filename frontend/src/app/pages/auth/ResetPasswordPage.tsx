import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h2>
        <form className="space-y-6">
          <Input label="New Password" type="password" required />
          <Input label="Confirm Password" type="password" required />
          <Button type="submit" className="w-full">Reset Password</Button>
        </form>
      </div>
    </div>
  );
}
