import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setTheme } from '@/features/theme/themeSlice';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text transition hover:bg-surface-2"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
