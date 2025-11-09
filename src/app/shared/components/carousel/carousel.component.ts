import { CommonModule } from '@angular/common';
import { Component, input, signal, OnDestroy, effect } from '@angular/core';

export interface CarouselImage {
  url: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'jym-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CarouselComponent implements OnDestroy {
  images = input.required<CarouselImage[]>();
  autoplayInterval = input<number>(3000);
  height = input<string>('80vh');

  public readonly currentSlideIndex = signal<number>(0);
  private autoplayIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      if (this.images().length > 0) {
        this.startAutoplay();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    const currentIndex = this.currentSlideIndex();
    const maxIndex = this.images().length - 1;
    this.currentSlideIndex.set(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }

  previousSlide(): void {
    const currentIndex = this.currentSlideIndex();
    const maxIndex = this.images().length - 1;
    this.currentSlideIndex.set(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
    this.restartAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.autoplayInterval() > 0 && this.images().length > 1) {
      this.autoplayIntervalId = setInterval(() => {
        this.nextSlide();
      }, this.autoplayInterval());
    }
  }

  private stopAutoplay(): void {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = undefined;
    }
  }

  private restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }
}

