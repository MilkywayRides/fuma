import { redirect } from 'next/navigation';

export default function PlansRedirect() {
  redirect('/admin/payments?paymentTab=plans');
}
