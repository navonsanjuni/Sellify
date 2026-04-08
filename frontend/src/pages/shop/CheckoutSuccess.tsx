import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useGetCheckoutSessionQuery } from '@/api/checkoutApi';
import { useAppDispatch } from '@/app/hooks';
import { clearCart } from '@/features/cart/cartSlice';

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetCheckoutSessionQuery(sessionId, { skip: !sessionId });

  useEffect(() => {
    if (data?.status === 'paid' || data?.status === 'complete') {
      dispatch(clearCart());
    }
  }, [data, dispatch]);

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <Card>
        <CardBody className="text-center">
          {isLoading ? (
            <Spinner className="mx-auto" />
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-2xl font-bold">Payment Successful</h1>
              <p className="mt-2 text-sm text-muted">
                Thank you for your order. A confirmation email is on its way.
              </p>
              {data?.order && (
                <p className="mt-3 text-sm font-semibold text-primary-600">
                  Order #{data.order.orderNumber}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/account/orders">
                  <Button fullWidth>View My Orders</Button>
                </Link>
                <Link to="/shop">
                  <Button fullWidth variant="outline">
                    Keep Shopping
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
