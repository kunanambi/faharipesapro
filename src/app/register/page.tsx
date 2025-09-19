
import { RegisterView } from "@/components/auth/register-view";
import { Suspense } from "react";

function RegisterPageContent({ refCode }: { refCode?: string }) {
  return <RegisterView refCode={refCode} />;
}

export default function RegisterPage({ searchParams }: { searchParams: { ref?: string } }) {
  const refCode = searchParams.ref;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent refCode={refCode} />
    </Suspense>
  );
}
