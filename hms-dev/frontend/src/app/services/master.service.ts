import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LocalService } from './local.service';

@Injectable({
    providedIn: 'root',
})
export class MasterService {
    private profile = new BehaviorSubject<any>(null);
    private userD;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _localService: LocalService
    ) {
        this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    get profile$(): Observable<any> {
        return this.profile.asObservable();
    }

    setProfile(data: any) {
        this.profile.next(data);
    }
    /**
     * Add Update user
     */
    updateUserProfile(formData: User): Observable<any> {
        const obj = {
            userId: this.userD._id,
            fullname: formData.fullname,
            email: formData.email,
            gender: formData.gender,
            contact_number: formData.contact_number,
            address: formData.address,
            birth_day: formData.birth_day,
        };
        return this._httpClient
            .post(environment.apiBaseUrl + '/update-user-profile', obj)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this._localService.setJsonValue('user', response.user);
                    this.setProfile(response.user);
                    return of(response);
                })
            );
    }

    changePassword(formData) {
        const obj = {
            id: this.userD._id,
            password: formData.newPassword,
            oldpassword: formData.currentPassword,
        };
        return this._httpClient.post(
            environment.apiBaseUrl + '/change-password',
            obj
        );
    }
}
