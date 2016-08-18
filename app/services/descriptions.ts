/**
 * Describes OAuth2.0 data to access LMS server
 * 
 * @export
 * @interface UserAccess
 */
export interface UserAccess {
    /**
     * User's login
     * @type {string}
     */
    login: string,
    /**
     * User's password
     * @type {string}
     */
    password: string,
    /**
     * Access_token to determine user's privileges
     * @type {string}
     */
    access_token: string,
    /**
     * Refresh_token to update access_token
     * @type {string}
     */
    refresh_token: string,
    /**
     * Expiration time of access_token
     * @type {number}
     */
    expires_in: number,
    /**
     * Type of access_token. Supports only 'bearer'.
     * @type {string}
     */
    token_type: string
}

/**
 * Describes user's information stored in database and LMS server
 * 
 * @export
 * @interface UserData
 */
export interface UserData {
    /**
     * Table's key of current user
     * @type {number}
     */
    user_id?: number;
    /**
     * User's login
     * @type {string}
     */
    login: string;
    /**
     * User's password
     * @type {string}
     */
    password: string;
    /**
     * User's firstname
     * @type {string}
     */
    firstname?: string;
    /**
     * User's lastname
     * @type {string}
     */
    lastname?: string;
    /**
     * Path to user's avatar stored on device
     * @type {string}
     */
    avatar?: string;
}

/**
 * Describes status of ILIAS Objects
 * 
 * @export
 * @enum {number}
 */
export enum Status {
    /**
     * Flag to determine local objects saved on user's device
     * @Flag
     */
    Local = 1 << 0,
    /**
     * Flag to determine remote objects saved in LMS system
     * @Flag
     */
    Remote = 1 << 1,
    /**
     * Flag to determine error
     * @Flag
     */
    None = 1 << 2
} 

/**
 * Describes course stored on device or in LMS system
 * 
 * @export
 * @interface Course
 */
export interface Course {
    /**
     * Table's key of current course
     * @type {number}
     */
    course_id?: number;
    /**
     * Course's title
     * @type {string}
     */
    title: string;
    /**
     * Course's description
     * @type {string}
     */
    description?: string;
    /**
     * Course's ref_id to identify object on LMS server
     * @type {number}
     */
    ref_id: number;
    /**
     * Course's status
     * @type {Status}
     */
    status: Status;
    /**
     * Course's owner
     * @type {UserData}
     */
    user: UserData;
}

/**
 * Describes learning module stored on device or in LMS system
 * 
 * @export
 * @interface LearningModule
 */
export interface LearningModule {
    /**
     * Table's key of learning module
     * @type {number}
     */
    lm_id?: number;
    /**
     * Learning module's title
     * @type {string}
     */
    title: string;
    /**
     * Learning module's description
     * @type {string}
     */
    description?: string;
    /**
     * Learning module's ref_id to identify object on LMS server
     * @type {number}
     */
    ref_id: number;
    /**
     * Learning module's status
     * @type {Status}
     */
    status: Status;
    /**
     * Desktop status of learning module
     * @type {Boolean}
     */
    onDesktop: Boolean;
    /**
     * Parent course of learning module
     * @type {Course}
     */
    course: Course;
    /**
     * List of learning module's chapters
     * @type {Chapter[]}
     */
    chapters: Chapter[];
    /**
     * Directory entry where module's content was saved
     * @type {DirectoryEntry}
     */
    directory?: DirectoryEntry;
}

/**
 * Describes chapter stored on device or in LMS system
 * 
 * @export
 * @interface Chapter
 */
export interface Chapter {
    /**
     * Table's key of chapter
     * @type {number}
     */
    st_id?: number;
    /**
     * Chapter's title
     * @type {string}
     */
    title: string;
    /**
     * Chapter's export_id to identify in xml file of learning module
     * @type {number}
     */
    export_id: number;
    /**
     * Parent learning module of chapter
     * @type {LearningModule}
     */
    learningModule: LearningModule;
    /**
     * List of chapter's pages
     * @type {Page[]}
     */
    pages: Page[];
}

/**
 * Describes page stored on device or in LMS system
 * 
 * @export
 * @interface Page
 */
export interface Page {
    /**
     * Table's key of page
     * @type {number}
     */
    pg_id?: number;
    /**
     * Page's title
     * @type {string}
     */
    title: string;
    /**
     * Page's content in HTML format
     * @type {string}
     */
    content: string;
    /**
     * Page's export_id to identify in xml file of learning module
     * @type {number}
     */
    export_id: number;
    /**
     * Parent chapter of page
     * @type {Chapter}
     */
    chapter: Chapter;
}

/**
 * Describes data of media objects written in xml files of learning module
 *
 * @export
 * @interface MediaObject
 */
export interface MediaObject {
    /**
     * Object's id to identify in xml files of learning module
     * @type {number}
     */
    mob_id: number;
    /**
     * Object's width
     * @type {number}
     */
    width: number;
    /**
     * Object's height
     * @type {number}
     */
    height: number;
    /**
     * Object's horizontal align
     * @type {string}
     */
    halign?: string;
    /**
     * Object's caption
     * @type {string}
     */
    caption?: string;
    /**
     * Location of object
     * @type {string}
     */
    location: string;
    /**
     * Type of object's location
     * @type {string}
     */
    locationType: string;
    /**
     * Object's format
     * @type {string}
     */
    format: string;
}