import { CommonModule } from '@angular/common';
import { Component, signal, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '@core/services/translation.service';
import { AuthFormComponent } from '@pages/auth/auth-form/auth-form.component';
import { ResetPasswordFormComponent } from '@pages/auth/reset-password-form/reset-password-form.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CarouselComponent, CarouselImage } from '@shared/components/carousel/carousel.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { close, chevronForwardOutline, helpCircleOutline } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'jym-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonModal,
    IonButtons,
    IonIcon,
    CarouselComponent,
    AuthFormComponent,
    ResetPasswordFormComponent,
    ButtonComponent,
    TranslatePipe,
  ],
})
export class AuthPage {
  private readonly router = inject(Router);
  public readonly translationService = inject(TranslationService);

  public readonly isLoginModalOpen = signal<boolean>(false);
  public readonly isRegisterModalOpen = signal<boolean>(false);
  public readonly isResetPasswordModalOpen = signal<boolean>(false);

  public readonly carouselImages = signal<CarouselImage[]>([]);

  constructor() {
    addIcons({ close, chevronForwardOutline, helpCircleOutline });
    this.updateCarouselImages();
    
    effect(() => {
      this.translationService.currentLanguage();
      this.updateCarouselImages();
    }, { allowSignalWrites: true });
  }

  private updateCarouselImages(): void {
    this.carouselImages.set([
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide1.title'),
        title: this.translationService.translate('carousel.slide1.title'),
      },
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide2.title'),
        title: this.translationService.translate('carousel.slide2.title'),
      },
      {
        url: 'assets/images/auth-bg-3.jpg',
        alt: this.translationService.translate('carousel.slide3.title'),
        title: this.translationService.translate('carousel.slide3.title'),
      },
    ]);
  }


  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  openRegisterModal(): void {
    this.isRegisterModalOpen.set(true);
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen.set(false);
  }

  openResetPasswordModal(): void {
    this.isResetPasswordModalOpen.set(true);
  }

  closeResetPasswordModal(): void {
    this.isResetPasswordModalOpen.set(false);
  }

  onAuthSuccess(): void {
    this.isLoginModalOpen.set(false);
    this.isRegisterModalOpen.set(false);
    
    setTimeout(() => {
      this.router.navigate(['/tabs/tab1']);
    }, 100);
  }
}
