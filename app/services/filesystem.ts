/// <reference path="../../typings/index.d.ts" />
import {Injectable} from '@angular/core';
import {File, Transfer} from 'ionic-native';

/**
 * Service for adapting Cordova Plugins related to filesystem functions 
 * 
 * @export
 * @class Filesystem
 */
@Injectable()
export class Filesystem {

    /**
     * Flag for using temporary storage 
     * 
     * @static
     * @type {number}
     */
    public static TEMPORARY: number = 0;

    /**
     * Flag for using persistent storage 
     * 
     * @static
     * @type {number}
     */
    public static PERSISTENT: number = 1;

    /**
     * Instance of temporary storage
     * 
     * @private
     * @type {FileSystem}
     */
    private tempFileSystem: FileSystem;

    /**
     * Instance of persistent storage
     * 
     * @private
     * @type {FileSystem}
     */
    private persistentFileSystem: FileSystem;
    
    /**
     * Instance of Cordova Plugin's class to download and upload files using connection to Internet
     * 
     * @private
     * @type {Transfer}
     */
    private transfer: Transfer;

    /**
     * Creates an instance of Filesystem.
     */
    constructor() {
    }

    /**
     * Initializes storages for further working
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of initialization proccess
     */
    public initialize(): Promise<any> {
        var resolveFn, rejectFn;
        var promise = new Promise((resolve, reject) => { resolveFn = resolve, rejectFn = reject });
        try {
            this.transfer = new Transfer();
            window.requestFileSystem(window.TEMPORARY, 0, (tempFileSystem) => {
                this.tempFileSystem = tempFileSystem;
                window.requestFileSystem(window.PERSISTENT, 0, (persistentFileSystem) => {
                    this.persistentFileSystem = persistentFileSystem;
                    resolveFn();
                }, (fileError) => {
                    rejectFn(fileError);
                });
            }, (fileError) => {
                rejectFn(fileError);
            });
        } catch (error) {
            rejectFn(error);
        }
        return promise;
    }

    /**
     * Downloads file using connection to Internet
     * 
     * @param {string} url URL of the server to download the file
     * @param {number} type Type of storage to save the downloaded file
     * @param {{ filename: string, headers?: Object }} settings Object that contains filename needed to save downloaded file and necessary headers
     * @returns {Promise<FileEntry>} Promise that resolves with FileEntry object of downloaded file or rejects with error
     */
    public downloadFile(url: string, type: number, settings: { filename: string, headers?: Object }): Promise<FileEntry> {
        var target = (type === Filesystem.TEMPORARY) ? this.tempFileSystem.root.toURL() : this.persistentFileSystem.root.toURL();
        return File.createFile(target, settings.filename, true).then((file: FileEntry) => {
            return this.transfer.download(encodeURI(url), file.toURL(), true, {
                headers: settings.headers
            });
        });
    }

    /**
     * Unzips packet to 'unziped' folder in specified directory
     * 
     * @param {FileEntry} source Zip-packet entry
     * @param {DirectoryEntry} [destination] Directory entry for creating 'unzipped' folder with unzipped files or default temporary storage
     * @returns {Promise<DirectoryEntry>} Promise that resolves with 'unzipped' directory entry or rejects with error
     */
    public unzip(source: FileEntry, destination?: DirectoryEntry): Promise<DirectoryEntry> {
        var resolveFn, rejectFn;
        var promise = new Promise((resolve, reject) => { resolveFn = resolve; rejectFn = reject });
        var destinationDir = destination || this.tempFileSystem.root;

        File.createDir(destinationDir.toURL(), 'unziped', true).then((unzipedEntry: DirectoryEntry) => {
            zip.unzip(source.toURL(), unzipedEntry.toURL(), (result) => {
                console.log(result);
                if (result != 0)
                    rejectFn();
                resolveFn(unzipedEntry);
            })
        }).catch((error) => {
            return Promise.reject(error);
        })
        return promise;
    }

