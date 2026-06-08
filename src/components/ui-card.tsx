"use client";

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppCard({ children, className = "" }: AppCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

type AppCardHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function AppCardHeader({ title, subtitle, action }: AppCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AppCardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-4 py-4 ${className}`.trim()}>{children}</div>;
}

export function AppSectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${className}`.trim()}
    >
      {children}
    </h2>
  );
}
