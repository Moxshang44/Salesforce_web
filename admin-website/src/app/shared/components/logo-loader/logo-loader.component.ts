import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-loader.component.html',
  styleUrl: './logo-loader.component.scss'
})
export class LogoLoaderComponent {
  @Input() message = 'Loading...';
  @Input() logoSrc = '/Japaate.svg';
  @Input() logoAlt = 'Loading';
}
