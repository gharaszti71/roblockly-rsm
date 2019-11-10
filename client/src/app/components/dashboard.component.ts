import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '@app/models';
import { UserService, AuthenticationService } from '@app/services';

@Component({ templateUrl: 'dashboard.component.html' })
export class DashboardComponent {
    loading = false;
    users: User[];

    columnDefs = [
        {headerName: 'Make', field: 'make', sortable: true, filter: true},
        {headerName: 'Model', field: 'model', sortable: true, filter: true},
        {headerName: 'Price', field: 'price', sortable: true, filter: true}
    ];

    rowData: any = [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ];

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.loading = true;
        this.userService.getAll().pipe(first()).subscribe(users => {
            this.loading = false;
            this.users = users;
        });
    }
}