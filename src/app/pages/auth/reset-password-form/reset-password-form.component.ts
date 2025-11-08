import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, AuthError } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormErrorComponent } from '@shared/components/form-error/form-error.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import {
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';

interface ResetPasswordFormValue {
  email: FormControl<string>;
}

@Component({
  selector: 'jym-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    TranslatePipe,
    ButtonComponent,
    FormErrorComponent,
  ],
})
export class ResetPasswordFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  public readonly resetPasswordForm: FormGroup<ResetPasswordFormValue>;
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  constructor() {
    this.resetPasswordForm = this.formBuilder.group<ResetPasswordFormValue>({
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
    });
  }

  get emailErrorKey(): string | null {
    const emailControl = this.resetPasswordForm.controls.email;
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

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email } = this.resetPasswordForm.getRawValue();

    try {
      await this.authService.resetPassword(email);
      this.successMessage.set('auth.resetPasswordSuccess');
      this.resetPasswordForm.reset();
    } catch (error) {
      const authError = error as AuthError;
      this.errorMessage.set(authError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup<ResetPasswordFormValue>): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}

