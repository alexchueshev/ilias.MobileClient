import {Page, NavController} from 'ionic-angular';

import {ContentPage} from '../content/content';

@Page({
  templateUrl: 'build/pages/learning-modules/learning-modules.html'
})
export class LearningModulesPage {
  nav: NavController;

  constructor(nav: NavController) {
    this.nav = nav;
  }

  public onLearningModuleClick() {
    this.nav.push(ContentPage);
  }
}
