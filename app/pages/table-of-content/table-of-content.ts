import {Page, ViewController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/table-of-content/table-of-content.html'
})
export class TableOfContentPage {
  viewCtrl: ViewController;

  constructor(viewCtrl: ViewController) {
    this.viewCtrl = viewCtrl;
  }

  close() {
    this.viewCtrl.dismiss();
  }
}
