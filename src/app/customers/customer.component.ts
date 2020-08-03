import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormControlName, AbstractControl, ValidatorFn } from '@angular/forms';

import { Customer } from './customer';

/* Custom validation for Rating input:
The validation function always take only one parameter: AbstractControl, the FormControl or FormGroup being validated. 
For build a validation function with parameters we need to build a factory function.
A validation function always returns a key and value pair defining the broken validation rule or a null if it is valid. */
// function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
//   if (c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5 )) {
//     return { 'range': true }; // INVALID
//   }
//   return null; // VALID
// }

/* Factory function */
function ratingRange (min: number, max: number): ValidatorFn { // Returns a Valudation function (ValidatorFn)
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max )) {
      return { 'range': true }; // INVALID
    }
    return null; // VALID
  }
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]], //First element: defailt value, second element: validations rules
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true 
    })
  }

  setValue(): void { // setValue requires that we set te value of every FormControl in the form model 
    this.customerForm.setValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      email: 'jack@handsome.com',
      sendCatalog: false
    })
  }

  patchValue(): void { // patchValue doesn't requires that we set te value of every FormControl in the form model 
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Harkness'
    })
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  // Change validations on the fly: in this case, if the user sets "phone" the field phone is required. If the user changes to "email", the field phone is not required
  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }
}
 