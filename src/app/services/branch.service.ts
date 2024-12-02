import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PoComboFilter } from '@po-ui/ng-components';
import { Observable, firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService implements PoComboFilter {
  constructor( private http: HttpClient) {}

  getFilteredData(params: any): Observable<any> {
    const value = params.value;
    return this.http
      .get<any[]>('http://localhost:3000/branch/quicksearch', {
        params: {value}
      });
  }

  getObjectByValue(value: string): Observable<any> {
    return this.http
      .get<any>(`http://localhost:3000/branch/quicksearch/${value}`);
  }

  get(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`http://localhost:3000/branch?${filter}`)
    return result
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`http://localhost:3000/branch/${id}`)
    return firstValueFrom(result)
  }

  create(payload: any): Promise<any> {
    const result = this.http.post(`http://localhost:3000/branch`, payload)
    return firstValueFrom(result)
  }

  getAddressIBGE(zipcode: string): Promise<any> {
    const result = this.http.get(`https://viacep.com.br/ws/${zipcode}/json/`)
    return firstValueFrom(result)
  }
}
