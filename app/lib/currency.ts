// Conversion des prix (yens) vers la monnaie locale du visiteur. Les paiements restent toujours facturés en JPY :
// l'affichage converti est indicatif. Fonctions pures, testées dans currency.test.ts.

// Pays (ISO 3166-1 alpha-2) → monnaie (ISO 4217).
const COUNTRY_CURRENCY =
  "AD:EUR,AE:AED,AF:AFN,AG:XCD,AI:XCD,AL:ALL,AM:AMD,AO:AOA,AR:ARS,AS:USD,AT:EUR,AU:AUD,AW:AWG,AX:EUR,AZ:AZN," +
  "BA:BAM,BB:BBD,BD:BDT,BE:EUR,BF:XOF,BG:BGN,BH:BHD,BI:BIF,BJ:XOF,BL:EUR,BM:BMD,BN:BND,BO:BOB,BQ:USD,BR:BRL,BS:BSD,BT:BTN,BW:BWP,BY:BYN,BZ:BZD," +
  "CA:CAD,CC:AUD,CD:CDF,CF:XAF,CG:XAF,CH:CHF,CI:XOF,CK:NZD,CL:CLP,CM:XAF,CN:CNY,CO:COP,CR:CRC,CU:CUP,CV:CVE,CW:ANG,CX:AUD,CY:EUR,CZ:CZK," +
  "DE:EUR,DJ:DJF,DK:DKK,DM:XCD,DO:DOP,DZ:DZD,EC:USD,EE:EUR,EG:EGP,EH:MAD,ER:ERN,ES:EUR,ET:ETB,FI:EUR,FJ:FJD,FK:FKP,FM:USD,FO:DKK,FR:EUR," +
  "GA:XAF,GB:GBP,GD:XCD,GE:GEL,GF:EUR,GG:GBP,GH:GHS,GI:GIP,GL:DKK,GM:GMD,GN:GNF,GP:EUR,GQ:XAF,GR:EUR,GT:GTQ,GU:USD,GW:XOF,GY:GYD," +
  "HK:HKD,HN:HNL,HR:EUR,HT:HTG,HU:HUF,ID:IDR,IE:EUR,IL:ILS,IM:GBP,IN:INR,IO:USD,IQ:IQD,IR:IRR,IS:ISK,IT:EUR,JE:GBP,JM:JMD,JO:JOD,JP:JPY," +
  "KE:KES,KG:KGS,KH:KHR,KI:AUD,KM:KMF,KN:XCD,KP:KPW,KR:KRW,KW:KWD,KY:KYD,KZ:KZT,LA:LAK,LB:LBP,LC:XCD,LI:CHF,LK:LKR,LR:LRD,LS:LSL,LT:EUR,LU:EUR,LV:EUR,LY:LYD," +
  "MA:MAD,MC:EUR,MD:MDL,ME:EUR,MF:EUR,MG:MGA,MH:USD,MK:MKD,ML:XOF,MM:MMK,MN:MNT,MO:MOP,MP:USD,MQ:EUR,MR:MRU,MS:XCD,MT:EUR,MU:MUR,MV:MVR,MW:MWK,MX:MXN,MY:MYR,MZ:MZN," +
  "NA:NAD,NC:XPF,NE:XOF,NF:AUD,NG:NGN,NI:NIO,NL:EUR,NO:NOK,NP:NPR,NR:AUD,NU:NZD,NZ:NZD,OM:OMR,PA:PAB,PE:PEN,PF:XPF,PG:PGK,PH:PHP,PK:PKR,PL:PLN,PM:EUR,PN:NZD,PR:USD,PS:ILS,PT:EUR,PW:USD,PY:PYG," +
  "QA:QAR,RE:EUR,RO:RON,RS:RSD,RU:RUB,RW:RWF,SA:SAR,SB:SBD,SC:SCR,SD:SDG,SE:SEK,SG:SGD,SH:SHP,SI:EUR,SJ:NOK,SK:EUR,SL:SLE,SM:EUR,SN:XOF,SO:SOS,SR:SRD,SS:SSP,ST:STN,SV:USD,SX:ANG,SY:SYP,SZ:SZL," +
  "TC:USD,TD:XAF,TF:EUR,TG:XOF,TH:THB,TJ:TJS,TK:NZD,TL:USD,TM:TMT,TN:TND,TO:TOP,TR:TRY,TT:TTD,TV:AUD,TW:TWD,TZ:TZS,UA:UAH,UG:UGX,UM:USD,US:USD,UY:UYU,UZ:UZS," +
  "VA:EUR,VC:XCD,VE:VES,VG:USD,VI:USD,VN:VND,VU:VUV,WF:XPF,WS:WST,XK:EUR,YE:YER,YT:EUR,ZA:ZAR,ZM:ZMW,ZW:USD";

export const COUNTRY_TO_CURRENCY: Record<string, string> = Object.fromEntries(COUNTRY_CURRENCY.split(",").map((p) => p.split(":")));

/** Monnaie d'un pays (« US » → « USD »), ou null si le pays est inconnu. */
export function currencyForCountry(country?: string | null): string | null {
  if (!country) return null;
  return COUNTRY_TO_CURRENCY[country.trim().toUpperCase()] || null;
}

/** Pays déduit d'une langue de navigateur (« fr-CA » → « CA »), ou null. */
export function countryFromLocale(locale?: string | null): string | null {
  const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(locale || "");
  return m ? m[1].toUpperCase() : null;
}

/** Montant en yens converti puis formaté dans la monnaie voulue (« 4000 », 0.0066, « USD » → « $26.40 »). */
export function formatMoney(jpy: number, rate: number, currency: string, locale?: string): string {
  const amount = jpy * rate;
  try {
    return new Intl.NumberFormat(locale || undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 100 ? 0 : undefined,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString(locale || undefined)}`;
  }
}

/**
 * Remplace chaque montant « ¥4,000 » d'un texte par sa conversion (« $26.40 »). Les autres mots restent tels quels.
 * Sans monnaie, taux invalide ou JPY, le texte est rendu inchangé.
 */
export function convertYenText(text: string, rate: number | null | undefined, currency: string | null | undefined, locale?: string): string {
  if (!currency || currency === "JPY" || !rate || !(rate > 0)) return text;
  return text.replace(/¥\s?(\d{1,3}(?:,\d{3})+|\d+)/g, (_, n) => formatMoney(Number(n.replace(/,/g, "")), rate, currency, locale));
}

/** Vrai quand le texte contient au moins un montant en yens. */
export function hasYen(text: string): boolean {
  return /¥\s?\d/.test(text);
}
