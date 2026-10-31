import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
 
/* Validador de grupo que comprueba que `password` y `confirm` coinciden */
export const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
};
