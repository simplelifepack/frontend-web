import { spacing } from "@/design-system";
import BrandLogo from "./BrandLogo";
const navItems = Array.from({ length: 6 });
const cards = Array.from({ length: 4 });

export default function BootstrapSkeleton() {
  return (
    <div
      className="lp-bootstrap-skeleton"
      aria-busy="true"
      aria-label="Loading Readines"
    >
      <aside className="lp-bootstrap-skeleton-nav">
        <div className="lp-bootstrap-brand-skeleton">
          <BrandLogo height={Number.parseInt(spacing.s40)} />
        </div>
        {navItems.map((_, index) => (
          <div className="lp-bootstrap-nav-row" key={index}>
            <i className="lp-skeleton-block icon" />
            <i className="lp-skeleton-block line" />
          </div>
        ))}
      </aside>

      <main className="lp-bootstrap-skeleton-main">
        <div className="lp-bootstrap-topbar">
          <i className="lp-skeleton-block search" />
          <i className="lp-skeleton-block avatar" />
        </div>
        <section className="lp-bootstrap-content">
          <i className="lp-skeleton-block line eyebrow" />
          <i className="lp-skeleton-block heading" />
          <i className="lp-skeleton-block line subtitle" />
          <div className="lp-bootstrap-card-grid">
            {cards.map((_, index) => (
              <div className="lp-bootstrap-card" key={index}>
                <i className="lp-skeleton-block icon large" />
                <i className="lp-skeleton-block line short" />
                <i className="lp-skeleton-block heading small" />
              </div>
            ))}
          </div>
          <div className="lp-bootstrap-panels">
            <div className="lp-bootstrap-panel" />
            <div className="lp-bootstrap-panel" />
          </div>
        </section>
      </main>
    </div>
  );
}
