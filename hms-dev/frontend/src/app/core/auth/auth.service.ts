import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { LocalService } from 'app/services/local.service';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _localService: LocalService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        this._localService.setJsonValue('accessToken', token);
    }

    get accessToken(): string {
        return this._localService.getJsonValue('accessToken')?.value ?? '';
    }

    forgotPassword(emailid: string): Observable<any> {
        return this._httpClient
            .post(environment.apiBaseUrl + '/forgot-password', {
                email: emailid,
            })
            .pipe(
                switchMap((response: any) => {
                    if (response.status === true) {
                        return of(response);
                    } else {
                        return throwError(response.message);
                    }
                })
            );
    }

    resetPassword(resetPasswordObj: any): Observable<any> {
        return this._httpClient
            .post(environment.apiBaseUrl + '/reset-password', resetPasswordObj)
            .pipe(
                switchMap((response: any) => {
                    if (response.status === true) {
                        return of(response);
                    } else {
                        return throwError(response.message);
                    }
                })
            );
    }

    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(environment.apiBaseUrl + '/login', credentials)

            .pipe(
                switchMap((response: any) => {
                    if (response.status === true) {
                        // Store the access token in the local storage
                        this._localService.clearValues();
                        this.accessToken = response.token;
                        this._localService.setJsonValue('accessToken', {
                            value: response.token,
                        });
                        this._localService.setJsonValue('user', response.user);

                        // Set the authenticated flag to true
                        this._authenticated = true;

                        // Store the user on the user service
                        this._userService.user = response.user;

                        // Return a new observable with the response
                        return of(response);
                    } else {
                        return throwError(response.message);
                    }
                })
            );
    }
    signUp(credentials) {
        const obj = {
            fullname: credentials.name,
            email: credentials.email,
            password: credentials.password,
            contact_number: credentials.mobile,
            address: credentials.address,
            birth_day: credentials.birth_day,
            gender: credentials.gender,
        };
        return this._httpClient
            .post(environment.apiBaseUrl + '/add-update-user', obj)
            .pipe(
                switchMap((response: any) => of(response))
            );
    }

    signOut(): Observable<any> {
        // Remove the access token from the local storage
        this._localService.clearValues();

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        if (this.accessToken) {
            return of(true);
        }
    }
}
