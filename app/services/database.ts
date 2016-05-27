import {Injectable} from '@angular/core';
import {Storage, SqlStorage, Platform} from 'ionic-angular';

@Injectable()
export class Database {
    db: Storage;

    constructor(platform: Platform) {
        platform.ready().then(() => {
            this.db = new Storage(SqlStorage, {
                name: 'ILIASMobile',
                backupFlag: SqlStorage.BACKUP_LOCAL,
                existingDatabase: true
            });
            this.initialize();
        });
    }

    /**
     *
     */
    private initialize() {
        this.db.query(`CREATE TABLE IF NOT EXISTS user (
                        login TEXT,
                        password TEXT
                       );`
        ).then((data) => {
            console.log("TABLE CREATED -> " + JSON.stringify(data.res));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        });

        this.db.query(`CREATE TABLE IF NOT EXISTS courses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        ref_id INTEGER
                       );`
        ).then((data) => {
            console.log("TABLE CREATED -> " + JSON.stringify(data.res));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        });

        this.db.query(`CREATE TABLE IF NOT EXISTS learning_modules (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        ref_id INTEGER,
                        course_id INTEGER REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
        ).then((data) => {
            console.log("TABLE CREATED -> " + JSON.stringify(data.res));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        });

        this.db.query(`CREATE TABLE IF NOT EXISTS chapters (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        export_id INTEGER,
                        lm_id INTEGER REFERENCES learning_modules(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
        ).then((data) => {
            console.log("TABLE CREATED -> " + JSON.stringify(data.res));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        });

        this.db.query(`CREATE TABLE IF NOT EXISTS pages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT,
                        content TEXT,
                        export_id INTEGER,
                        chapter_id INTEGER REFERENCES chapters(id) ON UPDATE CASCADE ON DELETE CASCADE
                       );`
        ).then((data) => {
            console.log("TABLE CREATED -> " + JSON.stringify(data.res));
        }, (error) => {
            console.log("ERROR -> " + JSON.stringify(error.err));
        });
    }
};