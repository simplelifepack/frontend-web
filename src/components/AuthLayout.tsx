import BrandLogo from "./BrandLogo";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="lp-auth min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[24px] border border-[var(--lp-border)] bg-[var(--lp-panel)] shadow-[0_30px_70px_color-mix(in srgb, var(--lp-navy) 22%, transparent)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-[var(--lp-border)] bg-[var(--lp-raised)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="lp-auth-radar" aria-hidden />
            <div>
              <BrandLogo height={64} className="relative" />
              <h1 className="relative mt-6 max-w-md font-display text-4xl font-bold leading-tight tracking-tight text-[var(--lp-heading)]">
                Your documents, ready when life asks.
              </h1>
              <p className="relative mt-4 max-w-md text-sm leading-6 text-[var(--lp-muted)]">
                Sign in to your private living archive, create an account, or reset your password.
              </p>
            </div>
            <div className="relative rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-panel)]/80 p-5">
              <p className="text-sm leading-6 text-[var(--lp-text)]">
                Private by design. Your connected sources remain read-only and under your control.
              </p>
            </div>
          </section>
          <section className="bg-[var(--lp-panel)] p-6 text-[var(--lp-text)] sm:p-10">{children}</section>
        </div>
      </div>
    </div>
  );
}
