/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @module SEO Module
  @description SEO metadata models and injection token for parent-owned head, child fragments architecture
*/

import { InjectionToken } from '@angular/core';

/**
 * Open Graph metadata configuration
 */
export interface OgMeta {
  /** Page title for social sharing */
  title?: string;
  /** Page description for social sharing */
  description?: string;
  /** Image URL for social sharing (absolute URL) */
  image?: string;
  /** Content type (default: 'website') */
  type?: 'website' | 'article' | 'product' | string;
}

/**
 * Twitter Card metadata configuration
 */
export interface TwitterMeta {
  /** Card type (default: 'summary_large_image') */
  card?: 'summary' | 'summary_large_image';
  /** Title for Twitter */
  title?: string;
  /** Description for Twitter */
  description?: string;
  /** Image URL for Twitter */
  image?: string;
}

/**
 * Comprehensive page metadata model
 * Used by parent components to set SEO head tags
 */
export interface PageMeta {
  /** Page title (brand suffix added automatically by SeoService) */
  title: string;
  /** Meta description */
  description?: string;
  /** Keywords array (automatically joined) */
  keywords?: string[];
  /** Robots directive (e.g., 'index,follow') */
  robots?: string;
  /** Canonical URL (absolute or relative) */
  canonicalUrl?: string;
  /** Open Graph metadata */
  og?: OgMeta;
  /** Twitter Card metadata */
  twitter?: TwitterMeta;
  /** JSON-LD structured data (object, string, or null) */
  structuredData?: Record<string, any> | string | null;
}

/**
 * Injection token for child components to provide meta fragments
 * Parent components collect these fragments and commit to head once
 */
export const META_FRAGMENT = new InjectionToken<Partial<PageMeta>>('META_FRAGMENT');

