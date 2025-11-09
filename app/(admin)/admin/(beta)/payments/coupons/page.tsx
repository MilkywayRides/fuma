import { redirect } from 'next/navigation';

export default function CouponsRedirect() {
  redirect('/admin/payments?paymentTab=coupons');
}
