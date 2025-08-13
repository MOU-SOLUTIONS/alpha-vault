import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2 } from '@angular/core';
import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let rendererMock: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    rendererMock = jasmine.createSpyObj('Renderer2', [
      'addClass', 'createElement', 'appendChild', 'setStyle', 'removeChild', 'listen'
    ]);
    
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        { provide: Renderer2, useValue: rendererMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should show alert when playDemo is called', () => {
    spyOn(window, 'alert');
    component.playDemo();
    expect(window.alert).toHaveBeenCalledWith('Demo video will play here');
  });
});
