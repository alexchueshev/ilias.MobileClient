import {LearningModule, Chapter, Page, MediaObject} from '../services/descriptions';
import {Filesystem} from '../services/filesystem';

/**
 * Describes manifest file using by learning module
 * 
 * @interface Manifest
 */
interface Manifest {
    /**
     * File entry with the structure of module
     * @type {FileEntry}
     */
    learningModuleFile: FileEntry;
    /**
     * File entry with the content of module
     * @type {FileEntry}
     */
    contentFile: FileEntry;
    /**
     * File entry with data of module's media objects 
     * @type {FileEntry}
     */
    mediaFile: FileEntry;
}

/**
 * Builder for learning module, prepares it for saving, uses xml-presentation
 * 
 * @export
 * @class LearningModuleBuilder
 */
export class LearningModuleBuilder {
    /**
     * Contains information about module's manifest file
     * @private
     * @type {Manifest}
     */
    private manifest: Manifest;
    /**
     * List of module's chapters
     * @private
     * @type {Chapter[]}
     */
    private chapters: Chapter[];
    /**
     * List of module's media objects
     * @private
     * @type {MediaObject[]}
     */
    private media: MediaObject[];

    /**
     * Creates an instance of LearningModuleBuilder
     * 
     * @param {LearningModule} learningModule Instance of module that contains basic information without saved data and content
     * @param {Filesystem} filesystem Instance of filesystem service
     */
    constructor(private learningModule: LearningModule, private filesystem: Filesystem) {
        this.chapters = [];
        this.media = [];
    }