    /**
     * Combines functions for downloading zip-packet and unzipping it to the temporary storage
     * 
     * @param {string} url URL of the server to download the file
     * @param {number} type Type of storage to save the downloaded file
     * @param {{ filename: string, headers?: Object }} settings Object that contains filename needed to save downloaded file and necessary headers
     * @returns {Promise<DirectoryEntry>} Promise that resolves with 'unzipped' directory entry or rejects with error
     */
    public downloadAndUnzip(url: string, type: number, settings: { filename: string, headers?: Object }): Promise<DirectoryEntry> {
        return this.downloadFile(url, type, settings).then((fileEntry) => {
            return this.unzip(fileEntry);
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Reads all directory entries in specified directory
     * 
     * @param {DirectoryEntry} target Specified directory to read from 
     * @returns {Promise<Entry[]>} Promise that resolves with lists of readed entries or rejects with error
     */
    public getDirectoryEntries(target: DirectoryEntry): Promise<Entry[]> {
        return new Promise((resolve, reject) => {
            target.createReader().readEntries((entries) => {
                resolve(entries);
            }, (error) => {
                reject(error);
            })
        });
    }

    /**
     * Creates directory in the root of persistent storage
     * 
     * @param {string} name Name of the created directory
     * @returns {Promise<DirectoryEntry>} Promise that resolves with created directory entry or rejects with error
     */
    public createPersistentDir(name: string): Promise<DirectoryEntry> {
        return File.createDir(this.persistentFileSystem.root.toURL(), name, true);
    }

    /**
     * Moves directory to specified destination
     * 
     * @param {DirectoryEntry} dir Moved directory entry
     * @param {string} dirName Directory name
     * @param {DirectoryEntry} newDir Specified directory to move
     * @returns {Promise<any>} Promise that resolves or rejects the result of moving
     */
    public moveDir(dir: DirectoryEntry, dirName: string, newDir: DirectoryEntry): Promise<any> {
        return File.checkDir(newDir.toURL(), dirName).then(() => {
            return File.removeRecursively(newDir.toURL(), dirName);
        }).then(() => {
            return File.moveDir(dir.toURL(), dirName, newDir.toURL(), dirName);
        }).catch(() => {
            return File.moveDir(dir.toURL(), dirName, newDir.toURL(), dirName);
        })
    }

    /**
     * Cleans 'uzipped' folder
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of cleaning
     */
    public cleanCache(): Promise<any> {
        return File.removeRecursively(this.tempFileSystem.root.toURL(), 'unziped');
    }

    /**
     * Reads file as text in specified directory
     * 
     * @param {DirectoryEntry} directory Specified directory where the file is stored
     * @param {string} filename Name of the file to read
     * @returns {Promise<string>} Promise that resolves with content of the file or rejects with error
     */
    public readFile(directory: DirectoryEntry, filename: string): Promise<string> {
        return File.readAsText(directory.toURL(), filename);
    }

    /**
     * Reads content of file entry as text in specified directory
     * 
     * @param {FileEntry} file Specified file entry to read
     * @returns {Promise<string>} Promise that resolves with content of the file or rejects with error
     */
    public readFileEntry(file: FileEntry): Promise<string> {
        return this.readFile(file.filesystem.root, file.fullPath.substr(1));
    }

    /**
     * Gets directory entry from specified path
     * 
     * @param {DirectoryEntry} directory Parent directory entry to start searching
     * @param {string} path Specified path from parent directory
     * @returns {Promise<DirectoryEntry>} Promise that resolves with found directory entry or rejects with error
     */
    public getDirectory(directory: DirectoryEntry, path: string): Promise<DirectoryEntry> {
        return File.checkDir(directory.toURL(), path);
    }

    /**
     * Gets file entry from specified file
     * 
     * @param {DirectoryEntry} directory Parent directory entry to start searching
     * @param {string} path Specified path from parent directory
     * @returns {Promise<FileEntry>} Promise that resolves with found file entry or rejects with error
     */
    public getFile(directory: DirectoryEntry, path: string): Promise<FileEntry> {
        return File.checkFile(directory.toURL(), path);
    }
};