import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getInvoices(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`${this.baseUrl}/invoices?${filter}`)
    return result
  }

  createInvoice(payload: any){
    return this.http.post(`${this.baseUrl}/invoices`, payload)
  }

  exportInvoice(id: any){
    return this.http.get(`${this.baseUrl}/invoices/${id}/export`, {
      responseType: 'blob' as 'json'
    })
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`${this.baseUrl}/invoices/${id}`)
    return firstValueFrom(result)
  }
}
