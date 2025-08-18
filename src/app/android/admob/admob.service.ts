import { Injectable } from '@angular/core';
import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  RewardAdOptions,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

@Injectable({ providedIn: 'root' })
export class AdmobService {
  private readonly REWARD_KEY = 'premium_until';
  private loadingRewarded = false;
  private listenersAttached = false;

  // ✅ class field (not a top-level const)
  private readonly PREMIUM_MINUTES = 3; // change as you like

  constructor() {
    this.initializeAdMob();
  }

  async initializeAdMob() {
    try {
      console.log('[AdMob] initialize');
      await AdMob.initialize({ initializeForTesting: false });   //false para produccion

      // iOS-only; harmless on Android
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status === 'notDetermined') await AdMob.requestTrackingAuthorization();

      this.attachRewardedListenersOnce();
    } catch (e) {
      console.error('[AdMob] init error', e);
    }
  }

  private attachRewardedListenersOnce() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    AdMob.addListener(RewardAdPluginEvents.Loaded, () =>
      console.log('[AdMob][Rewarded] Loaded'),
    );
    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) =>
      console.warn('[AdMob][Rewarded] FailedToLoad', err),
    );
    AdMob.addListener(RewardAdPluginEvents.Showed, () =>
      console.log('[AdMob][Rewarded] Showed'),
    );
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () =>
      console.log('[AdMob][Rewarded] Dismissed'),
    );

    // ✅ use the constant here
    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
      console.log('[AdMob][Rewarded] Rewarded!', reward);
      this.activatePremium(this.PREMIUM_MINUTES);
    });
  }

  isPremiumActive(): boolean {
    const premiumUntil = localStorage.getItem(this.REWARD_KEY);
    return premiumUntil ? Date.now() < Number(premiumUntil) : false;
    // optional: also return false if within a small grace period, etc.
  }

  async showBanner() {
    try {
      if (this.isPremiumActive()) return;
      console.log('[AdMob] showBanner');
      await AdMob.showBanner({
        adId: 'ca-app-pub-8937999475308370/8842557980', // TEST banner
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
      });
    } catch (e) {
      console.error('[AdMob] showBanner error', e);
    }
  }

  async hideBanner() {
    try {
      console.log('[AdMob] hideBanner');
      await AdMob.hideBanner();
    } catch (e) {
      console.warn('[AdMob] hideBanner error', e);
    }
  }

  async showRewardedAd() {
    if (this.isPremiumActive()) {
      console.log('[AdMob][Rewarded] premium active, skip');
      return;
    }
    if (this.loadingRewarded) {
      console.log('[AdMob][Rewarded] already loading, skip tap');
      return;
    }

    this.loadingRewarded = true;
    try {
      console.log('[AdMob][Rewarded] prepare');
      const options: RewardAdOptions = {
        adId: 'ca-app-pub-8937999475308370/5035174914', // rewarded
        isTesting: true,
      };
      await AdMob.prepareRewardVideoAd(options);

      console.log('[AdMob][Rewarded] show');
      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error('[AdMob][Rewarded] error', e);
    } finally {
      this.loadingRewarded = false;
    }
  }

  activatePremium(minutes: number) {
    const until = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(this.REWARD_KEY, String(until));
    // Hide any active banner
    this.hideBanner().catch(() => {});
    console.log(`[AdMob] premium active for ${minutes} min`);
  }
}
