import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';

export const PRO_ENTITLEMENT = 'pro';

let configured = false;

/**
 * Configure RevenueCat with the Supabase user id as the app user id so the
 * server (create-job) can look up entitlement by the same id. Idempotent.
 */
export async function configureRevenueCat(appUserId: string): Promise<void> {
  if (configured) {
    await Purchases.logIn(appUserId);
    return;
  }
  const apiKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

  if (!apiKey) {
    console.warn('[revenuecat] missing API key — payments disabled in this build');
    return;
  }

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey, appUserID: appUserId });
  configured = true;
}

export function hasProEntitlement(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[PRO_ENTITLEMENT];
}

export async function getCurrentEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return hasProEntitlement(info);
  } catch {
    return false;
  }
}

export async function getDefaultOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.warn('[revenuecat] getOfferings failed', e);
    return null;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return hasProEntitlement(info);
}
