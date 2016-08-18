import {Page, ViewController, NavParams} from 'ionic-angular';
import {Chapter} from '../../services/descriptions';

/**
 * Controller for page with list of module's chapters
 * 
 * @export
 * @class TableOfContentPage
 */
@Page({
  templateUrl: 'build/pages/table-of-content/table-of-content.html'
})
export class TableOfContentPage {
  private chapters: Chapter[];
  constructor(private viewCtrl: ViewController, params: NavParams) {
    this.chapters = params.get('chapters');
  }

  private onChapterClicked(chapter: Chapter) {
    this.close(chapter);
  }

  private close(data?) {
    this.viewCtrl.dismiss(data);
  }
}
