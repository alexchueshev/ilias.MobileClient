import {Page, NavController, NavParams, Loading, Alert, Refresher} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {ContentPage} from '../content/content';
import {AppManager} from '../../services/app-manager';
import {Course, LearningModule, Status} from '../../services/descriptions';

/**
 * Controller for page with list of user's learning modules
 * 
 * @export
 * @class LearningModulesPage
 * @implements {OnInit}
 */
@Page({
  templateUrl: 'build/pages/learning-modules/learning-modules.html'
})
export class LearningModulesPage implements OnInit {
  private static waitLoadingPage = 'Загрузка учебных курсов...';
  private static waitMessage = 'Пожалуйста, подождите...';
  private static error = 'Ошибка!';
  private static downloadError = 'Невозможно загрузить учебный модуль. Проверьте интернет соединение.';
  private static loadError = 'Невозможно получить данные об учебных модулях пользователя. '
  private course: Course;
  private learningModules: LearningModule[];

  constructor(private nav: NavController, private appManager: AppManager, params: NavParams) {
    this.course = params.get('course');
  }

  public ngOnInit() {
    var loading = Loading.create({
      content: LearningModulesPage.waitLoadingPage
    });
    this.nav.present(loading);

    this.appManager.getCourseInfo(this.course).then((learningModules) => {
      this.learningModules = learningModules;
      loading.dismiss();
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: LearningModulesPage.error,
        message: LearningModulesPage.loadError,
        buttons: ['ОК']
      });
      this.nav.present(alert);
    });
  }

  private onLearningModuleClick(learningModule: LearningModule) {
    if ((learningModule.status & Status.Local) == Status.Local)
      this.nav.push(ContentPage, { learningModule: learningModule });
    else {
      var alert = Alert.create({
        title: 'Информация',
        message: 'Для открытия учебного модуля необходимо его загрузить. Загрузить?',
        buttons: [
          {
            text: 'Нет'
          },
          {
            text: 'Да',
            handler: () => this.downloadModule(learningModule)
          }
        ]
      })
      this.nav.present(alert);
    }
  }

  private getStatus(module: LearningModule): string {
    var status = module.status;
    //if there Local and Remote flags (Local | Remote ) return Local one using priority
    if ((status & Status.Local) == Status.Local)
      return Status[Status.Local];
    if ((status & Status.Remote) == Status.Remote)
      return Status[Status.Remote];
  }

  private downloadModule(learningModule: LearningModule) {
    var loading = Loading.create({
      content: LearningModulesPage.waitMessage
    });
    this.nav.present(loading);

    this.appManager.downloadModule(learningModule).then(() => {
      loading.dismiss();
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: LearningModulesPage.error,
        message: LearningModulesPage.downloadError,
        buttons: ['ОК']
      });
      this.nav.present(alert);
    })
  }

  private refreshLearningModules(refresher: Refresher) {
    this.appManager.getCourseInfo(this.course).then((learningModules) => {
      this.learningModules = learningModules;
      refresher.complete();
    }).catch((error) => {
      refresher.cancel();
      var alert = Alert.create({
        title: LearningModulesPage.error,
        message: LearningModulesPage.loadError,
        buttons: ['ОК']
      });
      this.nav.present(alert);
    });
  }

  private modifyDesktop(learningModule: LearningModule) {
    if ((learningModule.status & Status.Local) == Status.Local) {
      //remove
      if (learningModule.onDesktop)
        this.appManager.deleteLearningModuleFromDesktop(learningModule);
      else  //add
        this.appManager.saveLearningModuleOnDesktop(learningModule);
    } else {
      var alert = Alert.create({
        title: 'Информация',
        message: 'Для добавления учебного модуля на рабочий стол необходимо его загрузить. Загрузить?',
        buttons: [
          {
            text: 'Нет',
            handler: () => alert.dismiss()
          },
          {
            text: 'Да',
            handler: () => {
              this.downloadModule(learningModule);
              alert.dismiss();
            }
          }
        ]
      })
      this.nav.present(alert);
    }
  }
}
