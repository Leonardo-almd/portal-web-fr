import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.baseUrl;
  constructor( private http: HttpClient) {}

  getUsers(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`${this.baseUrl}/users?${filter}`)
    return result
  }

  async toggleUserRole(id: string, currentRole: boolean): Promise<void> {
      const result = this.http.patch(`${this.baseUrl}/users/${id}/role`, {currentRole}).subscribe({
        next: (data) => {
          console.log(data)
        }, error: (error) => {
          console.log(error)
        }
      })
  }

  deleteUser(id: string): Promise<any> {
    const result = this.http.delete(`${this.baseUrl}/users/${id}`)
    return firstValueFrom(result)
  }

  createUser(payload: any): Promise<any> {
    const result = this.http.post(`${this.baseUrl}/users`, payload)
    return firstValueFrom(result)
  }

  resetPassword(id: string, payload: any): Promise<any> {
    const result = this.http.patch(`${this.baseUrl}/users/${id}/reset-password`, payload)
    return firstValueFrom(result)
  }

}
