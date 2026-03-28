import { Suspense } from 'react';
import Loader from '@/components/Loader';
import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
