/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const navigationMenu: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard',
    },
    {
        id: 'patient-appointment',
        title: 'Appointment',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: 'patient-appointment',
    },
    {
        id: 'appointments',
        title: 'Appointments',
        type: 'basic',
        icon: 'heroicons_outline:pencil-alt',
        link: 'appointments/all',
    },
    {
        id: 'doctors',
        title: 'Doctors',
        type: 'basic',
        icon: 'heroicons_outline:academic-cap',
        link: 'doctors',
    },
];
