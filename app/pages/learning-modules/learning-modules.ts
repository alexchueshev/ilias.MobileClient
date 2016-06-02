import {Page, NavController, NavParams} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {ContentPage} from '../content/content';
import {AppManager} from '../../services/app-manager';
import {Course, LearningModule, Status} from '../../services/descriptions';

@Page({
  templateUrl: 'build/pages/learning-modules/learning-modules.html'
})
export class LearningModulesPage implements OnInit {
  private course: Course;
  private learningModules: LearningModule[];
  private localStatus: Status = Status.Local;
  private remoteStatus: Status = Status.Remote;
  
  constructor(private nav: NavController, private appManager: AppManager, params: NavParams) {
    this.course = params.get('course');
  }

  private onLearningModuleClick() {
    this.nav.push(ContentPage);
  }

  private getStatus(module:LearningModule): string {
    var status = module.status;
    //if there Local and Remote flags (Local | Remote ) return Local one using priority
    if ((status & Status.Local) == Status.Local)
      return Status[Status.Local];
    if ((status & Status.Remote) == Status.Remote)
      return Status[Status.Remote]; 
  }

  public ngOnInit() {
    this.appManager.getCourseInfo(this.course).then((learningModules) => {
      this.learningModules = learningModules;
    }).catch((error) => {
      console.log(error);
    });
  }
  
}
