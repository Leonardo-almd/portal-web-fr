import { Component } from '@angular/core';
import { PoInfoModule } from '@po-ui/ng-components';
import { PoPageModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [PoInfoModule, PoPageModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss'
})
export class AccessDeniedComponent {

}
