import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { Doctor } from 'app/models/appointment';
import { Pagination } from 'app/models/pagination';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

export interface PeriodicElement {
    patient: string;
    doctor: string;
    date: string;
    time: string;
}
@Injectable({ providedIn: 'root' })
export class DoctorService {
    // Private
    private _imagePath: BehaviorSubject<string | null> = new BehaviorSubject(
        null
    );
    private _pagination: BehaviorSubject<Pagination | null> =
        new BehaviorSubject(null);
    private _doctors: BehaviorSubject<Doctor[] | null> = new BehaviorSubject(
        null
    );
    private _doctor: BehaviorSubject<Doctor | null> = new BehaviorSubject(null);
    private userD;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
        this._userService.user$.subscribe((user: any) => {
            this.userD = user;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<Pagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for doctor
     */
    get Doctor$(): Observable<Doctor> {
        return this._doctor.asObservable();
    }

    /**
     * Getter for doctors
     */
    get doctors$(): Observable<Doctor[]> {
        return this._doctors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get doctor
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getDoctors(
        page: number = 0,
        size: number = 1000,
        sort: string = 'created_date',
        order: 'asc' | 'desc' | '' = 'desc',
        search: string = ''
    ): Observable<{ pagination: Pagination; doctors: Doctor[] }> {
        return this._httpClient
            .get<{ pagination: Pagination; doctors: Doctor[] }>(
                environment.apiBaseUrl + '/doctor-list',
                {
                    params: {
                        page: '' + page,
                        size: '' + size,
                        sort,
                        order,
                        search,
                    },
                }
            )
            .pipe(
                tap((response) => {
                    this._pagination.next(response.pagination);
                    this._doctors.next(response.doctors);
                })
            );
    }

    /**
     * Get doctor by id
     */
    getDoctorById(id: string): Observable<Doctor> {
        return this._doctors.pipe(
            take(1),
            map((pTypes) => {
                // Find the type
                const types = pTypes.find(item => item._id === id) || null;

                // Update the types
                this._doctor.next(types);

                // Return the types
                return types;
            }),
            switchMap((types) => {
                if (!types) {
                    return throwError(
                        'Could not found types with id of ' + id + '!'
                    );
                }
                return of(types);
            })
        );
    }

    /**
     * Add Update doctor
     */
    addUpdateDoctor(doctorId, formData: Doctor) {
        const obj = {
            doctorId: doctorId,
            profileImgUrl: formData.profileImgUrl,
            fullName: formData.fullName,
            gender: formData.gender,
            description: formData.description,
            email: formData.email,
            contact_number: formData.contact_number,
        };
        return this._httpClient.post<Doctor>(
            environment.apiBaseUrl + '/add-update-doctor',
            obj
        );
    }

    /**
     * Delete the doctor
     *
     * @body id
     */
    deleteDoctor(id, action_type, status) {
        const obj = {
            id: id,
            action_type,
            status: status,
        };
        return this._httpClient.post(
            environment.apiBaseUrl + '/update-doctor-status',
            obj
        );
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    uploadImage(obj) {
        return this._httpClient
            .post(environment.apiBaseUrl + '/upload-image/doctor', obj)
            .pipe(
                map((data: any) => {
                    this._imagePath.next(data.picture);

                    // Return the new image
                    return data;
                })
            );
    }
}
