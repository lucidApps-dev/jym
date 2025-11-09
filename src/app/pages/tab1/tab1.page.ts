import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'jym-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    ButtonComponent,
    TranslatePipe,
  ],
  standalone: true,
})
export class Tab1Page {
  private readonly authService = inject(AuthService);

  public readonly currentUser = this.authService.currentUser;
  public readonly user$ = this.authService.user$;

  constructor() {
    addIcons({ chevronForwardOutline });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
