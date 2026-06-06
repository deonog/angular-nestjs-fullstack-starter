import { computed, Injectable, signal } from '@angular/core';
import { AuthUser } from '@angular-nestjs-fullstack-starter/shared/types';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly session = signal<AuthUser | null>(null);

  readonly user = this.session.asReadonly();
  readonly isAuthenticated = computed(() => this.session() !== null);

  setUser(user: AuthUser | null): void {
    this.session.set(user);
  }

  clearUser(): void {
    this.session.set(null);
  }
}
