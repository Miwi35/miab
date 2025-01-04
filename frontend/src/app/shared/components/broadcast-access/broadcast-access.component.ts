import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-broadcast-access',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './broadcast-access.component.html',
  styleUrls: ['./broadcast-access.component.scss']
})
export class BroadcastAccessComponent {
  urlPath = '';
  isUrlValid = false;

  validateUrl() {
    this.isUrlValid = this.urlPath.length >= 3 && /^[a-zA-Z0-9-]+$/.test(this.urlPath);
  }

  onConnect() {
    if (this.isUrlValid) {
      window.location.href = `${environment.baseUrl}/${this.urlPath}`;
    }
  }
} 