import { redirect } from 'next/navigation';

export default function PagesRedirect() {
  redirect('/admin/payments?paymentTab=pages');
}
