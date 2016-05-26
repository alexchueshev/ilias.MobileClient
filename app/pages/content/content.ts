import {Page, ActionSheet, NavController, Modal} from 'ionic-angular';

import {TableOfContentPage} from '../table-of-content/table-of-content';

@Page({
  templateUrl: 'build/pages/content/content.html'
})
export class ContentPage {
  nav: NavController;

  constructor(nav: NavController) {
    this.nav = nav;
  }

  public openActions() {
    let actionSheet = ActionSheet.create({
      title: 'Настройки',
      buttons: [
        {
          text: 'Содержание',
          handler: () => this.openTableOfContents()
        }, {
          text: 'Закрыть',
          role: 'cancel'
        }
      ]
    });
    this.nav.present(actionSheet);
  }

  public openTableOfContents() {
    var modal = Modal.create(TableOfContentPage);
    this.nav.present(modal);
  }
}
