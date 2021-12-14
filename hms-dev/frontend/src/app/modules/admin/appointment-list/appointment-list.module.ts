import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { AppointmentListComponent } from './appointment-list.component';
import { Route } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentResolver } from './appointment-list.resolver';
import { DoctorResolver } from '../doctor/doctor.resolver';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { MatDialogModule } from '@angular/material/dialog';

const routes: Route[] = [
    {
        path: 'all',
        component: AppointmentListComponent,
        resolve: {
            appointments: AppointmentResolver,
            doctors: DoctorResolver,
        },
    },
    {
        path: ':patient',
        component: AppointmentListComponent,
        resolve: {
            appointments: AppointmentResolver,
            doctors: DoctorResolver,
        },
    },
];
@NgModule({
    declarations: [AppointmentListComponent],
    imports: [
        RouterModule.forChild(routes),
        MatButtonModule,
        CommonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatTableModule,
        FuseHighlightModule,
        MatDialogModule,
        SharedModule,
    ],
})
export class AppointmentListModule {}
