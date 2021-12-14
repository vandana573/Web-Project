import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertService } from '@fuse/components/alert';
import { AlertService } from 'app/core/alert/alert.service';
import { PasswordValidation } from 'app/core/helper/password-validators';
import { User } from 'app/core/user/user.types';
import { LocalService } from 'app/services/local.service';
import { MasterService } from 'app/services/master.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: [ './profile.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
})
export class ProfileComponent implements OnInit, OnDestroy {
    userId = '';
    isLoading: boolean = false;
    isChangePassword: boolean = false;
    userProfileFormGroup: FormGroup;
    changePasswordFormGroup: FormGroup;
    imgPath = environment.uploadPath;
    isSuperAdmin: boolean = true;
    today = new Date();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _localService: LocalService,
        private _alertService: AlertService,
        private _masterService: MasterService,
        private _fuseAlertService: FuseAlertService
    ) { }

    ngOnInit(): void {
        this.userProfileFormGroup = this._formBuilder.group({
            fullname: [ '', Validators.required ],
            email: [ '', [ Validators.required, Validators.email ] ],
            contact_number: [ '', Validators.required ],
            address: [ '', Validators.required ],
            birth_day: [ '', Validators.required ],
            gender: [ '', Validators.required ],
        });

        this.changePasswordFormGroup = this._formBuilder.group(
            {
                currentPassword: [ '' ],
                newPassword: [ '' ],
                confirmPassword: [ '' ],
            },
            {
                validator: PasswordValidation.MatchPassword,
            }
        );

        this.getUserData();
    }

    getUserData() {
        const userInfo: any = this._localService.getJsonValue('user');
        this.userProfileFormGroup.get('gender').setValue(userInfo.gender);
        this.userProfileFormGroup.patchValue(userInfo);
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    updateProfile(): void {
        if (this.userProfileFormGroup.invalid) {
            return;
        }
        // Get the user form data
        const formData = this.userProfileFormGroup.getRawValue();

        this.isLoading = true;
        this._masterService.updateUserProfile(formData).subscribe(
            () => {
                this.getUserData();
                this.isLoading = false;
                this._alertService.message = 'Profile updated successfully.';
                this._fuseAlertService.show('alert_success');
                setTimeout(() => {
                    this._fuseAlertService.dismiss('alert_success');
                }, 2500);
                this._changeDetectorRef.markForCheck();
            },
            (response) => {
                this._alertService.message =
                    'Some went wrong! please check you profile again.';
                this.isLoading = false;
                this._fuseAlertService.show('alert_error');
                setTimeout(() => {
                    this._fuseAlertService.dismiss('alert_error');
                }, 2500);
            }
        );
    }

    changePassword(): void {
        if (this.changePasswordFormGroup.invalid) {
            return;
        }

        // Get the user form data
        const formData = this.changePasswordFormGroup.getRawValue();

        this.isLoading = true;
        this._masterService.changePassword(formData).subscribe(
            () => {
                this._changeDetectorRef.markForCheck();
                this.isLoading = false;
                this._alertService.message =
                    'Password has been changed successfully.';
                this.isChangePassword = false;
                this.changePasswordFormGroup.reset();
                this._fuseAlertService.show('alert_success');
                setTimeout(() => {
                    this._fuseAlertService.dismiss('alert_success');
                }, 2500);
            },
            (response) => {
                // Re-enable the form
                this.changePasswordFormGroup.enable();

                // Reset the form
                this.changePasswordFormGroup.reset();

                this.isLoading = false;
                // Set the alert
                this._alertService.message = 'Current Password is wrong.';
                this._fuseAlertService.show('alert_error');
                setTimeout(() => {
                    this._fuseAlertService.dismiss('alert_error');
                }, 2500);
            }
        );
    }
}
