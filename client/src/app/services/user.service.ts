import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { User, LoginResult } from '@app/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    /**
     * Bejelentkezés az RRSM Manager felületbe. token-el tér vissza, státusz 200:ok, egyébként 400-al
     * @param {string} name felhasználói név
     * @param {string} password plain text jelszó
     */
    login(name: string, password: string): Observable<LoginResult> {
        return this.http.post<LoginResult>(`${environment.apiUrl}/users/login`, { name, password });
    }

    /**
     * Új felhasználót hoz létre. Státusz: 201:created, egyébként 400
     * @param {string} name új felhasználói név
     * @param {string} type Admin vagy Service user
     * @param {string} password plain text password
     */
    create(name: string, type: string, password: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/users`, { name, type, password });
    }

    /**
     * Fálhasználó adatainak módosítása. Státusz: 200: ok, egyébként 400
     * @param {uuid} id felhasználó uuid-je
     * @param {string} name felhasználói név
     * @param {string} type Felhasználó típusa: Admin vagy Service
     * @param {string} password Új jelszó
     */
    update(id: string, name?: string, type?: string, password?: string): Observable<User> {
        return this.http.patch<User>(`${environment.apiUrl}/users/${id}`, { name, type, password});
    }

    /**
     * Felhasználó törlése. Státusz: 200:ok, egyébként 400
     * @param id felhasználó id-je
     */
    delete(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/users/${id}`);
    }

    /**
     * Visszaadja valamennyi felhasználó adatát, Státusz 200:ok, egyébként 400
     */
    getAll(): Observable<User[]> {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }
}