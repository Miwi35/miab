import { Routes } from '@angular/router';
import { BroadcastCreatorGuard } from './shared/guards/broadcast-creator.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'record',
    loadComponent: () => import('./pages/record/record.component').then(m => m.RecordComponent)
  },
  {
    path: 'broadcast/:url',
    loadComponent: () => import('./pages/broadcast/broadcast.component').then(m => m.BroadcastComponent),
    canActivate: [BroadcastCreatorGuard]
  },
  {
    path: 'replay/:url',
    loadComponent: () => import('./pages/replay/replay.component').then(m => m.ReplayComponent)
  },
  {
    path: 'watch/:url',
    loadComponent: () => import('./pages/watch/watch.component').then(m => m.WatchComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
