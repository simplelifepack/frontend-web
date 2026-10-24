import styled from "styled-components";
import { theme } from "../../variables/theme";

/** Contained media viewers retain their own scrolling and never widen a page. */
export const MediaViewport = styled.div`
  display: grid;
  place-items: center;
  max-height: ${({ theme }) =>
    `calc(${theme.spacing.s60} * 10 + ${theme.spacing.s20})`};
  overflow: auto;
  background: ${({ theme }) => theme.colors.background};
  & > img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;
export const EmbeddedPreview = styled.iframe`
  display: block;
  width: 100%;
  height: ${({ theme }) =>
    `calc(${theme.spacing.s60} * 10 + ${theme.spacing.s40})`};
  border: 0;
  background: ${({ theme }) => theme.colors.raised};
`;
MediaViewport.defaultProps = EmbeddedPreview.defaultProps = { theme };
