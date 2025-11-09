import { redirect } from 'next/navigation';

export default function GatewaysRedirect() {
  redirect('/admin/payments?paymentTab=gateways');
}
