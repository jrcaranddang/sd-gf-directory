import { useCallback, useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { hasProEntitlement } from '@/lib/revenuecat';

/**
 * Tracks the `pro` entitlement in local state and keeps it fresh via the
 * RevenueCat customerInfo listener. Used to decide whether to show the paywall
 * on Generate (the client check is a UX shortcut; create-job re-verifies).
 */
export function useEntitlement() {
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPro(hasProEntitlement(info));
    } catch {
      setIsPro(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const listener = (info: CustomerInfo) => setIsPro(hasProEntitlement(info));
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [refresh]);

  return { isPro, ready, refresh };
}
