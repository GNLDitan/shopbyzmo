import { Directive, Inject, Optional, Host, ComponentRef, ViewContainerRef, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { NgControl } from '@angular/forms';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable, EMPTY, merge } from 'rxjs';

import { FormSubmitDirective } from './form-submit.directive';
import { ControlErrorContainerDirective } from './control-error-container.directive';

import { ValidatorService, FORM_ERRORS, config } from '../services/validator.service';

import { ControlErrorComponent } from '../components/control-error/control-error.component';

@Directive({
  selector: '[formControl], [formControlName]'
})

export class ControlErrorsDirective {
  ref: ComponentRef<ControlErrorComponent>;
  submit$: Observable<Event>;
  container: ViewContainerRef;

  constructor(private vcr: ViewContainerRef,
    private control: NgControl,
    private resolver: ComponentFactoryResolver,
    private validatorService: ValidatorService,
    @Optional() controlErrorContainer: ControlErrorContainerDirective,
    @Optional() @Host() private form: FormSubmitDirective,
    @Inject(FORM_ERRORS) private errors) {
    this.container = controlErrorContainer ? controlErrorContainer.vcr : vcr;
    this.submit$ = this.form ? this.form.submit$ : EMPTY;
  }

  ngOnInit() {
    merge(
      this.submit$
    ).pipe(
      untilDestroyed(this)
    ).subscribe(() => {
      const { errors } = this.control;
      console.log(this.control);
      if (errors) {
        const errorMessage = config[Object.keys(errors)[0]];
        console.log(errors);
        this.setError(errorMessage);
      } else if (this.ref) {
        this.setError(null);
      }
    })
  }

  ngOnDestroy() {
    // To protect you, we'll throw an error if it doesn't exist.
  }


  setError(text: string) {
    if (!this.ref) {
      const factory = this.resolver.resolveComponentFactory(ControlErrorComponent);
      this.ref = this.vcr.createComponent(factory);
    }
    this.ref.instance.text = text;
  }

}
