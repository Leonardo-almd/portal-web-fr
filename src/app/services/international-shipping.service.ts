import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PoComboFilter } from '@po-ui/ng-components';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternationalShippingService {
  private baseUrl = environment.baseUrl;
  constructor( private http: HttpClient) {}

  get(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`${this.baseUrl}/international-shipping?${filter}`)
    return result
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`${this.baseUrl}/international-shipping/${id}`)
    return firstValueFrom(result)
  }

  create(payload: any): Promise<any> {
    const result = this.http.post(`${this.baseUrl}/international-shipping`, payload)
    return firstValueFrom(result)
  }

  export(id: any){
    return this.http.get(`${this.baseUrl}/international-shipping/${id}/export`, {
      responseType: 'blob' as 'json'
    })
  }

}
