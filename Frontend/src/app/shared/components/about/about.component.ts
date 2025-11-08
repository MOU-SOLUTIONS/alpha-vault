import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

/**
 * About Component - Displays information about Alpha Vault and the team
 * 
 * Features:
 * - Mission and story sections
 * - Team member showcase with photos
 * - Responsive grid layout
 * 
 * @component
 * @standalone
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}