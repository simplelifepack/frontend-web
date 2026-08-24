import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="lp-auth min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[24px] border border-[#E3D8C2] bg-white shadow-[0_30px_70px_rgba(80,60,30,.16)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative hidden overflow-hidden border-r border-[#E3D8C2] bg-[#F3EBDA] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="lp-auth-radar" aria-hidden />
            <div>
              <p className="relative font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[#A87C22]">
                ReadiNes
              </p>
              <h1 className="relative mt-6 max-w-md font-display text-4xl font-bold leading-tight tracking-tight text-[#221E17]">
                Your documents, ready when life asks.
              </h1>
              <p className="relative mt-4 max-w-md text-sm leading-6 text-[#4C443A]">
                Sign in to your private living archive, create an account, or recover access.
              </p>
            </div>
            <div className="relative rounded-2xl border border-[#D8C8AA] bg-white/80 p-5">
              <p className="text-sm leading-6 text-[#4C443A]">
                Private by design. Your connected sources remain read-only and under your control.
              </p>
            </div>
          </section>
          <section className="bg-[#FAF3E7] p-6 text-[#221E17] sm:p-10">{children}</section>
        </div>
      </div>
    </div>
  );
}
