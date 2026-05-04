import { AuthPanel } from "@/components/auth-panel";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Money Manager
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Sign in to connect Firebase Auth. Then we&apos;ll add transactions and
          receipts.
        </p>
        <AuthPanel />
      </main>
    </div>
  );
}
