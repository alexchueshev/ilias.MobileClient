import {App, IonicApp, NavController, Platform} from 'ionic-angular';
import {OnInit} from '@angular/core';

import {AppManager} from './services/app-manager';
import {Database} from './services/database';
import {Settings} from './services/settings';

import {DesktopPage} from './pages/desktop/desktop';
import {CoursesPage} from './pages/courses/courses';
import {LoginPage} from './pages/login/login';

@App({
  template: `<ion-menu [content]="content" >
      
      <ion-content>
        <ion-list>
          
          <button ion-item>
            <ion-avatar item-left>
              <img src="avatar-cher.png">
            </ion-avatar>
            <h1>Александр</h1>
            <p>Открыть профиль</p>
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item (click)="openPage(desktopPage)" detail-push>
            <ion-icon name="desktop" item-left></ion-icon>
            Рабочий стол
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>
          
          <button ion-item (click)="openPage(coursesPage)">
            <ion-icon name="school" item-left></ion-icon>
            Мои курсы
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item>
            <ion-icon name="settings" item-left></ion-icon>
            Настройки
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

          <button ion-item>
            <ion-icon name="log-out" item-left></ion-icon>
            Выход
            <ion-icon name="ios-arrow-forward-outline" item-right hideWhen="ios"></ion-icon>
          </button>

        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-nav id="menu-nav" #content [root]="rootPage"></ion-nav>`,
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [AppManager, Database, Settings]
})
export class MyApp implements OnInit {
  nav: NavController;

  /*Pages*/
  rootPage: any;
  desktopPage: any = DesktopPage;
  coursesPage: any = CoursesPage;

  constructor(private app: IonicApp, private platform: Platform,
    private appManager: AppManager, private database: Database, private settings: Settings) {
  }

  public openPage(page): void {
    this.nav.setRoot(page, null, { animate: true });
  }

  public ngOnInit() {
    this.platform.ready().then(() => {
      return Promise.all([
        this.appManager.initialize(),
        this.database.initialize(),
        this.settings.initialize()
      ]).then(() => {
        this.rootPage = DesktopPage;
        this.nav = this.app.getActiveNav();
      }).catch((error) => {
        return Promise.reject(error);
      })
    }).catch((error) => {
      console.log(error)
    });
  }
}  