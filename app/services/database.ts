import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

@Injectable()
export class Database {
    db: Storage;

    constructor() {
    }

    /**
     *
     */
    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.db = new Storage(SqlStorage, {
                name: 'ILIASMobile',
                backupFlag: SqlStorage.BACKUP_LOCAL,
                existingDatabase: true
            });
            this.db.query(`CREATE TABLE IF NOT EXISTS user (
                        login TEXT,
                        password TEXT
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
        });
    }
};