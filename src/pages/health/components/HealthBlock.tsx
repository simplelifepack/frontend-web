import type { ReactNode } from "react";
import { Microscope } from "lucide-react";

function HealthBlock({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="lp-health-block">
      <div className="lp-health-card-title">
        <Microscope size={17} /> {title} {action}
      </div>
      {children}
    </section>
  );
}

export default HealthBlock;
