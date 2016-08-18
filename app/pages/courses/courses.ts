import {Page, NavController, NavParams, Loading, Alert, Refresher} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {LearningModulesPage} from '../learning-modules/learning-modules';

import {AppManager} from '../../services/app-manager';
import {Course, UserData} from '../../services/descriptions';

/**
 * Contoller for page with list of user's courses
 * 
 * @export
 * @class CoursesPage
 * @implements {OnInit}
 */
@Page({
  templateUrl: 'build/pages/courses/courses.html'
})
export class CoursesPage implements OnInit {
  private static waitMessage = 'Загрузка учебных курсов...';
  private static error = 'Ошибка!';
  private static wrongData = 'Невозможно получить данные о курсах пользователя.';
  private user: UserData;
  private courses: Course[];

  constructor(private nav: NavController, private appManager: AppManager, params: NavParams) {
    this.user = params.get('user');
    this.courses = [];
  }

  public ngOnInit() {
    var loading = Loading.create({
      content: CoursesPage.waitMessage
    });
    this.nav.present(loading);

    this.appManager.getCourses(this.user).then((courses) => {
      this.courses = courses;
      loading.dismiss();
    }).catch((error) => {
      loading.dismiss();
      var alert = Alert.create({
        title: CoursesPage.error,
        message: CoursesPage.wrongData,
        buttons: ['ОК']
      });
      this.nav.present(alert);
    });
  }

  private onCourseClicked(course: Course) {
    this.nav.push(LearningModulesPage, { course: course });
  }

  private refreshCourses(refresher: Refresher) {
    this.appManager.getCourses(this.user).then((courses) => {
      this.courses = courses;
      refresher.complete();
    }).catch((error) => {
      refresher.cancel();
      var alert = Alert.create({
        title: CoursesPage.error,
        message: CoursesPage.wrongData,
        buttons: ['ОК']
      });
      this.nav.present(alert);
    })

  }


}
