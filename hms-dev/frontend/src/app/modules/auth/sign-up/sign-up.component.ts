import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'sign-up-split-screen-reversed',
    templateUrl: './sign-up.component.html',
    styleUrls: [ './sign-up.component.scss' ],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignUpComponent implements OnInit {
    // @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            name: [ '', Validators.required ],
            email: [ '', [ Validators.required, Validators.email ] ],
            password: [ '', Validators.required ],
            conf_password: [ '', Validators.required ],
            mobile: [ '' ],
            address: [ '', Validators.required ],
            gender: [ 'male', Validators.required ],
            birth_day: [ '', Validators.required ]

            // agreements: [ '', Validators.requiredTrue ],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        this.showAlert = false;
        if (this.signUpForm.get('password').value !== this.signUpForm.get('conf_password').value) {
            this.showAlert = true;
            this.alert = { type: 'error', message: 'Password and confirm password is must be same!' };
        }
        if (this.signUpForm.invalid) {
            return;
        }

        const data = this.signUpForm.getRawValue();
        this._authService.signUp(data).subscribe((res) => {

            const redirectURL =
                this._activatedRoute.snapshot.queryParamMap.get(
                    'redirectURL'
                ) || '/sign-in';

            this._router.navigateByUrl(redirectURL);
        },
            (err) => {
                // Re-enable the form
                this.signUpForm.enable();

                // Reset the form
                this.signUpForm.reset();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'ERR-' + err,
                };

                // Show the alert
                this.showAlert = true;

            });

    }
}
