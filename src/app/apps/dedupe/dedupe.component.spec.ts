import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DedupeComponent } from './dedupe.component';

describe('DedupeComponent', () => {
  let component: DedupeComponent;
  let fixture: ComponentFixture<DedupeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DedupeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DedupeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
