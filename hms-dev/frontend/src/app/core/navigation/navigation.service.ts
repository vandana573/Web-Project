import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Navigation } from 'app/core/navigation/navigation.types';
import { cloneDeep } from 'lodash';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { navigationMenu } from './navigation-data';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);
    private _navigationItem: FuseNavigationItem[] = navigationMenu;
    private userD: any;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    async get(): Promise<any> {
        // get user
        await this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });

        const forAdmin = ['dashboard', 'appointments', 'doctors'];
        const forPatient = ['dashboard', 'patient-appointment'];

        if (this.userD.role === 'admin') {
            this._navigationItem = this._navigationItem.filter(obj =>
                forAdmin.includes(obj.id)
            );
        } else {
            this._navigationItem = this._navigationItem.filter(obj =>
                forPatient.includes(obj.id)
            );
        }
        const navigationItems = { menuItem: this._navigationItem };
        this._navigation.next(navigationItems);
        this._navigationItem = navigationMenu;
        return of(navigationItems);
    }
}
