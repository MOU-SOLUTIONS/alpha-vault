import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * FooterComponent - Application footer with links and copyright
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {}
