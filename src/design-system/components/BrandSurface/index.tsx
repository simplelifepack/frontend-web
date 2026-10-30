import { lightColorTokens } from "../../variables/colorTokens";
import { approvedLandingStyles } from "./legacy";
import styled from "styled-components";
import { theme } from "../../variables/theme";
import { landingBrand as C } from "../../variables/brand";
import {
  Container,
  Section,
  SiteNav,
  Content,
  Grid,
  SurfaceHeader,
  ComparisonTable,
} from "../Stack";
import { Surface as CardSurface } from "../Card/styles";

/** Approved public brand scope. Never applies palette overrides to the authenticated shell. */
export const BrandSurface = styled.div`
  ${Object.entries(lightColorTokens)
    .map(([name, value]) => `--color-${name}: ${value};`)
    .join("\n")}
  --lp-navy: ${C.paper};
  --lp-panel: ${C.panel};
  --lp-raised: ${C.panel2};
  --lp-border: ${C.border};
  --lp-heading: ${C.ink};
  --lp-text: ${C.body};
  --lp-muted: ${C.muted};
  --lp-faint: ${C.muted};
  --lp-action: ${C.action};
  --lp-action-text: ${C.actionText};
  --lp-action-hover: ${C.actionHover};
  --lp-mint: ${C.emerald};
  --lp-coral: ${C.red};
  --lp-info: ${C.blue};
  --lp-purple: ${C.purple};
  --lp-pink: ${C.pink};
  --lp-teal: ${C.teal};
  --lp-control-border: ${C.border};

  ${approvedLandingStyles}
  .lp-momentchip {
    font-size: ${({ theme }) => theme.typography.text.sm};
    max-width: 100%;
  }
  ${ComparisonTable} thead {
    background: ${C.ink};
    color: ${C.panel};
  }
  ${Container} {
    max-width: 1120px;
    padding-inline: ${({ theme }) => theme.spacing.s24};
  }
  ${Section} {
    padding-block: 84px;
    background: ${C.paper};
    color: ${C.body};
  }
  ${Section}[data-brand-tone="raised"] {
    background: ${C.paperDeep};
  }
  ${SiteNav} {
    background: ${C.paper}d9;
    backdrop-filter: blur(12px);
    border-color: ${C.border};
  }
  ${CardSurface} {
    border-color: ${C.border};
    border-radius: 18px;
    box-shadow: 0 12px 30px ${lightColorTokens["shadow-soft"]};
  }
  ${Content} {
    color: ${C.body};
  }
  @media ${({ theme }) => theme.media.mobile} {
    ${Section} {
      padding-block: ${({ theme }) => theme.spacing.s40};
    }
  }
`;
BrandSurface.defaultProps = { theme };

/** Static decorative layer for calls to action; the hero can use the animated artwork. */
export const BrandBackdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  & > svg {
    width: 100%;
    height: 100%;
  }
`;
export const BrandCallout = styled(CardSurface)`
  position: relative;
  overflow: hidden;
  & > :last-child {
    position: relative;
  }
`;
export const BrandPlanHeader = styled(SurfaceHeader)`
  background: ${({ $accent }) => ($accent ? C.ink : C.paperDeep)};
  color: ${({ $accent }) => ($accent ? C.panel : C.ink)};
`;
BrandBackdrop.defaultProps =
  BrandCallout.defaultProps =
  BrandPlanHeader.defaultProps =
    { theme };
