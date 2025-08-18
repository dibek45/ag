import { Component, ElementRef, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tombola',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tombola.component.html',
  styleUrl: './tombola.component.scss'
})
export class TombolaComponent {
  @Input() userInput: string = '';
  @Input() spinDuration: number = 2;

  reels: number[] = [];
  realIndexes: number[] = [];
  fixedIndexes: number[] = [];
  reelTransforms: string[] = [];
  reelClasses: string[] = [];
  numbers: number[] = [];
  numIcons = 10;
  iconHeight = 79;
  rolling = false;
  @Output() rollingDone = new EventEmitter<void>(); // ✅ Nuevo Output

  @ViewChildren('digit') digits!: QueryList<ElementRef>;

ngOnInit(): void {
  // Generar los números visuales
  const base = Array.from({ length: this.numIcons }, (_, i) => i);
  this.numbers = [];
  for (let i = 0; i < 5; i++) {
    this.numbers.push(...base);
  }

  // Asegurar valor inicial en ceros (puedes usar '00' si prefieres 2 dígitos)
  const defaultInput = this.userInput && /^\d{2,4}$/.test(this.userInput)
  ? this.userInput
  : '0000';



  this.userInput = defaultInput;
  const length = defaultInput.length;

  this.reels = Array(length).fill(0);
  this.reelTransforms = Array(length).fill('translateY(0px)');
  this.reelClasses = Array(length).fill('');
  this.realIndexes = Array(length).fill(0);
  this.fixedIndexes = defaultInput.split('').map(n => parseInt(n, 10));

  // Posicionar los dígitos iniciales
  this.setInitialPositions();
}


  get realIndexesFormatted(): string {
    return this.realIndexes.map(n => `[${n}]`).join(' ');
  }
  startRolling(): void {
    if (this.rolling) return;

    this.rolling = true;

    const hasValidInput = /^\d{2,4}$/.test(this.userInput);
      this.fixedIndexes = (hasValidInput ? this.userInput : '0000')
        .split('')
        .map(d => parseInt(d, 10));


    this.resetReelPositionsInstantly();

    setTimeout(() => {
      const durationSec = this.spinDuration || 2;
      document.querySelectorAll('.reel-inner').forEach(el => {
        (el as HTMLElement).style.transition = `transform ${durationSec}s ease-out`;
      });

      this.fixedIndexes.forEach((val, i) => {
        this.positionDigitInCenter(i, val);
      });

      setTimeout(() => {
        this.realIndexes = [...this.fixedIndexes];
        this.rolling = false;
        this.rollingDone.emit(); // ✅ Emitimos cuando termina
      }, durationSec * 1000);
    }, 50);
  }


  setRandomAndStart(): void {
   const randomNum = Math.floor(Math.random() * 10000); // 0000–9999
    this.userInput = randomNum.toString().padStart(4, '0');

    this.startRolling();
  }

  private resetReelPositionsInstantly(): void {
    const instantStyle = 'transform 0s';
    document.querySelectorAll('.reel-inner').forEach(el => {
      (el as HTMLElement).style.transition = instantStyle;
      (el as HTMLElement).style.transform = `translateY(0px)`;
    });

    this.reelTransforms = this.reels.map(() => 'translateY(0px)');
  }

  private positionDigitInCenter(reelIndex: number, digit: number): void {
    const visualIndex = this.numIcons + digit - 1;
    const offset = visualIndex * this.iconHeight;
    this.reelTransforms[reelIndex] = `translateY(-${offset}px)`;
  }

  private setInitialPositions(): void {
    this.fixedIndexes = this.userInput.padStart(this.reels.length, '0').split('').map(n => parseInt(n, 10));
    this.fixedIndexes.forEach((val, i) => {
      this.positionDigitInCenter(i, val);
    });
  }
   ngOnChanges(changes: SimpleChanges): void {
    if (changes['userInput'] && !changes['userInput'].isFirstChange()) {
      // Cuando el número cambia desde el padre:
      this.fixedIndexes = this.userInput.split('').map(n => parseInt(n, 10));
      this.setInitialPositions(); // actualiza la animación con el nuevo número
    }
  }
}
