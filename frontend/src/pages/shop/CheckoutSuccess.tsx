import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useGetCheckoutSessionQuery } from '@/api/checkoutApi';
import { useAppDispatch } from '@/app/hooks';
import { clearCart } from '@/features/cart/cartSlice';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10; // ~20s total

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const dispatch = useAppDispatch();

  const [attempts, setAttempts] = useState(0);
  const [pollingDone, setPollingDone] = useState(false);

  const { data, refetch } = useGetCheckoutSessionQuery(sessionId, {
    skip: !sessionId,
  });

  // Poll until we get a completed status (webhook fired) or we exhaust attempts.
  useEffect(() => {
    if (!sessionId || pollingDone) return;
    if (data?.status === 'completed') {
      dispatch(clearCart());
      setPollingDone(true);
      return;
    }
    if (attempts >= MAX_ATTEMPTS) {
      setPollingDone(true);
      return;
    }
    const id = setTimeout(() => {
      setAttempts((n) => n + 1);
      refetch();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [data, attempts, pollingDone, sessionId, refetch, dispatch]);

  const isCompleted = data?.status === 'completed';
  const isWaiting = !isCompleted && !pollingDone;
  const isStuck = !isCompleted && pollingDone;

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <Card>
        <CardBody className="text-center">
          {isWaiting && (
            <>
              <Spinner className="mx-auto h-8 w-8" />
              <h1 className="mt-4 text-xl font-bold">Confirming your payment…</h1>
              <p className="mt-2 text-sm text-muted">
                This usually takes a few seconds.
              </p>
            </>
          )}

          {isCompleted && (
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

          {isStuck && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-xl font-bold">Still processing…</h1>
              <p className="mt-2 text-sm text-muted">
                Your payment was received, but we haven't confirmed your order yet.
                This usually means the Stripe webhook tunnel isn't running on the
                server. Please check the backend logs or contact support.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Button
                  fullWidth
                  onClick={() => {
                    setAttempts(0);
                    setPollingDone(false);
                    refetch();
                  }}
                >
                  Try again
                </Button>
                <Link to="/account/orders">
                  <Button fullWidth variant="outline">
                    View My Orders
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
