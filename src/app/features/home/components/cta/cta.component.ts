import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

/**
 * Call-to-Action Component
 * 
 * Displays a prominent call-to-action section on the landing page,
 * encouraging users to sign up for Alpha Vault.
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CtaComponent {
  private readonly router = inject(Router);

  /**
   * Navigates to the authentication page
   * Used for keyboard navigation support
   */
  public navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
}
