import styled from "styled-components";
import { Text, colors } from "@/design-system";
import { theme } from "@/design-system/variables/theme";

const Offer = styled.aside`
  margin-top: 28px;
  max-width: 760px;
  color: ${colors.heading};
`;
const Card = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  padding: 22px 24px;
  border: 1px solid color-mix(in srgb, ${colors.heading} 22%, transparent);
  border-radius: 18px;
  background: color-mix(in srgb, ${colors.surface} 72%, transparent);
  backdrop-filter: blur(12px);
  .dark & {
    background: color-mix(in srgb, ${colors.heading} 9%, transparent);
  }
  @media ${({ theme }) => theme.media.tablet} {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 20px;
  }
`;
const Price = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  strong {
    font-size: 44px;
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    line-height: 1.1;
    letter-spacing: -0.04em;
  }
  del {
    font-size: 18px;
    color: ${colors.muted};
  }
  span {
    flex-basis: 100%;
    font-size: 12px;
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    letter-spacing: 0.08em;
  }
`;
const Details = styled.div`
  display: grid;
  gap: 6px;
`;
const Terms = styled(Text)`
  display: block;
  margin-top: 10px;
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
            Founding member price for the first 1,000 on the list
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
