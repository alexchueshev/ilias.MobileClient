/**
 * To use the service call initialize method after platfom's ready
*/
import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';
import {UserData, LearningModule, Course, Chapter, Page, Status} from './descriptions';

/**
 * Service for adapting Cordova Sqlite Plugin and working with database to store user's data 
 * 
 * @export
 * @class Database
 */
@Injectable()
export class Database {

    /**
     * Instance of installed database
     * 
     * @type {Storage}
     */
    db: Storage;

    /**
     * Creates an instance of Database
     */
    constructor() {
    }

    
    /**
     * Initializes Sqlite plugin, installs or update database schema
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of initialization proccess
     */
    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.db = new Storage(SqlStorage, {
                name: 'ILIASMobile',
                backupFlag: SqlStorage.BACKUP_LOCAL,
                existingDatabase: true
            });
            /*only dev *//*
            this.db.query('DROP TABLE IF EXISTS users');
            this.db.query('DROP TABLE IF EXISTS courses');
            this.db.query('DROP TABLE IF EXISTS learning_modules');
            this.db.query('DROP TABLE IF EXISTS chapters');
            this.db.query('DROP TABLE IF EXISTS pages');*/

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
                        on_desktop INTEGER DEFAULT 0,
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

    /**
     * Gets full user's information stored in database
     * 
     * @param {UserData} userdata Object that contains required information to find necessary data in tables
     * @returns {Promise<any>} Promise that resolves or rejects the result of searching
     */
    public getUser(userdata: UserData): Promise<any> {
        return this.db.query(`SELECT * FROM users WHERE login = ? AND password = ?`, [userdata.login, userdata.password])
            .then((data) => {
                var results = data.res.rows;
                if (results.length === 0)
                    return Promise.reject('Cannot find such user');
                userdata.user_id = results.item(0).id;
                userdata.firstname = results.item(0).firstname;
                userdata.lastname = results.item(0).lastname;
                userdata.avatar = results.item(0).avatar;
            }).catch((error) => {
                return Promise.reject(error);
            })
    }

    /**
     * Checks user's information from database
     * 
     * @param {UserData} userdata User's information to check in database
     * @returns {Promise<Boolean>} Promise that resolves with result of searching or rejects with error 
     */
    public checkUser(userdata: UserData): Promise<Boolean> {
        return this.db.query(`SELECT * FROM users WHERE login = ? AND password = ?`, [userdata.login, userdata.password])
            .then((data) => {
                var results = data.res.rows;
                if (results.length === 0)
                    return false;
                userdata.user_id = results.item(0).id;
                return true;
            }).catch((error) => {
                return Promise.reject(error);
            })
    }

