export interface TaskStatus {
    id: string;
    title: string;
    color: string;
    visible: boolean;
}

export type CalendarDrawerMode = 'over' | 'side';

export interface Event {
    _id: string;
    doctor: string;
    time_slot: string;
    date: string;
}

export interface CalendarEventException {
    id: string;
    eventId: string;
    exdate: string;
}

export type CalendarEventPanelMode = 'view' | 'add' | 'edit';
export type CalendarEventEditMode = 'single' | 'future' | 'all';

export interface CalendarSettings {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'll';
    timeFormat: '12' | '24';
    startWeekOn: 6 | 0 | 1;
}

export interface CalendarWeekday {
    abbr: string;
    label: string;
    value: string;
}

export interface Doctor {
    _id: string;
    fullName: string;
    email: string;
    contact_number: number;
    description: string;
    profileImgUrl: string;
    present: boolean;
    gender: string;
}
