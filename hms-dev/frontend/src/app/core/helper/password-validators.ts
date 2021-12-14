import { AbstractControl } from '@angular/forms';
export class PasswordValidation {

    static MatchPassword(abstract: AbstractControl) {
        const password = abstract.get('newPassword').value;
        if (abstract.get('confirmPassword').touched || abstract.get('confirmPassword').dirty) {
            const confirmPassword = abstract.get('confirmPassword').value;

            if (password !== confirmPassword) {
                abstract.get('confirmPassword').setErrors({ MatchPassword: true });
            } else {
                return null;
            }
        }
    }
}
