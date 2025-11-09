import { Component, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'jym-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly translationService = inject(TranslationService);

  constructor() {
    this.translationService.init();
  }
}
