import {Page, NavController, NavParams} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {LearningModulesPage} from '../learning-modules/learning-modules';

import {AppManager} from '../../services/app-manager';
import {Course, UserData} from '../../services/descriptions';

@Page({
  templateUrl: 'build/pages/courses/courses.html'
})
export class CoursesPage implements OnInit {
  user: UserData;
  courses: Course[];

  constructor(private nav: NavController, private appManager: AppManager, params: NavParams) {
    this.user = params.get('user');
  }

  private onCourseClicked(course: Course) {
    this.nav.push(LearningModulesPage, { course: course });
  }

  public ngOnInit() {
    this.appManager.getCourses(this.user).then((courses) => {
      this.courses = courses;
    }).catch((error) => {
      console.log(error);
    });
  }

}
