import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...rest }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'input-base appearance-none pr-8',
            error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
