import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor( private http: HttpClient) {}

  getUsers(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`http://localhost:3000/users?${filter}`)
    return result
  }

  async toggleUserRole(id: string, currentRole: boolean): Promise<void> {
      const result = this.http.patch(`http://localhost:3000/users/${id}/role`, {currentRole}).subscribe({
        next: (data) => {
          console.log(data)
        }, error: (error) => {
          console.log(error)
        }
      })
  }

  deleteUser(id: string): Promise<any> {
    const result = this.http.delete(`http://localhost:3000/users/${id}`)
    return firstValueFrom(result)
  }

  createUser(payload: any): Promise<any> {
    const result = this.http.post(`http://localhost:3000/users`, payload)
    return firstValueFrom(result)
  }

  resetPassword(id: string, payload: any): Promise<any> {
    const result = this.http.patch(`http://localhost:3000/users/${id}/reset-password`, payload)
    return firstValueFrom(result)
  }

}
