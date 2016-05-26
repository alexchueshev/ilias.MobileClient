import {Page, NavController} from 'ionic-angular';

import {LearningModulesPage} from '../learning-modules/learning-modules';

@Page({
  templateUrl: 'build/pages/courses/courses.html'
})
export class CoursesPage {
  nav: NavController;

  constructor(nav: NavController) {
    this.nav = nav;
  }

  public onCourseClicked() {
    this.nav.push(LearningModulesPage);
  }
}
