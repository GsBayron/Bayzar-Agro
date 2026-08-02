import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politicas-privacidad',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './politicas-privacidad.html',
  styleUrl: './politicas-privacidad.scss'
})
export class PoliticasPrivacidad {

}