import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render the about section', () => {
      const section = fixture.nativeElement.querySelector('section.about');
      expect(section).toBeTruthy();
      expect(section.getAttribute('id')).toBe('about');
    });

    it('should render section header with title and description', () => {
      const header = fixture.nativeElement.querySelector('.section-header');
      expect(header).toBeTruthy();
      
      const h2 = header.querySelector('h2');
      const p = header.querySelector('p');
      
      expect(h2).toBeTruthy();
      expect(h2.textContent).toContain('About');
      expect(h2.textContent).toContain('Alpha Vault');
      expect(p).toBeTruthy();
      expect(p.textContent).toContain('Learn more about our mission');
    });

    it('should render about text section with mission and story', () => {
      const aboutText = fixture.nativeElement.querySelector('.about-text');
      expect(aboutText).toBeTruthy();
      
      const h3Elements = aboutText.querySelectorAll('h3');
      expect(h3Elements.length).toBe(2);
      expect(h3Elements[0].textContent).toContain('Our Mission');
      expect(h3Elements[1].textContent).toContain('Our Story');
    });

    it('should render team section with three members', () => {
      const teamSection = fixture.nativeElement.querySelector('.team-section');
      expect(teamSection).toBeTruthy();
      
      const h3 = teamSection.querySelector('h3');
      expect(h3).toBeTruthy();
      expect(h3.textContent).toContain('Meet Our Team');
      
      const teamMembers = teamSection.querySelectorAll('.team-member');
      expect(teamMembers.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const section = fixture.nativeElement.querySelector('section');
      expect(section).toBeTruthy();
      expect(section.tagName.toLowerCase()).toBe('section');
    });

    it('should have proper heading hierarchy', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      const h3Elements = fixture.nativeElement.querySelectorAll('h3');
      
      expect(h2).toBeTruthy();
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should have alt text on all images', () => {
      const images = fixture.nativeElement.querySelectorAll('img');
      expect(images.length).toBe(3);
      
      images.forEach((img: HTMLImageElement) => {
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(0);
      });
    });

    it('should have proper image attributes for optimization', () => {
      const images = fixture.nativeElement.querySelectorAll('img');
      
      images.forEach((img: HTMLImageElement) => {
        expect(img.getAttribute('width')).toBeTruthy();
        expect(img.getAttribute('height')).toBeTruthy();
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('decoding')).toBe('async');
      });
    });
  });

  describe('Team Members', () => {
    it('should display founder & CEO correctly', () => {
      const founder = fixture.nativeElement.querySelector('.founder-ceo');
      expect(founder).toBeTruthy();
      
      const h4 = founder.querySelector('h4');
      const p = founder.querySelector('p');
      
      expect(h4?.textContent).toContain('Amine Dhaoui');
      expect(p?.textContent).toContain('Founder & CEO');
    });

    it('should display lead developer correctly', () => {
      const members = fixture.nativeElement.querySelectorAll('.team-member');
      const developer = Array.from(members).find((member: HTMLElement) => 
        member.textContent?.includes('Imene Dhaoui')
      );
      
      expect(developer).toBeTruthy();
      const p = developer?.querySelector('p');
      expect(p?.textContent).toContain('Lead Developer');
    });

    it('should display CFO correctly', () => {
      const members = fixture.nativeElement.querySelectorAll('.team-member');
      const cfo = Array.from(members).find((member: HTMLElement) => 
        member.textContent?.includes('Wael Chtioui')
      );
      
      expect(cfo).toBeTruthy();
      const p = cfo?.querySelector('p');
      expect(p?.textContent).toContain('Chief Financial Officer');
    });
  });
});

