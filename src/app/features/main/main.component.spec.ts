/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component MainComponent
  @description Unit tests for main application layout component
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sidebar closed', () => {
    expect(component.sidebarOpen).toBeFalse();
  });

  it('should toggle sidebar state', () => {
    const initialState = component.sidebarOpen;
    component.toggleSidebar();
    expect(component.sidebarOpen).toBe(!initialState);
  });

  it('should close sidebar', () => {
    component.sidebarOpen = true;
    component.closeSidebar();
    expect(component.sidebarOpen).toBeFalse();
  });

  it('should track component loading states', () => {
    expect(component.componentsLoaded.navbar).toBeFalse();
    expect(component.componentsLoaded.sidebar).toBeFalse();
    expect(component.componentsLoaded.body).toBeFalse();
  });

  it('should mark components as loaded', () => {
    component.onComponentLoaded('navbar');
    expect(component.componentsLoaded.navbar).toBeTrue();
  });

  it('should handle component loading completion', () => {
    component.onComponentLoaded('navbar');
    component.onComponentLoaded('sidebar');
    component.onComponentLoaded('body');
    expect(component.isInitializing).toBeFalse();
  });
});
