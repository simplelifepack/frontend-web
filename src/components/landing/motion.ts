export const fade = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.6, delay: d, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
});