import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { Shell } from '@/components/shell';
import Home from '@/pages/home';
import GameDetail from '@/pages/game-detail';
import OrderForm from '@/pages/order-form';
import MyOrders from '@/pages/my-orders';
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminGames from '@/pages/admin/games';
import AdminPackages from '@/pages/admin/packages';
import AdminOrders from '@/pages/admin/orders';
import NotFound from '@/pages/not-found';
import '@/lib/i18n';

const queryClient = new QueryClient();

function MainRouter() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/orders" component={MyOrders} />
        <Route path="/games/:id" component={GameDetail} />
        <Route path="/order/:gameId/:packageId" component={OrderForm} />
        
        {/* Admin Routes - should be in an admin shell but we'll use the main one or standard pages */}
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/games" component={AdminGames} />
        <Route path="/admin/packages" component={AdminPackages} />
        <Route path="/admin/orders" component={AdminOrders} />
        
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <MainRouter />
      </WouterRouter>
      <Toaster theme="dark" position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
