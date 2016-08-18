import {Page, NavParams, NavController, Refresher, Loading, Alert} from 'ionic-angular';
import {UserData, LearningModule} from '../../services/descriptions';
import {AppManager} from '../../services/app-manager';
import {OnInit} from '@angular/core';
import {ContentPage} from '../content/content';

/**
 * Controller for page with list of desktop's objects
 * 
 * @export
 * @class DesktopPage
 * @implements {OnInit}
 */
@Page({
  templateUrl: 'build/pages/desktop/desktop.html'
})
export class DesktopPage implements OnInit {
  private user: UserData;
  private learningModules: LearningModule[];

  constructor(params: NavParams, private appManager: AppManager, private nav: NavController) {
    this.user = params.get('user');
    this.learningModules = [];
  }

  public ngOnInit() {
    var loading = Loading.create({
      content: 'Загрузка рабочего стола...'
    });
    this.nav.present(loading);
    
    this.appManager.getDesktopObjects(this.user).then((learningModules) => {
      this.learningModules = learningModules;
      loading.dismiss();
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: 'Ошибка!',
        message: 'Невозможно загрузить данные рабочего стола.',
        buttons: ['OK']
      })
      this.nav.present(alert);
    })
  }

  private onLearningModuleClick(learningModule: LearningModule) {
    this.nav.push(ContentPage, { learningModule: learningModule });
  }

  private modifyDesktop(learningModule: LearningModule) {
    var loading = Loading.create({
      content: 'Пожалуйста, подождите...'
    });
    this.nav.present(loading);
    
    this.appManager.deleteLearningModuleFromDesktop(learningModule).then(() => {
      this.learningModules.splice(this.learningModules.indexOf(learningModule), 1);
      loading.dismiss();
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: 'Ошибка!',
        message: 'Невозможно обновить данные рабочего стола.',
        buttons: ['OK']
      })
      this.nav.present(alert);
    })
  }

  private refreshDesktop(refresher: Refresher) {
    this.appManager.getDesktopObjects(this.user).then((learningModules) => {
      this.learningModules = learningModules;
      refresher.complete();
    }).catch((error) => {
      refresher.cancel();
      var alert = Alert.create({
        title: 'Ошибка!',
        message: 'Невозможно обновить данные рабочего стола.',
        buttons: ['OK']
      })
      this.nav.present(alert);
    })
  }
}
