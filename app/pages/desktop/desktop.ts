import {Page, NavParams} from 'ionic-angular';
import {UserData} from '../../services/descriptions';

@Page({
  templateUrl: 'build/pages/desktop/desktop.html'
})
export class DesktopPage {
  private user: UserData;

  constructor(params: NavParams) {
    this.user = params.get('user');  
  }
}
