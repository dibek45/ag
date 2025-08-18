// src/app/services/user-mode.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'guest' | 'registered' | 'premium';

const LS_TOKEN = 'token';
const LS_LOCAL_UID = 'localUserId';

@Injectable({ providedIn: 'root' })
export class UserModeService {

  isPremium(): boolean {
    const token = localStorage.getItem(LS_TOKEN);
    if (!token) return false;
    try {
      const d: any = jwtDecode(token);
      // 🔧 Ajusta estos claims a tu backend si cambian
      const role = (d.role ?? d.roles?.[0] ?? '').toString().toLowerCase();
      const premiumFlag = Boolean(d.isPremium ?? d.premium);
      return premiumFlag || role === 'premium';
    } catch {
      return false;
    }
  }

  role(): UserRole {
    const token = localStorage.getItem(LS_TOKEN);
    if (!token) return 'guest';
    try {
      const d: any = jwtDecode(token);
      const premium = this.isPremium();
      if (premium) return 'premium';
      return 'registered';
    } catch {
      return 'guest';
    }
  }

  uid(): string {
    const token = localStorage.getItem(LS_TOKEN);
    if (token) {
      try {
        const d: any = jwtDecode(token);
        // 🔧 Ajusta el claim correcto para el id
        return String(d.sub ?? d.userId ?? d.id ?? d.uid ?? this.ensureLocalUid());
      } catch {
        return this.ensureLocalUid();
      }
    }
    return this.ensureLocalUid();
  }

  private ensureLocalUid(): string {
    let uid = localStorage.getItem(LS_LOCAL_UID);
    if (!uid) {
      // @ts-ignore
      uid = (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
      localStorage.setItem(LS_LOCAL_UID, uid);
    }
    return uid;
  }
}
