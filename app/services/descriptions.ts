export interface UserAccess {
    login: string,
    password: string,
    access_token: string,
    refresh_token: string,
    expires_in: number,
    token_type: string
}

export interface UserData {
    login: string;
    password: string;
    firstname?: string;
    secondname?: string;
    avatar?: string;
}

