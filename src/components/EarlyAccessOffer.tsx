import styled from "styled-components";
import { Text, colors } from "@/design-system";
import { theme } from "@/design-system/variables/theme";

const Offer = styled.aside`
  margin-top: 0;
  max-width: 760px;
  color: ${colors.heading};
`;
const Card = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(10px, 1.5vw, 24px);
  padding: clamp(10px, 1.7dvh, 22px) clamp(12px, 1.5vw, 24px);
  border: 1px solid color-mix(in srgb, ${colors.heading} 22%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, ${colors.surface} 72%, transparent);
  backdrop-filter: blur(12px);
  .dark & {
    background: color-mix(in srgb, ${colors.heading} 9%, transparent);
  }
  @media ${({ theme }) => theme.media.compact} {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 2fr);
    gap: 10px;
    padding: 10px 12px;
  }
`;
const Price = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  strong {
    font-size: clamp(26px, 4.7dvh, 44px);
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    line-height: 1.1;
    letter-spacing: -0.04em;
  }
  del {
    font-size: clamp(12px, 1.8dvh, 18px);
    color: ${colors.muted};
  }
  span {
    flex-basis: 100%;
    font-size: clamp(9px, 1.4dvh, 12px);
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    letter-spacing: 0.08em;
  }
`;
const Details = styled.div`
  display: grid;
  gap: 4px;
  p { font-size: clamp(11px, 1.7dvh, 14px); line-height: 1.4; }
`;
const Terms = styled(Text)`
  display: block;
  margin-top: 6px;
  font-size: clamp(10px, 1.5dvh, 12px);
  :root:not(.dark) & {
    width: fit-content;
    max-width: 100%;
    color: ${colors.heading};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    background: color-mix(in srgb, ${colors.action} 10%, transparent);
    backdrop-filter: blur(14px);
    border-radius: 6px;
    box-shadow: 0 0 0 3px color-mix(in srgb, ${colors.action} 10%, transparent);
  }
`;

export function EarlyAccessOffer() {
  return (
    <Offer aria-label="Founding member offer">
      <Card>
        <Price>
          <strong>₹999</strong>
          <del>₹1,999</del>
          <span>FIRST YEAR</span>
        </Price>
        <Details>
          <Text as="p" weight="semibold" tone="heading">
            Founding price for the first 1,000 on the list
          </Text>
          <Text as="p">
            Join now, pay nothing today. Your founding price is held until
            launch day.
          </Text>
        </Details>
      </Card>
      <Terms as="p" size="sm" tone="muted">
        Renews at ₹1,999 per year. Prices exclusive of GST.
      </Terms>
    </Offer>
  );
}
for (const component of [Offer, Card, Price, Details, Terms])
  component.defaultProps = { theme };
