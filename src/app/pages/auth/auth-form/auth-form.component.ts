import { CommonModule } from '@angular/common';
import { Component, input, output, signal, inject, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, AuthError } from '@core/services/auth.service';
import { PlatformService } from '@core/services/platform.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple } from 'ionicons/icons';
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';

export type AuthMode = 'login' | 'register';

interface AuthFormValue {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'jym-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    TranslatePipe,
    ButtonComponent,
    FormErrorComponent,
  ],
})
export class AuthFormComponent {
  mode = input.required<AuthMode>();
  authSuccess = output<void>();
  openResetPassword = output<void>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly platformService = inject(PlatformService);

  public readonly authForm: FormGroup<AuthFormValue>;
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly isIphone = this.platformService.isIOS;

  public readonly titleKey = computed(() => 
    this.mode() === 'login' ? 'auth.login' : 'auth.createAccount'
  );

  public readonly submitButtonKey = computed(() => 
    this.mode() === 'login' ? 'auth.login' : 'auth.register'
  );

  public readonly googleButtonKey = computed(() => 
    this.mode() === 'login' ? 'auth.signInWithGoogle' : 'auth.signUpWithGoogle'
  );

  public readonly appleButtonKey = computed(() => 
    this.mode() === 'login' ? 'auth.signInWithApple' : 'auth.signUpWithApple'
  );

  public readonly formId = computed(() => `${this.mode()}-form`);

  public readonly emailInputId = computed(() => `${this.mode()}-email`);

  public readonly passwordInputId = computed(() => `${this.mode()}-password`);

  public readonly emailErrorId = computed(() => `${this.mode()}-email-error`);

  public readonly passwordErrorId = computed(() => `${this.mode()}-password-error`);

  public readonly formErrorId = computed(() => `${this.mode()}-form-error`);

  constructor() {
    addIcons({ logoGoogle, logoApple });
    this.authForm = this.formBuilder.group<AuthFormValue>({
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      password: new FormControl<string>('', {
        validators: [Validators.required, Validators.minLength(6)],
        nonNullable: true,
      }),
    });

    effect(() => {
      if (this.isLoading()) {
        this.authForm.disable();
      } else {
        this.authForm.enable();
      }
    });
  }

  get emailErrorKey(): string | null {
    const emailControl = this.authForm.controls.email;
    if (!emailControl.touched || !emailControl.invalid) {
      return null;
    }

    if (emailControl.errors?.['required']) {
      return 'auth.emailRequired';
    }
    if (emailControl.errors?.['email']) {
      return 'auth.emailInvalid';
    }

    return null;
  }

  get passwordErrorKey(): string | null {
    const passwordControl = this.authForm.controls.password;
    if (!passwordControl.touched || !passwordControl.invalid) {
      return null;
    }

    if (passwordControl.errors?.['required']) {
      return 'auth.passwordRequired';
    }
    if (passwordControl.errors?.['minlength']) {
      return 'auth.passwordMinLength';
    }

    return null;
  }

  async onGoogleSignIn(): Promise<void> {
    await this.handleSocialSignIn(() => this.authService.signInWithGoogle());
  }

  async onAppleSignIn(): Promise<void> {
    await this.handleSocialSignIn(() => this.authService.signInWithApple());
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      this.markFormGroupTouched(this.authForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.authForm.getRawValue();

    try {
      if (this.mode() === 'login') {
        await this.authService.login(email, password);
      } else {
        await this.authService.register(email, password);
      }
      this.authSuccess.emit();
    } catch (error) {
      const authError = error as AuthError;
      this.errorMessage.set(authError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async handleSocialSignIn(signInMethod: () => Promise<void>): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await signInMethod();
      this.authSuccess.emit();
    } catch (error) {
      const authError = error as AuthError;
      this.errorMessage.set(authError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup<AuthFormValue>): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}

