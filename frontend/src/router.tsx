import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ShopLayout } from '@/layouts/ShopLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedAdminRoute } from '@/routes/ProtectedAdminRoute';
import { ProtectedCustomerRoute } from '@/routes/ProtectedCustomerRoute';
import { RoleGate } from '@/routes/RoleGate';

// Storefront pages
import { Home } from '@/pages/shop/Home';
import { Catalog } from '@/pages/shop/Catalog';
import { ProductPage } from '@/pages/shop/ProductPage';
import { Cart } from '@/pages/shop/Cart';
import { Checkout } from '@/pages/shop/Checkout';
import { CheckoutSuccess } from '@/pages/shop/CheckoutSuccess';
import { CheckoutCancel } from '@/pages/shop/CheckoutCancel';
import { AccountProfile } from '@/pages/shop/account/Profile';
import { AccountOrders } from '@/pages/shop/account/Orders';
import { AccountOrderDetail } from '@/pages/shop/account/OrderDetail';
import { AccountPassword } from '@/pages/shop/account/Password';

// Auth
import { CustomerSignIn } from '@/pages/auth/CustomerSignIn';
import { CustomerSignUp } from '@/pages/auth/CustomerSignUp';
import { AdminSignIn } from '@/pages/auth/AdminSignIn';

// Admin pages
import { Overview } from '@/pages/admin/Overview';
import { ProductsList } from '@/pages/admin/products/ProductsList';
import { ProductForm } from '@/pages/admin/products/ProductForm';
import { CategoriesList } from '@/pages/admin/categories/CategoriesList';
import { OrdersList } from '@/pages/admin/orders/OrdersList';
import { OrderDetail } from '@/pages/admin/orders/OrderDetail';
import { PosNewOrder } from '@/pages/admin/orders/PosNewOrder';
import { CustomersList } from '@/pages/admin/customers/CustomersList';
import { PaymentsList } from '@/pages/admin/payments/PaymentsList';
import { UsersList } from '@/pages/admin/users/UsersList';
import { AdminProfile } from '@/pages/admin/settings/Profile';

import { NotFound } from '@/pages/NotFound';

export const router = createBrowserRouter([
  // Storefront
  {
    path: '/',
    element: <ShopLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Catalog /> },
      { path: 'shop/products/:id', element: <ProductPage /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout/success', element: <CheckoutSuccess /> },
      { path: 'checkout/cancel', element: <CheckoutCancel /> },
      {
        element: <ProtectedCustomerRoute />,
        children: [
          { path: 'checkout', element: <Checkout /> },
          { path: 'account', element: <Navigate to="/account/orders" replace /> },
          { path: 'account/profile', element: <AccountProfile /> },
          { path: 'account/password', element: <AccountPassword /> },
          { path: 'account/orders', element: <AccountOrders /> },
          { path: 'account/orders/:id', element: <AccountOrderDetail /> },
        ],
      },
    ],
  },

  // Customer auth
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <CustomerSignIn /> },
      { path: '/register', element: <CustomerSignUp /> },
      { path: '/admin/login', element: <AdminSignIn /> },
    ],
  },

  // Admin
  {
    path: '/admin',
    element: <ProtectedAdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: 'overview', element: <Overview /> },
          { path: 'products', element: <ProductsList /> },
          { path: 'products/new', element: <ProductForm /> },
          { path: 'products/:id', element: <ProductForm /> },
          { path: 'categories', element: <CategoriesList /> },
          { path: 'orders', element: <OrdersList /> },
          { path: 'orders/new', element: <PosNewOrder /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          { path: 'customers', element: <CustomersList /> },
          { path: 'payments', element: <PaymentsList /> },
          { path: 'settings', element: <AdminProfile /> },
          {
            element: <RoleGate allow={['admin']} />,
            children: [{ path: 'users', element: <UsersList /> }],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
