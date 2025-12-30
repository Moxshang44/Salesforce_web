import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './components-demo.component.html',
  styleUrl: './components-demo.component.scss'
})
export class ComponentsDemoComponent {
  email = '';
  password = '';
  
  onSubmit() {
    console.log('Form submitted', { email: this.email, password: this.password });
  }
}

