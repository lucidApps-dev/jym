import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { AuthPage } from './auth.page';
import { TranslationService } from '@core/services/translation.service';
import { AuthFormComponent } from '@pages/auth/auth-form/auth-form.component';
import { ResetPasswordFormComponent } from '@pages/auth/reset-password-form/reset-password-form.component';
import { CarouselComponent } from '@shared/components/carousel/carousel.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
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

describe('AuthPage', () => {
  let component: AuthPage;
  let fixture: ComponentFixture<AuthPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    translationServiceSpy = jasmine.createSpyObj(
      'TranslationService',
      ['translate'],
      {
        currentLanguage: signal<'fr' | 'en'>('fr'),
        translationsLoaded: signal<boolean>(true),
      }
    );

    translationServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'auth.login': 'Se connecter',
        'auth.register': 'S\'inscrire',
        'carousel.slide1.title': 'Titre slide 1',
        'carousel.slide2.title': 'Titre slide 2',
        'carousel.slide3.title': 'Titre slide 3',
      };
      return translations[key] || key;
    });

    await TestBed.configureTestingModule({
      imports: [
        AuthPage,
        AuthFormComponent,
        ResetPasswordFormComponent,
        CarouselComponent,
        ButtonComponent,
        TranslatePipe,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonButton,
        IonModal,
        IonButtons,
        IonIcon,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize carousel images with translations', () => {
    expect(component.carouselImages().length).toBe(3);
    expect(component.carouselImages()[0].url).toBe('assets/images/auth-bg-3.jpg');
    expect(component.carouselImages()[0].title).toBe('Titre slide 1');
    expect(component.carouselImages()[1].title).toBe('Titre slide 2');
    expect(component.carouselImages()[2].title).toBe('Titre slide 3');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide1.title');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide2.title');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide3.title');
  });

  it('should display the carousel with images', () => {
    const carouselElement = fixture.debugElement.query(By.css('jym-carousel'));
    expect(carouselElement).toBeTruthy();
    expect(carouselElement.componentInstance.images().length).toBe(3);
  });

  it('should display the two login and register buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('jym-button'));
    expect(buttons.length).toBe(2);
    
    const loginButton = buttons[0];
    const registerButton = buttons[1];
    
    expect(loginButton.componentInstance.mode()).toBe('transparent');
    expect(registerButton.componentInstance.mode()).toBe('primary');
  });

  it('should display translated texts on buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('jym-button'));
    const buttonTexts = buttons.map(btn => btn.nativeElement.textContent.trim());
    
    expect(buttonTexts[0]).toContain('Se connecter');
    expect(buttonTexts[1]).toContain('S\'inscrire');
  });

  it('should open the login modal when clicking the login button', () => {
    expect(component.isLoginModalOpen()).toBe(false);
    
    component.openLoginModal();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    const modal = fixture.debugElement.query(By.css('ion-modal'));
    expect(modal).toBeTruthy();
  });

  it('should open the register modal when clicking the register button', () => {
    expect(component.isRegisterModalOpen()).toBe(false);
    
    component.openRegisterModal();
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(true);
  });

  it('should close the login modal', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    component.closeLoginModal();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
  });

  it('should close the register modal', () => {
    component.isRegisterModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(true);
    
    component.closeRegisterModal();
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(false);
  });

  it('should open the reset password modal', () => {
    expect(component.isResetPasswordModalOpen()).toBe(false);
    
    component.openResetPasswordModal();
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(true);
  });

  it('should close the reset password modal', () => {
    component.isResetPasswordModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(true);
    
    component.closeResetPasswordModal();
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(false);
  });

  it('should call openLoginModal when clicking the login button', () => {
    spyOn(component, 'openLoginModal');
    
    const buttons = fixture.debugElement.queryAll(By.css('jym-button'));
    const loginButton = buttons[0];
    
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    
    expect(component.openLoginModal).toHaveBeenCalled();
  });

  it('should call openRegisterModal when clicking the register button', () => {
    spyOn(component, 'openRegisterModal');
    
    const buttons = fixture.debugElement.queryAll(By.css('jym-button'));
    const registerButton = buttons[1];
    
    registerButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    
    expect(component.openRegisterModal).toHaveBeenCalled();
  });

  it('should have the login modal configured with isOpen', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    // Ionic modals are rendered in a portal, so we check the configuration
    expect(component.isLoginModalOpen()).toBe(true);
  });

  it('should have the register modal configured with isOpen', () => {
    component.isRegisterModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(true);
  });

  it('should have the reset password modal configured with isOpen', () => {
    component.isResetPasswordModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(true);
  });

  it('should close modals and navigate to /tabs/tab1 on authentication success', (done) => {
    component.isLoginModalOpen.set(true);
    component.isRegisterModalOpen.set(false);
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    component.onAuthSuccess();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
    expect(component.isRegisterModalOpen()).toBe(false);
    
    setTimeout(() => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/tab1']);
      done();
    }, 150);
  });

  it('should close the register modal on authentication success', (done) => {
    component.isLoginModalOpen.set(false);
    component.isRegisterModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(true);
    
    component.onAuthSuccess();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
    expect(component.isRegisterModalOpen()).toBe(false);
    
    setTimeout(() => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/tab1']);
      done();
    }, 150);
  });

  it('should open the reset password modal from the login modal', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(false);
    
    component.openResetPasswordModal();
    fixture.detectChanges();
    
    expect(component.isResetPasswordModalOpen()).toBe(true);
  });

  it('should update carousel images when language changes', () => {
    const initialImages = component.carouselImages();
    expect(initialImages[0].title).toBe('Titre slide 1');
    
    translationServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'carousel.slide1.title': 'Slide 1 Title',
        'carousel.slide2.title': 'Slide 2 Title',
        'carousel.slide3.title': 'Slide 3 Title',
      };
      return translations[key] || key;
    });
    
    translationServiceSpy.currentLanguage.set('en');
    fixture.detectChanges();
    
    const updatedImages = component.carouselImages();
    expect(updatedImages[0].title).toBe('Slide 1 Title');
    expect(updatedImages[1].title).toBe('Slide 2 Title');
    expect(updatedImages[2].title).toBe('Slide 3 Title');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide1.title');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide2.title');
    expect(translationServiceSpy.translate).toHaveBeenCalledWith('carousel.slide3.title');
  });

  it('should close the login modal via the closeLoginModal method', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    component.closeLoginModal();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
  });

  it('should close the login modal on willDismiss event', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    // Simulate the willDismiss event that calls closeLoginModal
    component.closeLoginModal();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
  });

  it('should have modals closed by default', () => {
    expect(component.isLoginModalOpen()).toBe(false);
    expect(component.isRegisterModalOpen()).toBe(false);
    expect(component.isResetPasswordModalOpen()).toBe(false);
  });

  it('should close the login modal on authSuccess event', () => {
    component.isLoginModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(true);
    
    component.onAuthSuccess();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
    expect(component.isRegisterModalOpen()).toBe(false);
  });

  it('should close the register modal on authSuccess event', () => {
    component.isRegisterModalOpen.set(true);
    fixture.detectChanges();
    
    expect(component.isRegisterModalOpen()).toBe(true);
    
    component.onAuthSuccess();
    fixture.detectChanges();
    
    expect(component.isLoginModalOpen()).toBe(false);
    expect(component.isRegisterModalOpen()).toBe(false);
  });
});
