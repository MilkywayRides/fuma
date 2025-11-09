import { redirect } from 'next/navigation';

export default function ButtonsRedirect() {
  redirect('/admin/payments?paymentTab=buttons');
}
