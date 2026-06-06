import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/auth/login']);
      },
    });
  }
}
