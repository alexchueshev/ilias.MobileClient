import {Page, ActionSheet, NavController, Modal, NavParams, Platform, Loading} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {LearningModule, Chapter} from '../../services/descriptions';
import {TableOfContentPage} from '../table-of-content/table-of-content';

/**
 * Controller with HTML content of learning module
 * 
 * @export
 * @class ContentPage
 * @implements {OnInit}
 */
@Page({
  templateUrl: 'build/pages/content/content.html'
})
export class ContentPage implements OnInit {
  private static waitMessage = 'Загрузка учебного контента...';
  private learningModule: LearningModule;
  private title: string;
  private content: string;

  constructor(private nav: NavController, private platfrom: Platform, params: NavParams) {
    this.learningModule = params.get('learningModule');
    this.content = '';
  }

  public ngOnInit() {
    if (this.learningModule.chapters.length > 0)
      this.loadChapter(this.learningModule.chapters[0]);
  }

  private openActions() {
    let actionSheet = ActionSheet.create({
      title: 'Настройки',
      buttons: [
        {
          text: 'Содержание',
          handler: () => this.openTableOfContents(),
          icon: !this.platfrom.is('ios') ? 'list-box' : null
        }, {
          text: 'Закрыть',
          role: 'cancel',
          icon: !this.platfrom.is('ios') ? 'close' : null,
        }
      ]
    });
    this.nav.present(actionSheet);
  }

  private loadChapter(chapter) {
    this.title = chapter.title;
    this.content = chapter.pages.map((page) => page.content).join('');
  }

  private openTableOfContents() {
    var modal = Modal.create(TableOfContentPage, { chapters: this.learningModule.chapters });
    modal.onDismiss((chapter: Chapter) => {
      if (chapter) this.loadChapter(chapter);
    })
    this.nav.present(modal);
  }
}
