/*
  Alpha Vault Financial System
  
  @author Mohamed Dhaoui
  @component SavingComponent
  @description Main saving dashboard component tests for managing saving goals
*/

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingComponent } from './saving.component';

describe('SavingComponent', () => {
  let component: SavingComponent;
  let fixture: ComponentFixture<SavingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
