export interface UserAccess {
    login: string,
    password: string,
    access_token: string,
    refresh_token: string,
    expires_in: number,
    token_type: string
}

export interface UserData {
    user_id?: number;
    login: string;
    password: string;
    firstname?: string;
    lastname?: string;
    avatar?: string;
}

export enum Status {
    Local = 1 << 0,
    Remote = 1 << 1,
    None = 1 << 2
} 

export interface Course {
    course_id?: number;
    title: string;
    description?: string;
    ref_id: number;
    status: Status;
    user: UserData;
}

export interface LearningModule {
    lm_id?: number;
    title: string;
    description?: string;
    ref_id: number;
    status: Status;
    course: Course;
}