  
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent, DashboardComponent } from './components';
import { AuthGuard } from './helpers';

const routes: Routes = [
    { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
