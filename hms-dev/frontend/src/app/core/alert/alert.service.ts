import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from 'app/core/user/user.types';
import { LocalService } from 'app/services/local.service';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    private _message: ReplaySubject<string> = new ReplaySubject<string>(1);

    constructor() {}

    set message(value: string) {
        this._message.next(value);
    }

    get message$(): Observable<string> {
        return this._message.asObservable();
    }
}
