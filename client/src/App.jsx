import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { router } from './routes';
import { fetchCurrentUser, setLoading } from './store/slices/authSlice';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { PageLoader } from './components/ui/LoadingSpinner';

export default function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (isLoading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </ErrorBoundary>
  );
}
