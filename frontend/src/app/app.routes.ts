import { Routes } from '@angular/router';
import { BroadcastCreatorGuard } from './shared/guards/broadcast-creator.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'compose/:url',
    loadComponent: () => import('./pages/compose/compose.component').then(m => m.ComposeComponent),
    canActivate: [BroadcastCreatorGuard]
  },
  {
    path: ':url',
    loadComponent: () => import('./pages/watch/watch.component').then(m => m.WatchComponent)
  }
];
