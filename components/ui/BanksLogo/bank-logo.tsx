// src/utils/bankLogos.ts
type BankLogo = {
  light: string
  dark?: string
  alt: string
}

export const bankLogos: Record<string, BankLogo> = {
  "Zenith Bank": {
    light: "/Banks/zenith.svg",
    dark: "/Banks/zenith.svg",
    alt: "Zenith Bank Logo",
  },
  "Otech MFB": {
    light: "/otech logo.svg",
    dark: "/otech logo.svg",
    alt: "Otech MFB Logo",
  },
  "Access Bank": {
    light: "/Banks/access.svg",
    dark: "/Banks/access.svg",
    alt: "Access Bank Logo",
  },
  "Polaris Bank": {
    light: "/Banks/polaris.svg",
    dark: "/Banks/polaris.svg",
    alt: "Polaris Bank Logo",
  },
  "ALAT by WEMA": {
    light: "/Banks/alat.svg",
    dark: "/Banks/alat.svg",
    alt: "ALAT Bank Logo",
  },
  "Aso Savings": {
    light: "/Banks/aso.svg",
    dark: "/Banks/aso.svg",
    alt: "Aso Bank Logo",
  },
  "Bowen MFB": {
    light: "/Banks/bowen.svg",
    dark: "/Banks/bowen.svg",
    alt: "BowenMFB Bank Logo",
  },
  "Citi Bank": {
    light: "/Banks/citibank.svg",
    dark: "/Banks/citibank.svg",
    alt: "Citi Bank Logo",
  },
  Ecobank: {
    light: "/Banks/ecobank.svg",
    dark: "/Banks/ecobank.svg",
    alt: "Ecobank Logo",
  },
  "Ekondo MFB": {
    light: "/Banks/ekondo.svg",
    dark: "/Banks/ekondo.svg",
    alt: "EkondoMFB Logo",
  },
  "Fidelity Bank": {
    light: "/Banks/fidelity.svg",
    dark: "/Banks/fidelity.svg",
    alt: "Fidelity Logo",
  },
  "First Bank": {
    light: "/Banks/firstbank.svg",
    dark: "/Banks/firstbank.svg",
    alt: "First Bank Logo",
  },
  FCMB: {
    light: "/Banks/fcmb.svg",
    dark: "/Banks/fcmb.svg",
    alt: "FCMB",
  },
  "Globus Bank": {
    light: "/Banks/globus.svg",
    dark: "/Banks/globus.svg",
    alt: "FCMB",
  },
  GTBank: {
    light: "/Banks/gtbank.svg",
    dark: "/Banks/gtbank.svg",
    alt: "FCMB",
  },
  "Heritage Bank": {
    light: "/Banks/heritage.svg",
    dark: "/Banks/heritage.svg",
    alt: "FCMB",
  },
  "Jaiz Bank": {
    light: "/Banks/jaiz.svg",
    dark: "/Banks/jaiz.svg",
    alt: "FCMB",
  },
  "Keystone Bank": {
    light: "/Banks/keystone.svg",
    dark: "/Banks/keystone.svg",
    alt: "FCMB",
  },
  "Kuda Bank": {
    light: "/Banks/kuda.svg",
    dark: "/Banks/kuda.svg",
    alt: "FCMB",
  },
  "One Finance": {
    light: "/Banks/one.svg",
    dark: "/Banks/one.svg",
    alt: "FCMB",
  },
  Paga: {
    light: "/Banks/paga.svg",
    dark: "/Banks/paga.svg",
    alt: "Paga",
  },
  "Parallex Bank": {
    light: "/Banks/parallex.svg",
    dark: "/Banks/parallex.svg",
    alt: "Parallex Bank",
  },
  PayCom: {
    light: "/Banks/paycom.svg",
    dark: "/Banks/paycom.svg",
    alt: "PayCom",
  },
  "Providus Bank": {
    light: "/Banks/providus.svg",
    dark: "/Banks/providus.svg",
    alt: "PayCom",
  },
  "Rubies MFB": {
    light: "/Banks/rubies.svg",
    dark: "/Banks/rubies.svg",
    alt: "PayCom",
  },
  "Sparkle MFB": {
    light: "/Banks/sparkle.svg",
    dark: "/Banks/sparkle.svg",
    alt: "Sparkle MFB",
  },
  "Stanbic IBTC Bank": {
    light: "/Banks/stanbic.svg",
    dark: "/Banks/stanbic.svg",
    alt: "Stanbic IBTC Bank",
  },
  "Standard Chartered Bank": {
    light: "/Banks/standard.svg",
    dark: "/Banks/standard.svg",
    alt: "Standard Chartered Bank",
  },
  "Sterling Bank": {
    light: "/Banks/sterling.svg",
    dark: "/Banks/sterling.svg",
    alt: "Sterling Bank",
  },
  "Suntrust Bank": {
    light: "/Banks/suntrust.svg",
    dark: "/Banks/suntrust.svg",
    alt: "Suntrust Bank",
  },
  "TAJ Bank": {
    light: "/Banks/taj.svg",
    dark: "/Banks/taj.svg",
    alt: "TAJ Bank",
  },
  "TCF MFB": {
    light: "/Banks/tcf.svg",
    dark: "/Banks/tcf.svg",
    alt: "TCF Bank",
  },
  "Titan Trust Bank": {
    light: "/Banks/titan.svg",
    dark: "/Banks/titan.svg",
    alt: "Titan Trust Bank",
  },
  "Union Bank": {
    light: "/Banks/union.svg",
    dark: "/Banks/union.svg",
    alt: "Union Bank",
  },
  "UBA Bank": {
    light: "/Banks/uba.svg",
    dark: "/Banks/uba.svg",
    alt: "UBA Bank",
  },
  "Unity Bank": {
    light: "/Banks/unity.svg",
    dark: "/Banks/unity.svg",
    alt: "Unity Bank",
  },
  VFD: {
    light: "/Banks/vfd.svg",
    dark: "/Banks/vfd.svg",
    alt: "Unity Bank",
  },
  "Wema bank": {
    light: "/Banks/wema.svg",
    dark: "/Banks/wema.svg",
    alt: "Wema Bank",
  },
}

export const getBankLogo = (bankName: string): BankLogo | undefined => {
  return bankLogos[bankName]
}
