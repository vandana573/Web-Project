import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Doctor } from 'app/models/appointment';
import { Pagination } from 'app/models/pagination';
import { AppointmentService } from 'app/services/appointment.service';
import { DoctorService } from 'app/services/doctor.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DoctorResolver implements Resolve<any> {
    constructor(private _doctorService: DoctorService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<{ pagination: Pagination; doctors: Doctor[] }> {
        return this._doctorService.getDoctors();
    }
}
