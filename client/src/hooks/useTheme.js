import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '@/store/slices/uiSlice';

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => dispatch(toggleTheme()),
    setTheme: (t) => dispatch(setTheme(t)),
  };
}
