/* ========== IMPORTS ========== */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ← add this
import { NavbarComponent } from '../navbar/navbar.component';
import { SidbarComponent } from '../sidbar/sidbar.component';
import { BodyComponent } from '../body/body.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, // ← and here
    NavbarComponent,
    SidbarComponent,
    BodyComponent,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
