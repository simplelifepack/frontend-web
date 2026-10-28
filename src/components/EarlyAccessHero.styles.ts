import styled from "styled-components";
import { Button, Heading, Input, Text, colors } from "@/design-system";
import { theme } from "@/design-system/variables/theme";

export const Surface = styled.div`
  box-sizing: border-box;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: ${colors.background} url("/images/early-access-background-light.png") center / cover no-repeat;
  .dark & { background-image: url("/images/early-access-background-dark.png"); }
  color: ${colors.text};
`;
export const Nav = styled.nav`
  box-sizing: border-box;
  width: 100%;
  max-width: 1600px;
  margin-inline: auto;
  padding: clamp(10px, 2.5dvh, 28px) clamp(16px, 6vw, 100px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;
export const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  color: ${colors.heading};
  text-decoration: none;
  &:focus-visible { outline: 2px solid ${colors.action}; outline-offset: 6px; }
`;
export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.5vw, 24px);
`;
export const Layout = styled.main`
  box-sizing: border-box;
  width: 100%;
  max-width: 1600px;
  min-height: 0;
  margin-inline: auto;
  padding: 0 clamp(16px, 6vw, 100px) clamp(12px, 3dvh, 32px);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(8px, 2vw, 32px);
  @media ${({ theme }) => theme.media.mobile} {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    gap: clamp(4px, 1dvh, 12px);
  }
`;
export const Copy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: grid;
  gap: clamp(8px, 1.7dvh, 18px);
`;
export const Badge = styled(Text)`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: ${colors.actionSoft};
  color: ${colors.action};
  font-size: clamp(10px, 1.5dvh, 12px);
  letter-spacing: 0.02em;
  &::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
`;
export const Title = styled(Heading)`
  font-size: clamp(26px, min(4.7vw, 7.2dvh), 72px);
  line-height: 1.08;
  letter-spacing: -0.045em;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  span { display: block; color: ${colors.action}; }
  @media ${({ theme }) => theme.media.mobile} { font-size: clamp(26px, min(8vw, 4.8dvh), 40px); }
`;
export const Description = styled(Text)`
  display: block;
  max-width: 680px;
  font-size: clamp(14px, min(1.6vw, 2.4dvh), 20px);
  line-height: 1.45;
  @media ${({ theme }) => theme.media.mobile} { font-size: clamp(12px, 1.9dvh, 16px); }
`;
export const Form = styled.form`
  width: 100%;
  min-width: 0;
`;
export const EmailLabel = styled.label`
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  > svg { position: absolute; left: 14px; width: 18px; color: ${colors.action}; pointer-events: none; }
`;
export const EmailInput = styled(Input)`
  height: clamp(44px, 7dvh, 60px);
  padding-left: 42px;
  border: 0;
  background: transparent;
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.weights.regular};
`;
export const FormRow = styled.div`
  display: flex;
  min-width: 0;
  border: 1px solid ${colors.controlBorder};
  border-radius: 12px;
  background: color-mix(in srgb, ${colors.surface} 65%, transparent);
  button[data-ds-button] {
    min-height: clamp(44px, 7dvh, 60px);
    padding-inline: clamp(10px, 1.5vw, 24px);
    font-size: clamp(12px, 1.3vw, 18px);
    flex: 0 0 42%;
  }
  @media (max-width: 520px) and (max-height: 740px) {
    input { padding-left: 10px; }
    ${EmailLabel} > svg { display: none; }
    button[data-ds-button] { font-size: 12px; }
  }
  @media (max-width: 520px) and (min-height: 741px) {
    flex-direction: column;
    gap: 6px;
    border: 0;
    background: transparent;
    button[data-ds-button] { flex: auto; font-size: 14px; }
    ${EmailLabel} { border: 1px solid ${colors.controlBorder}; border-radius: 10px; background: ${colors.surface}; }
  }
`;
export const Feedback = styled.div`
  padding-top: 4px;
  &:has([role="status"]:empty):not(:has([role="alert"])) { padding-top: 0; }
`;
export const Reassurance = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px clamp(10px, 1.5vw, 24px);
  font-size: clamp(11px, 1vw, 15px);
  li { display: flex; align-items: center; gap: 6px; }
  :root:not(.dark) & li {
    color: ${colors.heading};
    background: color-mix(in srgb, ${colors.action} 10%, transparent);
    backdrop-filter: blur(14px);
    border-radius: 6px;
    box-shadow: 0 0 0 3px color-mix(in srgb, ${colors.action} 10%, transparent);
  }
  svg { width: 22px; height: 22px; padding: 4px; border-radius: 50%; color: ${colors.action}; background: ${colors.actionSoft}; }
`;
export const Mascot = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
  img { display: block; width: 100%; height: 100%; min-height: 0; object-fit: contain; object-position: center bottom; }
`;
export const HeroNavigationButton = styled(Button)`
  min-height: 44px;
  &:not([data-ds-icon-only]) { background: transparent; border-color: ${colors.controlBorder}; color: ${colors.heading}; padding-inline: clamp(12px, 2vw, 28px); font-size: clamp(14px, 1.3vw, 18px); }
  svg { width: 22px; height: 22px; }
`;
export const HeroBrand = styled.span`
  display: inline-flex;
  align-items: center;
  gap: clamp(6px, 1vw, 12px);
  img { width: clamp(26px, 4.5dvh, 44px); height: auto; }
  > span { font-size: clamp(20px, 3.5dvh, 32px) !important; }
`;
for (const component of [Surface, Nav, Logo, Actions, Layout, Copy, Badge, Title, Description, Form, EmailLabel, EmailInput, FormRow, Feedback, Reassurance, Mascot, HeroNavigationButton, HeroBrand]) component.defaultProps = { theme };
