import {App, Platform, IonicApp} from 'ionic-angular';
import {StatusBar} from 'ionic-native';

import {Database} from './services/database';

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
  providers: [Database]
})
export class MyApp {
  nav: any;
  app: IonicApp;
  rootPage: any;
  desktopPage: any = DesktopPage;
  coursesPage: any = CoursesPage;

  constructor(platform: Platform, app: IonicApp, database: Database) {
    this.app = app;
    
    
    platform.ready().then(() => {
      this.rootPage = DesktopPage;
      this.nav = app.getActiveNav();
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      //window.StatusBar.styleDefault();
    });
  }

  public openPage(page): void {
    this.nav.setRoot(page, null, {animate:true});
  }
}  