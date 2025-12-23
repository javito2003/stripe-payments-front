import './globals.css';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/components/providers';

export const metadata = {
  title: 'NestJS + Stripe Demo Frontend',
  description: 'Auth (cookies), products, cart, checkout with Stripe Elements.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AuthProvider>
            <div className="container">
              {children}
            </div>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
