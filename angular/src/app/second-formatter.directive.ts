import {AfterViewInit, Directive, ElementRef, HostListener} from '@angular/core';
import {DecimalPipe} from "@angular/common";
import {NgModel} from "@angular/forms";

@Directive({
  selector: 'input[appSecondFormatter]'
})
export class SecondFormatterDirective implements AfterViewInit {

  private _value: string;
  private min: number;
  private max: number;

  constructor(private elementRef: ElementRef<HTMLInputElement>, private ngModel: NgModel, private decimalPipe: DecimalPipe) {
    this.min = parseInt(elementRef.nativeElement.getAttribute('min'), 10);
    this.max = parseInt(elementRef.nativeElement.getAttribute('max'), 10);

    if (isNaN(this.min)) {
      this.min = -Infinity;
    }
    if (isNaN(this.max)) {
      this.max = Infinity;
    }
  }

  ngAfterViewInit(): void {
    this._value = this.ngModel.model; // number or string
    setTimeout(() => {  //TODO
      this.format(this._value);
    }, 0);
  }


  get value(): string {
    console.log('get value');
    return this._value;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this._value = value;
    this.format(value);
  }

  private format(value: string): void {
    if (/\d\./.test(value)) {
      value += '0';
    }
    let temp = Number(value);
    if (isNaN(temp) || temp < this.min || temp > this.max) {
      this._value = '0';
      temp = 0;
    }
    this.elementRef.nativeElement.value = this.decimalPipe.transform(temp, '2.0');
  }
}
