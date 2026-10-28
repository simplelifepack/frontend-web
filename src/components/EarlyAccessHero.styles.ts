import styled, { keyframes } from "styled-components";
import { Button, Heading, Input, Text, colors } from "@/design-system";
import { theme } from "@/design-system/variables/theme";

export const Surface = styled.div`
  position: relative;
  min-height: 100svh;
  background:
    radial-gradient(ellipse at 80% 35%, ${colors.actionSoft}, transparent 60%),
    linear-gradient(125deg, ${colors.surface}, ${colors.background});
  color: ${colors.text};
  overflow: clip;
`;
export const Nav = styled.nav`
  max-width: 1536px;
  margin: auto;
  padding: 38px clamp(24px, 6.7vw, 104px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  @media ${({ theme }) => theme.media.mobile} {
    padding: 24px;
    gap: 8px;
  }
`;
export const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: ${colors.heading};
  text-decoration: none;
  &:focus-visible {
    outline: 2px solid ${colors.action};
    outline-offset: 6px;
  }
`;
export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 32px);
`;
export const Layout = styled.main`
  max-width: 1536px;
  margin: auto;
  min-height: calc(100svh - 128px);
  padding: 36px clamp(24px, 6.7vw, 104px) 64px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: center;
  gap: 32px;
  @media ${({ theme }) => theme.media.mobile} {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    padding: 44px 24px 40px;
    gap: 40px;
  }
`;
export const Copy = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
  transform: translateY(-70px);
  @media ${({ theme }) => theme.media.mobile} {
    transform: none;
  }
`;
export const Badge = styled(Text)`
  display: inline-flex;
  padding: 9px 16px;
  border-radius: 999px;
  background: ${colors.actionSoft};
  color: ${colors.action};
  margin-bottom: 28px;
  letter-spacing: 0.02em;
`;
export const Title = styled(Heading)`
  font-size: clamp(40px, 5.5vw, 84px);
  line-height: 1.09;
  letter-spacing: -0.045em;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  span {
    display: block;
    color: ${colors.action};
  }
  @media ${({ theme }) => theme.media.tablet} {
    font-size: clamp(36px, 5.2vw, 60px);
  }
  @media ${({ theme }) => theme.media.mobile} {
    font-size: clamp(38px, 8.3vw, 60px);
  }
`;
export const Description = styled(Text)`
  display: block;
  margin: 24px 0 34px;
  max-width: 620px;
  font-size: clamp(17px, 1.9vw, 26px);
  line-height: 1.5;
`;
export const Form = styled.form`
  width: 100%;
  max-width: 650px;
`;
export const EmailLabel = styled.label`
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  > svg {
    position: absolute;
    left: 20px;
    width: 22px;
    color: ${colors.action};
    pointer-events: none;
  }
`;
export const EmailInput = styled(Input)`
  height: 64px;
  padding-left: 56px;
  border: 0;
  background: transparent;
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.weights.regular};
`;
export const FormRow = styled.div`
  display: flex;
  border: 1px solid ${colors.controlBorder};
  border-radius: 14px;
  background: color-mix(in srgb, ${colors.surface} 65%, transparent);
  button[data-ds-button] {
    min-height: 64px;
    padding-inline: 24px;
    font-size: 18px;
  }
  @media ${({ theme }) => theme.media.tablet} {
    flex-direction: column;
    gap: 8px;
    border: 0;
    background: transparent;
    ${EmailLabel} {
      border: 1px solid ${colors.controlBorder};
      border-radius: 10px;
      background: ${colors.surface};
    }
  }
`;
export const Feedback = styled.div`
  min-height: 28px;
  padding-top: 8px;
`;
export const Reassurance = styled.ul`
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  font-size: 15px;
  li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  svg {
    width: 30px;
    height: 30px;
    padding: 6px;
    border-radius: 50%;
    color: ${colors.action};
    background: ${colors.actionSoft};
  }
  @media ${({ theme }) => theme.media.compact} {
    font-size: 12px;
    gap: 10px 14px;
    li {
      gap: 6px;
    }
    svg {
      width: 24px;
      height: 24px;
      padding: 5px;
    }
  }
`;
const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); }`;

// Crop transparent padding with layout only; retain the supplied bitmap unchanged.
export const Mascot = styled.div`
  animation: ${float} 6s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  position: relative;
  width: min(126%, 720px);
  aspect-ratio: 1000 / 1024;
  justify-self: center;
  overflow: hidden;
  filter: drop-shadow(
    0 22px 22px color-mix(in srgb, ${colors.action} 18%, transparent)
  );
  img {
    position: absolute;
    width: 153.6%;
    max-width: none;
    height: auto;
    top: 0;
    left: -34%;
  }
  @media ${({ theme }) => theme.media.mobile} {
    width: min(100%, 360px);
  }
`;
export const HeroNavigationButton = styled(Button)`
  min-height: 48px;
  svg { width: 24px; height: 24px; }
  &:not([data-ds-icon-only]) { min-width: 132px; font-size: 18px; }
  @media ${({ theme }) => theme.media.compact} { &:not([data-ds-icon-only]) { min-width: 76px; font-size: 14px; } }
`;
export const HeroBrand = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  @media ${({ theme }) => theme.media.compact} {
    gap: 8px;
    img {
      width: 28px;
      height: 28px;
    }
    > span {
      font-size: 20px !important;
    }
  }
`;

for (const component of [ Surface, Nav, Logo, Actions, Layout, Copy, Badge, Title, Description, Form, EmailLabel, EmailInput, FormRow, Feedback, Reassurance, Mascot, HeroNavigationButton, HeroBrand, ]) component.defaultProps = { theme };
