import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, OAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface AuthError {
  code: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly authInitialized = new BehaviorSubject<boolean>(false);
  public readonly user$: Observable<User | null>;
  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      this.authInitialized.next(true);
    });

    this.user$ = this.userSubject.asObservable().pipe(
      shareReplay(1)
    );
  }

  get authStateInitialized$(): Observable<boolean> {
    return this.authInitialized.asObservable();
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/auth']);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithApple(): Promise<void> {
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(this.auth, provider);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  isUserAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  private handleAuthError(error: any): AuthError {
    let message = 'Une erreur est survenue lors de l\'authentification.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Cet email est déjà utilisé.';
        break;
      case 'auth/invalid-email':
        message = 'L\'adresse email n\'est pas valide.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Cette opération n\'est pas autorisée.';
        break;
      case 'auth/weak-password':
        message = 'Le mot de passe est trop faible.';
        break;
      case 'auth/user-disabled':
        message = 'Ce compte utilisateur a été désactivé.';
        break;
      case 'auth/user-not-found':
        message = 'Aucun compte trouvé avec cet email.';
        break;
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect.';
        break;
      case 'auth/invalid-credential':
        message = 'Les identifiants sont incorrects.';
        break;
      case 'auth/too-many-requests':
        message = 'Trop de tentatives. Veuillez réessayer plus tard.';
        break;
      case 'auth/network-request-failed':
        message = 'Erreur de connexion réseau.';
        break;
      default:
        message = error.message || message;
    }

    return { code: error.code, message };
  }
}

