import { Outlet } from 'react-router';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
