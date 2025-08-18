import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberPad',
  standalone: true,
})
export class NumberPadPipe implements PipeTransform {
  transform(value: string | number, size: number): string {
    const num = typeof value === 'number' ? value : parseInt(value, 10);
    return num.toString().padStart(size, '0');
  }
}
