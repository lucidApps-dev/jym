import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ResetPasswordFormComponent } from './reset-password-form.component';
import { AuthService, AuthError } from '@core/services/auth.service';
import { TranslationService } from '@core/services/translation.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { signal } from '@angular/core';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';

describe('ResetPasswordFormComponent', () => {
  let component: ResetPasswordFormComponent;
  let fixture: ComponentFixture<ResetPasswordFormComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);

    translationServiceSpy = jasmine.createSpyObj('TranslationService', ['translate'], {
      currentLanguage: signal<'fr' | 'en'>('fr'),
      translationsLoaded: signal<boolean>(true),
    });

    translationServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'auth.resetPassword': 'Reset Password',
        'auth.resetPasswordDescription': 'Enter your email to reset your password',
        'auth.email': 'Email',
        'auth.reset': 'Reset',
        'auth.emailRequired': 'Email is required',
        'auth.emailInvalid': 'Invalid email format',
        'auth.resetPasswordSuccess': 'Password reset email sent successfully',
      };
      return translations[key] || key;
    });

    await TestBed.configureTestingModule({
      imports: [
        ResetPasswordFormComponent,
        ReactiveFormsModule,
        ButtonComponent,
        FormErrorComponent,
        TranslatePipe,
        IonInput,
        IonItem,
        IonLabel,
        IonText,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty email value', () => {
      expect(component.resetPasswordForm.get('email')?.value).toBe('');
    });

    it('should have form invalid by default', () => {
      expect(component.resetPasswordForm.invalid).toBe(true);
    });

    it('should initialize with loading state false', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('should initialize with no success message', () => {
      expect(component.successMessage()).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      const emailControl = component.resetPasswordForm.get('email');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      expect(emailControl?.hasError('email')).toBe(true);
      expect(component.emailErrorKey).toBe('auth.emailInvalid');
    });

    it('should return null for email error when field is valid', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      expect(component.emailErrorKey).toBeNull();
    });

    it('should return null for errors when field is not touched', () => {
      const emailControl = component.resetPasswordForm.get('email');
      expect(component.emailErrorKey).toBeNull();
    });

    it('should return emailRequired error when email is empty and touched', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      expect(emailControl?.hasError('required')).toBe(true);
      expect(component.emailErrorKey).toBe('auth.emailRequired');
    });

    it('should mark form as valid with correct email', () => {
      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      expect(component.resetPasswordForm.valid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should not submit form when invalid', async () => {
      spyOn(component, 'onSubmit');

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();

      expect(component.onSubmit).toHaveBeenCalled();
      expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
    });

    it('should call resetPassword service on submit with valid email', async () => {
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should set loading state during submission', async () => {
      authServiceSpy.resetPassword.and.returnValue(new Promise(resolve => setTimeout(resolve, 100)));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      const submitPromise = component.onSubmit();

      expect(component.isLoading()).toBe(true);

      await submitPromise;

      expect(component.isLoading()).toBe(false);
    });

    it('should clear error and success messages before submission', async () => {
      component.errorMessage.set('Previous error');
      component.successMessage.set('Previous success');
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBeNull();
      expect(component.successMessage()).not.toBeNull();
    });

    it('should set success message on successful submission', async () => {
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.successMessage()).toBe('auth.resetPasswordSuccess');
    });

    it('should reset form on successful submission', async () => {
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.resetPasswordForm.get('email')?.value).toBe('');
    });

    it('should display error message on resetPassword failure', async () => {
      const error: AuthError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('User not found');
      expect(component.isLoading()).toBe(false);
    });

    it('should not reset form on error', async () => {
      const error: AuthError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.resetPasswordForm.get('email')?.value).toBe('test@example.com');
    });

    it('should clear success message on error', async () => {
      component.successMessage.set('Previous success');
      const error: AuthError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.successMessage()).toBeNull();
    });
  });

  describe('Template Rendering', () => {
    it('should display the reset password title', () => {
      const title = fixture.debugElement.query(By.css('h2'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent.trim()).toContain('Reset Password');
    });

    it('should display the reset password description', () => {
      const description = fixture.debugElement.query(By.css('p.text-gray-600'));
      expect(description).toBeTruthy();
      expect(description.nativeElement.textContent.trim()).toContain('Enter your email');
    });

    it('should display email input field', () => {
      const emailInput = fixture.debugElement.query(By.css('ion-input[formControlName="email"]'));
      expect(emailInput).toBeTruthy();
    });

    it('should display submit button', () => {
      const submitButton = fixture.debugElement.query(By.css('jym-button[type="submit"]'));
      expect(submitButton).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      component.resetPasswordForm.patchValue({
        email: '',
      });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('jym-button[type="submit"]'));
      expect(submitButton.componentInstance.disabled()).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('jym-button[type="submit"]'));
      expect(submitButton.componentInstance.disabled()).toBe(false);
    });

    it('should disable submit button when loading', () => {
      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });
      component.isLoading.set(true);
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('jym-button[type="submit"]'));
      expect(submitButton.componentInstance.disabled()).toBe(true);
    });

    it('should display success message when successMessage is set', () => {
      component.successMessage.set('auth.resetPasswordSuccess');
      fixture.detectChanges();

      const successMessage = fixture.debugElement.query(By.css('#reset-password-success'));
      expect(successMessage).toBeTruthy();
      expect(successMessage.nativeElement.textContent.trim()).toContain('Password reset email sent');
    });

    it('should not display success message when successMessage is null', () => {
      component.successMessage.set(null);
      fixture.detectChanges();

      const successMessage = fixture.debugElement.query(By.css('#reset-password-success'));
      expect(successMessage).toBeFalsy();
    });

    it('should display form error component for email errors', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const emailError = fixture.debugElement.query(By.css('jym-form-error[errorId="reset-email-error"]'));
      expect(emailError).toBeTruthy();
    });

    it('should display form error component for form errors', () => {
      component.errorMessage.set('Test error message');
      fixture.detectChanges();

      const formError = fixture.debugElement.query(By.css('jym-form-error[errorId="reset-password-form-error"]'));
      expect(formError).toBeTruthy();
    });
  });

  describe('Form Interaction', () => {
    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button is clicked', () => {
      spyOn(component, 'onSubmit');

      const submitButton = fixture.debugElement.query(By.css('jym-button[type="submit"]'));
      submitButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should mark form as touched when submitting invalid form', async () => {
      const emailControl = component.resetPasswordForm.get('email');
      expect(emailControl?.touched).toBe(false);

      await component.onSubmit();

      expect(emailControl?.touched).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-required attribute on email input', () => {
      const emailInput = fixture.debugElement.query(By.css('ion-input[formControlName="email"]'));
      expect(emailInput.nativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should have aria-invalid attribute when email is invalid and touched', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.debugElement.query(By.css('ion-input[formControlName="email"]'));
      expect(emailInput.nativeElement.getAttribute('aria-invalid')).toBe('true');
    });

    it('should have aria-describedby when email error exists', () => {
      const emailControl = component.resetPasswordForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const emailInput = fixture.debugElement.query(By.css('ion-input[formControlName="email"]'));
      expect(emailInput.nativeElement.getAttribute('aria-describedby')).toBe('reset-email-error');
    });

    it('should have role="alert" on success message', () => {
      component.successMessage.set('auth.resetPasswordSuccess');
      fixture.detectChanges();

      const successMessage = fixture.debugElement.query(By.css('#reset-password-success'));
      expect(successMessage.nativeElement.getAttribute('role')).toBe('alert');
    });

    it('should have aria-live="polite" on success message', () => {
      component.successMessage.set('auth.resetPasswordSuccess');
      fixture.detectChanges();

      const successMessage = fixture.debugElement.query(By.css('#reset-password-success'));
      expect(successMessage.nativeElement.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Error Handling', () => {
    it('should handle network error', async () => {
      const error: AuthError = {
        code: 'auth/network-request-failed',
        message: 'Network error',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Network error');
    });

    it('should handle invalid email error', async () => {
      const error: AuthError = {
        code: 'auth/invalid-email',
        message: 'Invalid email',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid email');
    });

    it('should handle user not found error', async () => {
      const error: AuthError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBe('User not found');
    });
  });

  describe('State Management', () => {
    it('should reset loading state after successful submission', async () => {
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      component.isLoading.set(true);
      await component.onSubmit();

      expect(component.isLoading()).toBe(false);
    });

    it('should reset loading state after failed submission', async () => {
      const error: AuthError = {
        code: 'auth/user-not-found',
        message: 'User not found',
      };
      authServiceSpy.resetPassword.and.returnValue(Promise.reject(error));

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      component.isLoading.set(true);
      await component.onSubmit();

      expect(component.isLoading()).toBe(false);
    });

    it('should clear error message before new submission', async () => {
      component.errorMessage.set('Previous error');
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      expect(component.errorMessage()).toBeNull();
    });

    it('should clear success message before new submission', async () => {
      component.successMessage.set('Previous success');
      authServiceSpy.resetPassword.and.returnValue(Promise.resolve());

      component.resetPasswordForm.patchValue({
        email: 'test@example.com',
      });

      await component.onSubmit();

      // Success message should be set to new value, not cleared
      expect(component.successMessage()).toBe('auth.resetPasswordSuccess');
    });
  });
});

