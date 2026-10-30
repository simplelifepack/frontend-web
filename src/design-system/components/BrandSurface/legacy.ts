import { lightColorTokens } from "../../variables/colorTokens";
import { css } from "styled-components";
import { landingBrand as C } from "../../variables/brand";
// Approved decorative rules restored verbatim, scoped by BrandSurface; static-card hover rules omitted.
export const approvedLandingStyles = css`


&{background:${C.paper};color:${C.ink};overflow-x:hidden}
& *{box-sizing:border-box}
& a{text-decoration:none;color:inherit}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.lp-eyebrow{letter-spacing:.18em;text-transform:uppercase;color:${C.action}}
.lp-h1{letter-spacing:-1.6px;color:${C.ink};margin:20px 0 0}
.lp-h2{letter-spacing:-.5px;color:${C.ink};margin:10px 0 0}
.lp-h3{letter-spacing:-.5px;color:${C.ink};margin:8px 0 0}
.lp-body{color:${C.body}}
.lp-tag{display:inline-flex;align-items:center;gap:5px;color:${C.body};background:${C.panel2};border:1px solid ${C.border};border-radius:8px;padding:5px 9px}
.lp-nav{position:sticky;top:0;z-index:var(--layer-navigation);background:${C.paper}d9;backdrop-filter:blur(12px);border-bottom:1px solid ${C.border}}
.lp-navinner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.lp-navlinks{display:flex;gap:28px;font-size:var(--text-md);color:${C.body}}
.lp-navlinks a:hover{color:${C.ink}}
.lp-hero{position:relative;padding:60px 0 40px;overflow:hidden}
.lp-herobg{position:absolute;inset:0;pointer-events:none}
.lp-heroinner{position:relative;max-width:1120px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
.lp-badge{display:inline-flex;align-items:center;gap:7px;letter-spacing:1.5px;text-transform:uppercase;color:${C.action};background:${C.actionSoft};border:1px solid ${C.action}44;border-radius:20px;padding:6px 13px}
.lp-sub{color:${C.body};margin-top:22px;max-width:540px}
.lp-herocta{display:flex;gap:18px;align-items:center;margin-top:30px;flex-wrap:wrap}
.lp-trust{display:inline-flex;align-items:center;gap:7px;letter-spacing:.4px;color:${C.muted}}
.lp-heromock{position:relative}
.lp-mock{background:${C.panel};border:1px solid ${C.border};border-radius:18px;box-shadow:0 30px 70px ${lightColorTokens["shadow-soft"]}}
.lp-heromock:before{content:"";position:absolute;inset:-30px;background:radial-gradient(circle at 60% 45%,${C.action}44,transparent 66%);filter:blur(30px);z-index:-1}
.lp-connectors{max-width:1120px;margin:48px auto 0;padding:0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;color:${C.muted};font-size:var(--text-md)}
.lp-conn{display:inline-flex;align-items:center;gap:7px;color:${C.body};background:${C.panel};border:1px solid ${C.border};border-radius:20px;padding:7px 14px}
.lp-moments{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.lp-moment{background:${C.panel};border:1px solid ${C.border};border-radius:16px;overflow:hidden;box-shadow:0 14px 34px ${lightColorTokens["shadow-soft"]};}

.lp-momentimg{position:relative;height:172px;overflow:hidden}
.lp-momentimg>div{}

@media(max-width:640px){.lp-momentimg{height:150px}}
.lp-momentchip{display:inline-flex;align-items:center;gap:7px;background:${C.paper};border:1px solid ${C.border};border-radius:99px;padding:4px 11px;color:${C.ink}}
.lp-band{padding:84px 0}
.lp-band:nth-of-type(even){background:${C.paperDeep}}
.lp-features{padding:92px 24px;display:grid;gap:104px}
.lp-feature{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-step{background:${C.panel};border:1px solid ${C.border};border-radius:16px;padding:22px;box-shadow:0 12px 30px ${lightColorTokens["shadow-soft"]}}
.lp-privacy{text-align:center;padding:92px 0}
.lp-finalcta{position:relative;overflow:hidden;background:${C.panel};border:1px solid ${C.border};border-radius:24px;padding:64px 32px;text-align:center;margin:40px 0 92px;box-shadow:0 24px 60px ${lightColorTokens["shadow-soft"]}}
.lp-footer{border-top:1px solid ${C.border};padding:32px 0}
.lp-footinner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.lp-caret{width:2px;height:15px;background:${C.action};display:inline-block;animation:lpblink 1s steps(2) infinite}
@keyframes lpblink{0%,50%{opacity:1}51%,100%{opacity:0}}
@media(max-width:860px){
  .lp-navlinks{display:none}
  .lp-heroinner{grid-template-columns:1fr;gap:36px}
  .lp-heromock{max-width:460px;margin:0 auto;width:100%}
  .lp-h1{}
  .lp-feature{grid-template-columns:1fr!important;gap:28px;direction:ltr!important}
  .lp-steps{grid-template-columns:1fr}
  .lp-features{gap:68px;padding:68px 24px}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
`;
