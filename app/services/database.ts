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
            this.db.query('DROP TABLE user');
            this.db.query('DROP TABLE courses');
            this.db.query('DROP TABLE learning_modules');
            this.db.query('DROP TABLE chapters');
            this.db.query('DROP TABLE pages');
            
            this.db.query(`CREATE TABLE IF NOT EXISTS user (
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
                        ref_id INTEGER
                       );`
            );

            this.db.query(`CREATE TABLE IF NOT EXISTS learning_modules (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
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

    public saveUserData(userdata: UserData): Promise<any> {
        return this.db.query(`INSERT INTO user(login, password, firstname, lastname, avatar) VALUES (?,?,?,?,?)`, [
            userdata.login, userdata.password, userdata.firstname, userdata.lastname, userdata.avatar
        ]);
    }
};