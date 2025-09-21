// This page is no longer needed as earning options are separated into sub-pages.
// Redirecting to the main dashboard to avoid a 404 or an empty page.
import { redirect } from 'next/navigation';

export default function EarnPage() {
    redirect('/dashboard');
}
