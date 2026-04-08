import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export function CheckoutCancel() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <Card>
        <CardBody className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Payment Cancelled</h1>
          <p className="mt-2 text-sm text-muted">
            Your order was not completed. Your cart is still saved.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/cart">
              <Button fullWidth>Return to Cart</Button>
            </Link>
            <Link to="/shop">
              <Button fullWidth variant="outline">
                Keep Shopping
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
