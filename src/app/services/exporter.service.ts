import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PoComboFilter } from '@po-ui/ng-components';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExporterService implements PoComboFilter {
  private baseUrl = environment.baseUrl;
  constructor( private http: HttpClient) {}

  getFilteredData(params: any): Observable<any> {
    const value = params.value;
    return this.http
      .get<any[]>(`${this.baseUrl}/exporter/quicksearch`, {
        params: {value}
      });
  }

  getObjectByValue(value: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/exporter/quicksearch/${value}`);
  }

  get(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`${this.baseUrl}/exporter?${filter}`)
    return result
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`${this.baseUrl}/exporter/${id}`)
    return firstValueFrom(result)
  }

  create(payload: any): Promise<any> {
    console.log(payload)
    const result = this.http.post(`${this.baseUrl}/exporter`, payload)
    return firstValueFrom(result)
  }

  getAddressIBGE(zipcode: string): Promise<any> {
    const result = this.http.get(`https://viacep.com.br/ws/${zipcode}/json/`)
    return firstValueFrom(result)
  }
}
