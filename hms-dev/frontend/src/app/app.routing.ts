import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { InitialDataResolver } from 'app/app.resolvers';
import { LayoutComponent } from './layout/layout.component';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sign-in',
    },
    {
        path: 'sign-in',
        //canActivate: [NoAuthGuard],
        loadChildren: () =>
            import('app/modules/auth/sign-in/sign-in.module').then(
                m => m.AuthSignInModule
            ),
    },
    {
        path: 'sign-up',
        //canActivate: [NoAuthGuard],
        loadChildren: () =>
            import('app/modules/auth/sign-up/sign-up.module').then(
                m => m.AuthSignUpModule
            ),
    },
    {
        path: 'forgot-password',
        canActivate: [NoAuthGuard],
        loadChildren: () =>
            import(
                'app/modules/auth/forgot-password/forgot-password.module'
            ).then(m => m.AuthForgotPasswordModule),
    },
    {
        path: 'reset-password/:resetid',
        canActivate: [NoAuthGuard],
        loadChildren: () =>
            import(
                'app/modules/auth/reset-password/reset-password.module'
            ).then(m => m.AuthResetPasswordModule),
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            // Dashboards
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('app/modules/admin/dashboard/dashboard.module').then(
                        m => m.DashboardModule
                    ),
            },
            {
                path: 'profile',
                loadChildren: () =>
                    import('app/modules/admin/profile/profile.module').then(
                        m => m.ProfileModule
                    ),
            },
            {
                path: 'appointments',
                loadChildren: () =>
                    import(
                        'app/modules/admin/appointment-list/appointment-list.module'
                    ).then(m => m.AppointmentListModule),
            },
            {
                path: 'patient-appointment',
                loadChildren: () =>
                    import(
                        'app/modules/admin/patient-appointment/patient-appointment.module'
                    ).then(m => m.PatientAppoinmentModule),
            },
            {
                path: 'doctors',
                loadChildren: () =>
                    import('app/modules/admin/doctor/doctor.module').then(
                        m => m.DoctorListModule
                    ),
            },
        ],
    },
];
