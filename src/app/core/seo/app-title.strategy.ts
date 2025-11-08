/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @strategy AppTitleStrategy
  @description Custom router title strategy for automatic title management
*/

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy } from '@angular/router';

import type { RouterStateSnapshot } from '@angular/router';

/**
 * Custom title strategy for Angular Router
 * Automatically applies title from route data with brand suffix
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) { 
    super(); 
  }

  /**
   * Updates the document title based on route data
   * Called automatically by Angular Router on navigation
   */
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const base = this.buildTitle(snapshot); // From route.data['title']
    if (base) {
      this.title.setTitle(`${base} | Alpha Vault`);
    }
  }
}

