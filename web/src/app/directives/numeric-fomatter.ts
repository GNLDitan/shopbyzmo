import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
    selector: '[formatNumeric]'
})
export class NumericFormatterDirective {
    private el: HTMLInputElement;
    private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

    constructor(private elementRef: ElementRef) {
        this.el = this.elementRef.nativeElement;
    }

    ngAfterViewInit() {
        this.onBlur(this.el.value);
    }

    @HostListener('focus', ['$event.target.value'])
    onFocus(value: string) {
        const number = parseFloat(value.replace('$', '').replace(' ', '').split(',').join(''));
        this.el.value = number.toString();
    }

    @HostListener('blur', ['$event.target.value'])
    onBlur(value: string) {
        this.el.value = this.formatCurrency(parseFloat(value));
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        let current: string = this.el.value;
        const position = this.el.selectionStart;
        const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }

    formatCurrency(value: number) {
        value = isNaN(value) ? 0 : value;
        return value.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
