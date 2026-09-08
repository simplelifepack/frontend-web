type BrandLogoProps = {
  height?: number;
  className?: string;
};

export default function BrandLogo({ height = 40, className }: BrandLogoProps) {
  return (
    <img
      src="/readiness-logo.png"
      alt="Readiness"
      width={1448}
      height={1086}
      className={className}
      style={{ display: "block", width: "auto", height, maxWidth: "100%", objectFit: "contain", flexShrink: 0 }}
    />
  );
}
