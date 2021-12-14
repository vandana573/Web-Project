import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Pagination } from 'app/models/pagination';
import { AppointmentService } from 'app/services/appointment.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppointmentResolver implements Resolve<any> {
    constructor(private _appointmentService: AppointmentService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<{ pagination: Pagination; appointmentDetails: any[] }> {
        if (route.paramMap.get('patient')) {
            return this._appointmentService.getAppointments(
                0,
                1000,
                'created_date',
                'desc',
                route.paramMap.get('patient')
            );
        } else {
            return this._appointmentService.getAppointments();
        }
    }
}

@Injectable({
    providedIn: 'root',
})
export class EventResolver implements Resolve<any> {
    constructor(private _appointmentService: AppointmentService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return this._appointmentService.getAppoinment(true);
    }
}
