import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormControlName, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

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

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if (emailControl.pristine || confirmControl.pristine) { // If neither of controls has not yet been touched skip validation
    return null;
  }

  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return {'match': true};
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: string;

  get addressesGroup(): FormArray {
    return <FormArray>this.customerForm.get('addressesGroup');
  }

  private validationMessages = {
    required: 'Please enter your email address',
    email: 'Please enter a valid email address'
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]], //First element: defailt value, second element: validations rules
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      // Form check that emails are the same, we create a formGroup with this two fields
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required]]
      }, {validator: emailMatcher}),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addressesGroup: this.fb.array([this.buildAddressBlock()])
    });

    this.customerForm.get('notification').valueChanges.subscribe( // Start watching for changes
      value => this.setNotification(value)
    );

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    );
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

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) { // Check when we must show validation messages
      this.emailMessage = Object.keys(c.errors).map( // We use JS Object.keys method to return an array of validations errors collection keys, this array uses de email as the key
        key => this.validationMessages[key]).join(' ');
    }
  }

  buildAddressBlock(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
  }

  addAddress(): void {
    this.addressesGroup.push(this.buildAddressBlock());
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
  // For make this same validation by watching the element instead call a method, check the OnInit()
}
 