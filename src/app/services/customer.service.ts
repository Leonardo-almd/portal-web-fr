import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PoComboFilter } from '@po-ui/ng-components';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService implements PoComboFilter {
  private baseUrl = environment.baseUrl;
  constructor( private http: HttpClient) {}

  getFilteredData(params: any): Observable<any> {
    const value = params.value;
    return this.http
      .get<any[]>(`${this.baseUrl}/customer/quicksearch`, {
        params: {value}
      });
  }

  getObjectByValue(value: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/customer/quicksearch/${value}`);
  }

  get(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`${this.baseUrl}/customer?${filter}`)
    return result
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`${this.baseUrl}/customer/${id}`)
    return firstValueFrom(result)
  }

  create(payload: any): Promise<any> {
    const result = this.http.post(`${this.baseUrl}/customer`, payload)
    return firstValueFrom(result)
  }

  getAddressIBGE(zipcode: string): Promise<any> {
    const result = this.http.get(`https://viacep.com.br/ws/${zipcode}/json/`)
    return firstValueFrom(result)
  }
}