    /**
     * First step of building.
     * Parses manifest file of module to determine all paths
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    public parseManifest(): Promise<any> {
        return this.filesystem.readFile(this.learningModule.directory, 'manifest.xml').then((content) => {
            var xmlDoc = new DOMParser().parseFromString(content, 'text/xml');
            var learningModulePath = xmlDoc.querySelector('ExportFile[Component="Modules/LearningModule"]')
                .getAttribute('Path');
            var contentPath = xmlDoc.querySelector('ExportFile[Component="Services/COPage"]')
                .getAttribute('Path');
            var mediaPath = xmlDoc.querySelector('ExportFile[Component="Services/MediaObjects"]')
                .getAttribute('Path');
            return Promise.all([
                this.filesystem.getFile(this.learningModule.directory, learningModulePath),
                this.filesystem.getFile(this.learningModule.directory, contentPath),
                this.filesystem.getFile(this.learningModule.directory, mediaPath)
            ])
        }).then(([file1, file2, file3]) => {
            this.manifest = {
                learningModuleFile: file1,
                contentFile: file2,
                mediaFile: file3
            }
            return;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Optional step.
     * Parses information about included objects and moves them to module's directory
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    public parseMediaObjects(): Promise<any> {
        var dir, cont;

        return this.filesystem.createPersistentDir(this.learningModule.ref_id.toString()).then((directory) => {
            dir = directory;
            return this.filesystem.readFileEntry(this.manifest.mediaFile);
        }).then((content) => {
            cont = content;
            return this.filesystem.getDirectory(this.learningModule.directory, 'Services');
        }).then((servicesDir) => {
            return this.filesystem.moveDir(servicesDir, 'MediaObjects', dir);
        }).then(() => {
            return this.createMediaObjects(cont, dir);
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Second step.
     * Creates the tree of module using Manifest and LearningModule files
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    public parseStructureTree(): Promise<any> {
        return this.filesystem.readFileEntry(this.manifest.learningModuleFile).then((content) => {
            this.createStructureTree(content);
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Third step.
     * Parses text content of module's chapters
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of operation
     */
    public parseChapters(): Promise<any> {
        return this.filesystem.readFileEntry(this.manifest.contentFile).then((content) => {
            var xmlDoc = new DOMParser().parseFromString(content, 'text/xml');
            this.chapters.forEach((chapter) => {
                chapter.pages.forEach((page) => {
                    this.parsePage(xmlDoc.querySelector(
                        `ExportItem[Id="${'lm'.concat(':', page.export_id.toString())}"]`), page);
                })
            })
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets instance of learning module
     * 
     * @returns {LearningModule} Learning module with information in accordance with executed steps
     */
    public getLearningModule(): LearningModule {
        this.learningModule.chapters = this.chapters;
        return this.learningModule;
    }

    /**
     * Creates structure tree from xml string
     * 
     * @private
     * @param {string} content Xml presentation of structure tree
     */
    private createStructureTree(content: string) {
        var xmlDoc = new DOMParser().parseFromString(content, 'text/xml');
        var nodes = xmlDoc.querySelectorAll('LmTree');
        for (let i = 0, length = nodes.length; i < length; i++) {
            var type = nodes[i].getElementsByTagName('Type')[0].textContent;
            if (type === 'st') {
                this.chapters.push(this.createChapter(nodes[i]));
            } else if (type === 'pg') {
                var chapter = this.chapters[this.chapters.length - 1];
                chapter.pages.push(this.createPage(nodes[i], chapter));
            }
        }
    }

    /**
     * Constructs chapter from xml node
     * 
     * @private
     * @param {Element} node Xml node of chapter
     * @returns {Chapter} Instance of chapter
     */
    private createChapter(node: Element): Chapter {
        return {
            title: node.getElementsByTagName('Title')[0].textContent,
            export_id: +node.getElementsByTagName('Child')[0].textContent,
            learningModule: this.learningModule,
            pages: []
        };
    }

    /**
     * Constructs page from xml node
     * 
     * @private
     * @param {Element} node Xml node of page
     * @param {Chapter} chapter Parent page's chapter
     * @returns {Page} Instance of page
     */
    private createPage(node: Element, chapter: Chapter): Page {
        return {
            title: node.getElementsByTagName('Title')[0].textContent,
            export_id: +node.getElementsByTagName('Child')[0].textContent,
            content: '',
            chapter: chapter
        }
    }

    /**
     * Parses content of the page from xml node
     * 
     * @private
     * @param {Element} node Xml node that contains content
     * @param {Page} page Target page
     */
    private parsePage(node: Element, page: Page) {
        var pageObject = node.querySelector('PageObject');
        var result = '';
        var contents = pageObject.querySelectorAll('PageContent');
        for (let i = 0, length = contents.length; i < length; i++) {
            var paragraph = contents[i].getElementsByTagName('Paragraph');
            var media = contents[i].getElementsByTagName('MediaObject');
            if (paragraph.length > 0)
                result += contents[i].innerHTML;
            else if (media.length > 0)
                result += this.createMedia(media[0].getElementsByTagName('MediaAlias')[0].getAttribute('OriginId'));     
        }
        page.content = this.convertToHtml(result);
    }

    /**
     * Constructs HTML tag for media object
     * 
     * @private
     * @param {string} originId Unique identifier of media object 
     * @returns {string} HTML string that contains media object's description
     */
    private createMedia(originId: string): string {
        var media = this.media.find((m) => originId.indexOf(m.mob_id.toString()) !== -1);
        return `<img src="${media.location.replace('Services/','')}">`;
    }

    /**
     * Constructs list of media objects
     * 
     * @private
     * @param {string} content XML content that describes media objects
     * @param {DirectoryEntry} dir Media object's location
     */
    private createMediaObjects(content: string, dir: DirectoryEntry) {
        var xmlDoc = new DOMParser().parseFromString(content, 'text/xml');
        var exportItems = xmlDoc.querySelectorAll('ExportItem');
        for (let i = 0, length = exportItems.length; i < length; i++) {
            var mob = exportItems[i].querySelector('Mob');
            var mobMediaItem = exportItems[i].querySelector('MobMediaItem');
            this.media.push({
                mob_id: +mobMediaItem.getElementsByTagName('MobId')[0].textContent,
                width: +mobMediaItem.getElementsByTagName('Width')[0].textContent,
                height: +mobMediaItem.getElementsByTagName('Height')[0].textContent,
                halign: (mobMediaItem.getElementsByTagName('Halign').length > 0) ?
                    mobMediaItem.getElementsByTagName('Halign')[0].textContent : '',
                caption: (mobMediaItem.getElementsByTagName('Caption').length > 0) ?
                    mobMediaItem.getElementsByTagName('Caption')[0].textContent : '',
                location: dir.toURL() + mob.getElementsByTagName('Dir')[0].textContent + '/'
                + mobMediaItem.getElementsByTagName('Location')[0].textContent,
                locationType: mobMediaItem.getElementsByTagName('LocationType')[0].textContent,
                format: mobMediaItem.getElementsByTagName('Format')[0].textContent
            });
        }
    }

    /**
     * Converts XML string to HTML string
     * 
     * @private
     * @param {string} content XML string
     * @returns {string} HTML string
     */
    private convertToHtml(content: string): string {
        return content.replace(/SimpleBulletList/gi, "ul")
            .replace(/SimpleListItem/gi, "li").replace(/Paragraph/gi, "p").replace(/Emph/gi, "i");
    }
}