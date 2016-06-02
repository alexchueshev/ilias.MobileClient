import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

import {UserData} from './descriptions';

@Injectable()
export class Database {
    db: Storage;

    constructor() {
    }

    /**To use the service call initialize method after platfom's ready  */
    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.db = new Storage(SqlStorage, {
                name: 'ILIASMobile',
                backupFlag: SqlStorage.BACKUP_LOCAL,
                existingDatabase: true
            });
            /*only dev */
            this.db.query('DROP TABLE IF EXISTS users');
            this.db.query('DROP TABLE IF EXISTS courses');
            this.db.query('DROP TABLE IF EXISTS learning_modules');
            this.db.query('DROP TABLE IF EXISTS chapters');
            this.db.query('DROP TABLE IF EXISTS pages');

            this.db.query(`CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        login TEXT,
                        password TEXT,
                        firstname TEXT,
                        lastname TEXT,
                        avatar TEXT
                       );`
            );

            this.db.query(`CREATE TABLE IF NOT EXISTS courses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        description TEXT,
                        ref_id INTEGER,
                        user_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE       
                       );`
            );

            this.db.query(`CREATE TABLE IF NOT EXISTS learning_modules (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        description TEXT,
                        ref_id INTEGER,
                        course_id INTEGER REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
            );

            this.db.query(`CREATE TABLE IF NOT EXISTS chapters (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        export_id INTEGER,
                        lm_id INTEGER REFERENCES learning_modules(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
            );

            this.db.query(`CREATE TABLE IF NOT EXISTS pages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        content TEXT,
                        export_id INTEGER,
                        chapter_id INTEGER REFERENCES chapters(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
            );
            resolve();
        });
    }

    public saveUserData(userdata: UserData): Promise<number> {
        return this.db.query(`INSERT INTO users(login, password, firstname, lastname, avatar) VALUES (?,?,?,?,?)`, [
            userdata.login, userdata.password, userdata.firstname, userdata.lastname, userdata.avatar
        ]).then(() => {
            return this.db.query(`select seq from sqlite_sequence where name="users"`)
        }).then((data) => {
            if (data.res.rows.length > 0)
                return data.res.rows.item(0).seq;
            else
                return null;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }
};