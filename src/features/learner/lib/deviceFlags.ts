/** One-time screens remembered on this device. Private browsing may forget them, which only repeats a soft prompt. */
export const DEVICE_FLAGS = {
  addressSkipped: "gamlish-address-skipped",
  welcomeOfferSeen: "gamlish-offer-welcome-seen",
  awaitingApproval: "gamlish-awaiting-approval",
  languageHintSeen: "gamlish-language-hint-seen",
} as const;

type DeviceFlag = (typeof DEVICE_FLAGS)[keyof typeof DEVICE_FLAGS];

export function readFlag(flag: DeviceFlag): boolean {
  try {
    return window.localStorage.getItem(flag) === "1";
  } catch {
    return false;
  }
}

export function writeFlag(flag: DeviceFlag, on: boolean): void {
  try {
    if (on) window.localStorage.setItem(flag, "1");
    else window.localStorage.removeItem(flag);
  } catch {
    // Storage blocked: the prompt may show again next visit.
  }
}