    /**
     * Gets list of user's courses from database
     * 
     * @param {UserData} userdata Object that contains required user's information
     * @returns {Promise<Course[]>} Promise that resolves with list of user's courses or rejects with error
     */
    public getCourses(userdata: UserData): Promise<Course[]> {
        return this.db.query(`SELECT * FROM courses WHERE user_id=?`, [userdata.user_id]).then((data) => {
            var courses: Course[] = [];
            var results = data.res.rows;
            for (let i = 0, length = results.length; i < length; i++) {
                courses.push({
                    course_id: results.item(i).id,
                    title: results.item(i).title,
                    description: results.item(i).description,
                    ref_id: results.item(i).ref_id,
                    status: Status.Local,
                    user: userdata
                });
            }
            return courses;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     *  Gets list of course's learning modules from database
     * 
     * @param {Course} course Object that contains required information of course to find necessary modules
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of learning modules or rejects with error
     */
    public getLearningModules(course: Course): Promise<LearningModule[]> {
        var learningModules: LearningModule[] = [];
        return this.db.query(`SELECT * FROM learning_modules WHERE course_id=?`, [course.course_id]).then((data) => {
            var results = data.res.rows;
            for (let i = 0, length = results.length; i < length; i++) {
                learningModules.push({
                    lm_id: results.item(i).id,
                    title: results.item(i).title,
                    description: results.item(i).description,
                    ref_id: results.item(i).ref_id,
                    onDesktop: (results.item(i).on_desktop == 1) ? true : false,
                    status: Status.Local,
                    chapters: null,
                    course: course
                });
            }
            return Promise.all(learningModules.map((lm) => this.getChapters(lm)));
        }).then(() => {
            return learningModules;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets chapters of learning module from database
     * 
     * @param {LearningModule} learningModule Object that contains required information of module to find necessary chapters
     * @returns {Promise<Chapter[]>} Promise that resolves with list of chapters or rejects with error
     */
    public getChapters(learningModule: LearningModule): Promise<Chapter[]> {
        var chapters: Chapter[] = [];
        return this.db.query(`SELECT * FROM chapters WHERE lm_id=?`, [learningModule.lm_id]).then((data) => {
            var results = data.res.rows;
            for (let i = 0, length = results.length; i < length; i++) {
                chapters.push({
                    st_id: results.item(i).id,
                    title: results.item(i).title,
                    export_id: results.item(i).export_id,
                    pages: null,
                    learningModule: learningModule
                });
            }
            return Promise.all(chapters.map((chapter) => this.getPages(chapter)));
        }).then((pages) => {
            learningModule.chapters = chapters;
            return chapters;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Get pages of chapter from database
     * 
     * @param {Chapter} chapter Object that contains required information of chapter to find necessary pages
     * @returns {Promise<Page[]>} Promise that resolves with list of pages or rejects with error
     */
    public getPages(chapter: Chapter): Promise<Page[]> {
        return this.db.query(`SELECT * FROM pages WHERE chapter_id=?`, [chapter.st_id]).then((data) => {
            var results = data.res.rows;
            var pages: Page[] = [];
            for (let i = 0, length = results.length; i < length; i++) {
                pages.push({
                    pg_id: results.item(i).id,
                    title: results.item(i).title,
                    content: results.item(i).content,
                    export_id: results.item(i).export_id,
                    chapter: chapter
                });
            }
            chapter.pages = pages;
            return pages;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Get user's learning modules saved on desktop
     * 
     * @param {UserData} userdata Object that contains required information of user to find necessary modules
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of desktop's learning modules or rejects with error 
     */
    public getDesktopObjects(userdata: UserData): Promise<LearningModule[]> {
        var learningModules: LearningModule[] = [];
        return this.db.query(`SELECT * FROM learning_modules WHERE on_desktop=1`).then((data) => {
            var results = data.res.rows;
            for (let i = 0, length = results.length; i < length; i++) {
                learningModules.push({
                    lm_id: results.item(i).id,
                    title: results.item(i).title,
                    description: results.item(i).description,
                    ref_id: results.item(i).ref_id,
                    onDesktop: (results.item(i).on_desktop == 1) ? true : false,
                    status: Status.Local,
                    chapters: null,
                    course: null,
                    course_id: results.item(i).course_id
                });
            }
            return this.db.query(`SELECT id FROM courses WHERE user_id=?`, [userdata.user_id]);            
        }).then((data) => { 
            var results = data.res.rows;
            var ids = [];
            for (let i = 0, length = results.length; i < length; i++) {
                ids.push(results.item(i).id);
            }
            learningModules.filter(lm => ids.indexOf(lm.course_id) !== -1);
            return Promise.resolve(learningModules);
        }).then(() => { 
            return Promise.all(learningModules.map((lm) => this.getChapters(lm)));
        }).then(() => {
            return learningModules;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Saves user's learning module stored in database on desktop
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be saved on desktop
     * @returns {Promise<any>} Promise that resolves or rejects the result
     */
    public saveLearningModuleOnDesktop(learningModule: LearningModule): Promise<any> {
        return this.db.query('UPDATE learning_modules SET on_desktop = 1 WHERE id = ?', [learningModule.lm_id]).then(() => {
            learningModule.onDesktop = true;
        });
    }

    /**
     * Deletes user's learning module stored in database from desktop
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be removed from desktop
     * @returns {Promise<any>} Promise that resolves or rejects the result
     */
    public deleteLearningModuleFromDesktop(learningModule: LearningModule): Promise<any> {
        return this.db.query('UPDATE learning_modules SET on_desktop = 0 WHERE id = ?', [learningModule.lm_id]).then(() => {
            learningModule.onDesktop = false;
        });
    }

    /**
     * Saves or updates user's information in database
     * 
     * @param {UserData} userdata User's information to save or update
     * @returns {Promise<UserData>} Promise that resolves with saved user's information or rejects with error
     */
    public saveUserData(userdata: UserData): Promise<UserData> {
        return this.checkUser(userdata).then((hasRecord) => {
            if (!hasRecord) {
                return this.db.query(`INSERT INTO users(login, password, firstname, lastname, avatar) VALUES (?,?,?,?,?)`, [
                    userdata.login, userdata.password, userdata.firstname, userdata.lastname, userdata.avatar
                ]).then(() => {
                    return this.db.query(`select seq from sqlite_sequence where name="users"`)
                }).then((data) => {
                    userdata.user_id = data.res.rows.item(0).seq;
                    return userdata;
                });
            } else
                return this.db.query(`UPDATE users SET firstname = ?, lastname = ?, avatar = ? WHERE id = ?`, [
                    userdata.firstname, userdata.lastname, userdata.avatar, userdata.user_id
                ]).then(() => {
                    return userdata;
                })
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Saves or updates learning module's information in database including parent course, chapters, pages 
     * 
     * @param {LearningModule} learningModule Learning module to save or update
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    public saveLearningModule(learningModule: LearningModule): Promise<any> {
        return this.saveOrUpdateCourse(learningModule.course).then(() => {
            return this.saveOrUpdateLearningModule(learningModule);
        }).then(() => {
            return Promise.all(learningModule.chapters.map((chapter) => this.saveOrUpdateChapter(chapter)))
        });
    }

    /**
     * Saves or updates course's information in database 
     * 
     * @private
     * @param {Course} course Course to save or update 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    private saveOrUpdateCourse(course: Course): Promise<any> {
        return this.db.query(`INSERT OR REPLACE INTO courses(id, title, description, ref_id, user_id) VALUES(?,?,?,?,?)`, [
            course.course_id, course.title, course.description, course.ref_id, course.user.user_id
        ]).then(() => {
            return this.db.query(`SELECT id FROM courses WHERE ref_id=?`, [course.ref_id]);
        }).then((data) => {
            course.course_id = data.res.rows.item(0).id;
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Saves or updates learning module's information in database 
     * 
     * @private
     * @param {LearningModule} learningModule Learning module to save or update 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    private saveOrUpdateLearningModule(learningModule: LearningModule): Promise<any> {
        return this.db.query(`INSERT OR REPLACE INTO learning_modules(id, title, description, ref_id, on_desktop, course_id) VALUES
            (?,?,?,?,?,?)`, [
                learningModule.lm_id, learningModule.title, learningModule.description,
                learningModule.ref_id, (learningModule.onDesktop) ? 1 : 0, learningModule.course.course_id
            ]).then(() => {
                return this.db.query(`SELECT id FROM learning_modules WHERE ref_id=?`, [learningModule.ref_id]);
            }).then((data) => {
                learningModule.lm_id = data.res.rows.item(0).id;
            }).catch((error) => {
                return Promise.reject(error);
            });
    }

    /**
     * Saves or updates chapter's information in database
     * 
     * @private
     * @param {Chapter} chapter Chapter to save or update
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    private saveOrUpdateChapter(chapter: Chapter): Promise<any> {
        return this.db.query(`INSERT OR REPLACE INTO chapters(id, title, export_id, lm_id) VALUES(?,?,?,?)`, [
            chapter.st_id, chapter.title,
            chapter.export_id, chapter.learningModule.lm_id
        ]).then(() => {
            return this.db.query(`SELECT id FROM chapters WHERE export_id=?`, [chapter.export_id]);
        }).then((data) => {
            chapter.st_id = data.res.rows.item(0).id;
            return Promise.all(chapter.pages.map((page) => this.saveOrUpdatePage(page)));
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Saves or update page's information in database
     * 
     * @private
     * @param {Page} page Page to save or update
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    private saveOrUpdatePage(page: Page): Promise<any> {
        return this.db.query(`INSERT OR REPLACE INTO pages(id, title, content, export_id, chapter_id) VALUES(?,?,?,?,?)`, [
            page.pg_id, page.title, page.content, page.export_id, page.chapter.st_id
        ]).then(() => {
            return this.db.query(`SELECT id FROM pages WHERE export_id=?`, [page.export_id]);
        }).then((data) => {
            page.pg_id = data.res.rows.item(0).id;
        }).catch((error) => {
            return Promise.reject(error);
        });
    }
};