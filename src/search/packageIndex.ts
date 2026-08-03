import { packageAliases } from "./aliases";
import { genericKeywordWeights } from "./keywordWeights";
import type { PackageKeywordEntry } from "./types";

export const packageIndex: PackageKeywordEntry[] = [
  entry("home-loan", "Home Loan", ["home loan", "loan documents"], { home: 10, loan: 8, mortgage: 8, housing: 8 }),
  entry("passport-application-pack", "Passport Application Pack", ["travel document"], { passport: 10, travel: 5 }),
  entry("passport-renewal", "Passport Renewal", [], { passport: 10, renewal: 8, renew: 8 }),
  entry("schengen-visa", "Schengen Visa", [], { schengen: 10, europe: 8, visa: 8 }),
  entry("us-visa", "US Visa", [], { usa: 10, us: 8, america: 6, american: 6, visitor: 7, visa: 8 }),
  entry("hospital-admission", "Hospital Admission", ["medical admission"], { hospital: 10, admission: 8, medical: 6 }),
  entry("birth-certificate", "Birth Certificate", ["birth registration"], { birth: 10 }),
  entry("marriage-certificate", "Marriage Certificate", [], { marriage: 10 }),
  entry("marriage-registration", "Marriage Registration", ["register marriage"], { marriage: 10, registration: 7 }),
  entry("income-tax-filing", "Income Tax Filing", ["tax filing", "itr filing"], { income: 6, tax: 10, itr: 10, filing: 7 }),
  entry("car-loan", "Car Loan", ["auto loan", "vehicle loan"], { car: 10, auto: 8, vehicle: 7, loan: 8 }),
  entry("driving-licence-renewal", "Driving Licence Renewal", [], { driving: 8, licence: 8, license: 8, renewal: 8, dl: 8 }),
  entry("pan-card", "PAN Card", ["permanent account number"], { pan: 10 }),
  entry("aadhaar-card", "Aadhaar Card", ["aadhar", "uidai"], { aadhaar: 10, aadhar: 10, uidai: 10 }),
  entry("tourist-visa", "Tourist Visa", ["travel visa"], { tourist: 10, travel: 6, visa: 8 }),
  entry("travel-insurance", "Travel Insurance", ["travel cover", "overseas insurance"], { travel: 7, overseas: 7, insurance: 9 }),
  entry("death-certificate", "Death Certificate", ["death registration"], { death: 10 }),
  entry("legacy-planning", "Legacy Planning", ["estate planning", "bereavement documents"], { legacy: 10, estate: 8, bereavement: 10 }),
];

function entry(slug: string, title: string, aliases: string[], keywords: Record<string, number>): PackageKeywordEntry {
  return {
    slug,
    title,
    aliases: [...(packageAliases[slug] ?? []), ...aliases],
    keywords: { ...genericKeywordWeights, ...keywords },
  };
}
