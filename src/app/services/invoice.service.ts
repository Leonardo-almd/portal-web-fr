import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }

  getInvoices(filter: any) {
    filter = new HttpParams({
      fromObject: filter,
    });
    const result = this.http.get(`http://localhost:3000/invoices?${filter}`)
    return result
  }

  createInvoice(payload: any){
    return this.http.post('http://localhost:3000/invoices', payload)
  }

  exportInvoice(id: any){
    return this.http.get(`http://localhost:3000/invoices/${id}/export`, {
      responseType: 'blob' as 'json'
    })
  }

  delete(id: string): Promise<any> {
    const result = this.http.delete(`http://localhost:3000/invoices/${id}`)
    return firstValueFrom(result)
  }
}
