import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductImage } from '../model/product-image.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProductImageService {
    private _httpClient = inject(HttpClient);

    saveProductImage(params: {}, productCode: string): Observable<HttpResponse<ProductImage>> {
        let url = `${environment.apiUrl}/admin/product-image/${productCode}`;
        return this._httpClient.post<ProductImage>(url, params, { observe: 'response' });
    }

    getAllByProductCode(productCode: string): Observable<HttpResponse<ProductImage[]>> {
        let url = `${environment.apiUrl}/admin/product-image/${productCode}`;
        return this._httpClient.get<ProductImage[]>(url, { observe: 'response' });
    }
}
