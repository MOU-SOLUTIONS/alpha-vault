/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @service SeoService
  @description Elite SEO service for centralized head tag management - parent-owned architecture
*/

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { PageMeta } from './page-meta.model';

/**
 * Centralized SEO service - single source of truth for head tag management
 * 
 * Architecture:
 * - Only parent/route components should call this service
 * - Children provide meta fragments via META_FRAGMENT token
 * - Single commit per page ensures SSR stability and prevents hydration mismatches
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly currentMeta = signal<PageMeta | null>(null);

  constructor(
    private readonly meta: Meta,
    private readonly title: Title,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  /**
   * Sets comprehensive page metadata
   * Called once per page by parent component
   * 
   * @param metaIn - Page metadata configuration
   * @param brand - Brand suffix for title (default: 'Alpha Vault')
   */
  set(metaIn: PageMeta, brand = 'Alpha Vault'): void {
    const fullTitle = metaIn.title ? `${metaIn.title} | ${brand}` : brand;
    
    // Guard browser-only APIs
    if (!this.isBrowser()) {
      return;
    }
    
    // Update title
    this.title.setTitle(fullTitle);

    // Basic meta tags
    this.upsert('name', 'description', metaIn.description ?? '');
    this.upsert('name', 'robots', metaIn.robots ?? 'index,follow');
    this.upsert('name', 'keywords', metaIn.keywords?.join(', ') ?? '');

    // Canonical URL
    const canonicalUrl = metaIn.canonicalUrl || this.doc.location?.href || '';
    this.setCanonical(canonicalUrl);

    // Open Graph
    const og = metaIn.og ?? {};
    this.upsert('property', 'og:title', og.title ?? metaIn.title ?? brand);
    this.upsert('property', 'og:description', og.description ?? metaIn.description ?? '');
    this.upsert('property', 'og:type', og.type ?? 'website');
    this.upsert('property', 'og:url', canonicalUrl);
    this.upsert('property', 'og:image', og.image ?? '');

    // Twitter Card
    const tw = metaIn.twitter ?? {};
    this.upsert('name', 'twitter:card', tw.card ?? 'summary_large_image');
    this.upsert('name', 'twitter:title', tw.title ?? metaIn.title ?? brand);
    this.upsert('name', 'twitter:description', tw.description ?? metaIn.description ?? '');
    this.upsert('name', 'twitter:image', tw.image ?? og.image ?? '');

    // JSON-LD structured data
    this.setJsonLd(metaIn.structuredData ?? null);

    // Store current meta for debugging/testing
    this.currentMeta.set(metaIn);
  }

  /**
   * Gets the current meta (for testing)
   */
  getCurrentMeta(): PageMeta | null {
    return this.currentMeta();
  }

  /**
   * Updates or removes a meta tag
   */
  private upsert(selectorKey: 'name' | 'property', selectorVal: string, content: string): void {
    if (!content) {
      this.meta.removeTag(`${selectorKey}="${selectorVal}"`);
      return;
    }
    this.meta.updateTag({ [selectorKey]: selectorVal, content }, `${selectorKey}="${selectorVal}"`);
  }

  /**
   * Sets canonical link (creates if doesn't exist)
   */
  private setCanonical(url: string): void {
    if (!this.doc.head) return;

    let link = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    
    const finalUrl = url || this.doc.location?.href || '';
    link.setAttribute('href', finalUrl);
  }

  /**
   * Sets JSON-LD structured data (replaces if exists)
   */
  private setJsonLd(obj: Record<string, any> | string | null): void {
    if (!this.doc.head) return;

    const id = 'ld-json';
    const existing = this.doc.head.querySelector(`#${id}`);
    
    if (!obj) {
      existing?.remove();
      return;
    }

    const script = (existing as HTMLScriptElement) ?? 
                   this.doc.head.appendChild(this.doc.createElement('script'));
    
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  }

  /**
   * SSR guard for browser-only APIs
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

