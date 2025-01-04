import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ComposeComponent } from './pages/compose/compose.component';
import { WatchComponent } from './pages/watch/watch.component';
import { ReplayComponent } from './pages/replay/replay.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'compose/:url', component: ComposeComponent },
  { path: 'replay/:url', component: ReplayComponent },
  { path: ':url', component: WatchComponent },
  { path: '**', redirectTo: '' }
]; 