import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Forgot Password</h2>
        <form className="space-y-6">
          <Input label="Email" type="email" required placeholder="john@example.com" />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      </div>
    </div>
  );
}
