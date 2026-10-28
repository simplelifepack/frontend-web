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
  column-gap: clamp(10px, 1.5vw, 24px);
  row-gap: 8px;
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
  grid-column: 1 / -1;
  display: block;
  margin: 0;
  color: ${colors.text};
  font-size: clamp(12px, 1.7dvh, 14px);
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1.4;
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
        <Terms as="p" size="sm">
        Renews at ₹1,999 per year. Prices exclusive of GST.
        </Terms>
      </Card>
    </Offer>
  );
}
for (const component of [Offer, Card, Price, Details, Terms])
  component.defaultProps = { theme };
