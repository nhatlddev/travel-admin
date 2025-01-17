import { Component, effect, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../../../services/product.service';
import { Product } from '../../../../../model/product.model';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../../../model/category.model';
import { CategoryService } from '../../../../../services/category.service';
import { TransformCategoryPipe } from '../../../../../pipe/transform-category.pipe';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Code } from '../../../../../model/code.model';
import { CodeService } from '../../../../../services/code.service';
import { CalendarModule } from 'primeng/calendar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EditorModule } from 'primeng/editor';
import { ValidationUtil } from '../../../../../utils/validation.util';
import { environment } from '../../../../../../../environments/environment';
import { AuthenticationService } from '../../../../../services/auth/authentication.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProductZone } from '../../../../../model/product-zone.model';
import { ProductZoneService } from '../../../../../services/product-zone.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProductModalComponent } from '../../../../general/modal/product-modal/product-modal.component';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { SidebarModule } from '../../../../../../layout/sidebar/sidebar.module';
import { productSignal } from '../../../../../store/product-sidebar.store';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    selector: 'app-save-product',
    standalone: true,
    imports: [
        ToastModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TransformCategoryPipe,
        CalendarModule,
        EditorModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        ProductModalComponent,
        InputTextModule,
        PanelModule,
        InputGroupModule,
        ButtonModule,
        DropdownModule,
        InputNumberModule,
        SidebarModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './save-product.component.html',
    styleUrl: './save-product.component.scss',
})
export class SaveProductComponent implements OnInit {
    private _formBuilder = inject(FormBuilder);
    private _productService = inject(ProductService);
    private _categoryService = inject(CategoryService);
    private _codeService = inject(CodeService);
    private _messageService = inject(MessageService);
    private _authenticationService = inject(AuthenticationService);
    private _productZoneService = inject(ProductZoneService);
    private _confirmationService = inject(ConfirmationService);

    categories: Category[] = [] as Category[];

    productZones: ProductZone[] = [] as ProductZone[];

    code: Code[] = [] as Code[];

    codeA: Code[] = [] as Code[];
    codeAFiltered: Code[] = [] as Code[];

    categoryIdSelected: number = 0;

    statusSelected: string = "";
    productCode: string = "";
    query: string = "";

    submitted: boolean = false;
    isLoading: boolean = false;
    visible: boolean = false;

    productForm: FormGroup = this._formBuilder.group({
        id: [0],
        pdtName: ['', Validators.required],
        pdtNameEng: [''],
        pdtCode: [''],
        sort: [0, Validators.required],
        used: [false],
        categoryId: [0, Validators.required],
        status: ['', Validators.required],
        option1: [''],
        option2: [''],
        option3: [''],
        saleStartDate: ['', Validators.required],
        saleEndDate: [''],
        retailAmt: [''],
        newStartDate: [''],
        newEndDate: [''],
        bestStartDate: [''],
        bestEndDate: [''],
        promotionStartDate: [''],
        promotionEndDate: [''],
        tax: [''],
        amtId: [0],
        supplyAmt: [''],
        intro: [''],
        introEng: [''],
        schedule: [''],
        scheduleEng: [''],
        policy: [''],
        policyEng: [''],
        zones: [[]]
    });

    constructor() {
        effect(() => {
            let product: Product = productSignal();
            if(product.pdtCode !== null && product.pdtCode !== undefined) {
                this.onClickRow(product);
                productSignal.set({} as Product);
            }
        }, { allowSignalWrites: true });
    }

    get f(): { [key: string]: AbstractControl } {
        return this.productForm.controls;
    }

    ngOnInit(): void {
        this.getCategory();
        this.getListCode();
        this.getCodeA();
    }

    filterCode(event: AutoCompleteCompleteEvent) {
        let filtered: Code[] = [];
        let query = event.query;

        for (let i = 0; i < this.codeA.length; i++) {
            let code = this.codeA[i];
            if (code.codeName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(code);
            }
        }

        this.codeAFiltered = filtered;
    }

    // onScroll(event: any) {
    //     const bottom =
    //         Math.round(event.target.scrollHeight - event.target.scrollTop) ===
    //         event.target.clientHeight;
    //     if (bottom && !this.isLoading) {
    //         this.first += 1;
    //         this.getProduct();
    //     }
    // }

    onShowProductModal() {
        this.visible = true;
    }

    onCloseProductModal(event: any) {
        this.visible = false;
    }

    onSubmit() {
        this.submitted = true;
        if (this.productForm.invalid) {
            return;
        }
        if (this.f['id'].value > 0) {
            this._productService.updateProduct(this.productForm.value).subscribe({
                next: (res: HttpResponse<Product>) => {
                    if (res !== null && res !== undefined) {
                        let result = res.body || ({} as Product);
                        this._messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Chỉnh sửa thành công [ID]: ' + result.id,
                            key: 'br',
                            life: 3000,
                        });
                        this.onReset();
                    }
                },
                error: (err: HttpErrorResponse) => {
                    let error: Error = err.error;
                    this._messageService.add({
                        severity: 'danger',
                        summary: 'Error',
                        detail: error.message,
                        key: 'br',
                        life: 3000,
                    });
                }
            });
        } else {
            this._productService.saveProduct(this.productForm.value).subscribe({
                next: (res: HttpResponse<Product>) => {
                    if (res !== null && res !== undefined) {
                        let result = res.body || ({} as Product);
                        this._messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Lưu thành công [ID]: ' + result.id,
                            key: 'br',
                            life: 3000,
                        });
                        this.onReset();
                    }
                },
                error: (err: HttpErrorResponse) => {
                    let error: Error = err.error;
                    this._messageService.add({
                        severity: 'danger',
                        summary: 'Error',
                        detail: error.message,
                        key: 'br',
                        life: 3000,
                    });
                }
            });
        }
    }

    onReset() {
        this.submitted = false;

        this.productForm.patchValue({
            id: 0,
            pdtName: '',
            pdtNameEng: '',
            pdtCode: '',
            sort: 0,
            used: false,
            categoryId: '',
            status: '',
            option1: '',
            option2: '',
            option3: '',
            saleStartDate: '',
            saleEndDate: '',
            newStartDate: '',
            newEndDate: '',
            bestStartDate: '',
            bestEndDate: '',
            promotionStartDate: '',
            promotionEndDate: '',
            tax: 0,
            retailAmt: 0,
            amtId: 0,
            supplyAmt: 0,
            intro: '',
            introEng: '',
            schedule: '',
            scheduleEng: '',
            policy: '',
            policyEng: '',
            zones: []
        });

        this.categoryIdSelected = 0;

        this.statusSelected = '';

        this.codeAFiltered = [];

        this.visible = false;

        this.query = "";
    }

    onDelete(event: any) {
        this._confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Bạn có muốn xoá item này?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'none',
            rejectIcon: 'none',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this._productService.deleteProduct(this.productCode).subscribe((res) => {
                    if (res !== null && res !== undefined) {
                        if (res.status === 200) {
                            this._messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'xoá thành công [ID]: ' + this.productCode,
                                key: 'br',
                                life: 3000,
                            });
                            this.onReset();
                        } else {
                            this._messageService.add({
                                severity: 'danger',
                                summary: 'Error',
                                detail: 'xoá không thành công',
                                key: 'br',
                                life: 3000,
                            });
                        }
                    }
                });
            },
            reject: () => {},
        });
    }

    onClickRow(item: Product) {
        this.onReset();
        this.productCode = item.pdtCode;
        this.getDetailProduct(item.pdtCode);
        this.getListProductZone(item.pdtCode);
        this.visible = false;
        this.query = item.pdtName;
    }

    onChangeCategoryId(categoryId: string) {
        if (categoryId !== 'default') {
            this.productForm.patchValue({
                categoryId: categoryId
            });
        }
    }

    onChangeStatus(status: string) {
        if (status !== 'default') {
            this.productForm.patchValue({
                status: status
            });
        }
    }

    editorOnInit(event: any, qlHTMLId: string) {
        const quillInstance = event.editor;
        quillInstance.root.addEventListener('paste', (e: any) => {
            const clipboardData =
                e.clipboardData || (<any>window).clipboardData;
            const isImage =
                clipboardData.types.length &&
                clipboardData.types.join('').includes('Files');
            if (!isImage) {
                return;
            }

            const file = clipboardData.files[0];
            this.saveToServer(file, quillInstance);
        });

        let newToolbar = quillInstance.getModule('toolbar');
        newToolbar.addHandler('image', () => {
            this.selectLocalImage(quillInstance);
        });

        let quillEd_txtArea_1 = document.createElement('textarea');
        let attrQuillTxtArea = document.createAttribute('quill__html');
        quillEd_txtArea_1.setAttributeNode(attrQuillTxtArea);

        let quillCustomDiv = quillInstance.addContainer('ql-custom');
        quillCustomDiv.appendChild(quillEd_txtArea_1);

        let quillHtmlBtn = document.getElementById(qlHTMLId);
        if (quillHtmlBtn !== null && quillHtmlBtn !== undefined) {
            quillHtmlBtn.addEventListener('click', (evt: any) => {
                if (
                    ValidationUtil.isNotNullAndNotUndefined(quillEd_txtArea_1)
                ) {
                    let t = quillEd_txtArea_1.getAttribute('quill__html');
                    if (t !== null && t !== undefined) {
                        let wasActiveTxtArea_1 = t.indexOf('-active-') > -1;

                        if (wasActiveTxtArea_1) {
                            quillInstance.pasteHTML(quillEd_txtArea_1.value);
                            evt.target.classList.remove('ql-active');
                        } else {
                            quillEd_txtArea_1.value =
                                quillInstance.root.innerHTML;
                            evt.target.classList.add('ql-active');
                        }

                        quillEd_txtArea_1.setAttribute(
                            'quill__html',
                            wasActiveTxtArea_1 ? '' : '-active-'
                        );
                    }
                }

                switch(qlHTMLId) {
                    case 'qlHTMLId1':
                        this.productForm.patchValue({
                            content: quillInstance.root.innerHTML,
                        });
                    break

                    case 'qlHTMLId2':
                        this.productForm.patchValue({
                            contentEng: quillInstance.root.innerHTML,
                        });
                    break

                    case 'qlHTMLId3':
                        this.productForm.patchValue({
                            schedule: quillInstance.root.innerHTML,
                        });
                    break

                    case 'qlHTMLId4':
                        this.productForm.patchValue({
                            scheduleEng: quillInstance.root.innerHTML,
                        });
                    break

                    case 'qlHTMLId5':
                        this.productForm.patchValue({
                            policy: quillInstance.root.innerHTML,
                        });
                    break

                    case 'qlHTMLId6':
                        this.productForm.patchValue({
                            policyEng: quillInstance.root.innerHTML,
                        });
                    break
                }
            });
        }
    }

    private getCategory() {
        this._categoryService
            .getAllCategory(this.getParams())
            .subscribe((res) => {
                if (res !== null && res !== undefined) {
                    this.categories = res.body?.result || [];
                }
            });
    }

    private getParams() {
        return {
            page: 1,
            limit: 100,
            type: '01C30'
        };
    }

    private getListCode() {
        this._codeService.getListCode("P").subscribe(res => {
            if(res !== null && res !== undefined) {
                this.code = res.body || [];
            }
        });
    }

    private getCodeA() {
        this._codeService.getListCode("A").subscribe(res => {
            if(res !== null && res !== undefined) {
                this.codeA = res.body || [];
            }
        });
    }

    private getListProductZone(productCode: string) {
        this._productZoneService.getListProductRelation(productCode).subscribe(res => {
            if(res !== null && res !== undefined) {
                this.productZones = res.body || [];
                if(this.productZones.length > 0) {
                    this.productZones.forEach(pz => {
                        this.codeA.forEach(ca => {
                            if(pz.codeCd === ca.codeCd) {
                                this.codeAFiltered.push(ca);
                            }
                        })
                    });
                    this.productForm.patchValue({
                        zones: this.codeAFiltered
                    })
                }
            }
        });
    }

    private getDetailProduct(productCode: string) {
        this._productService.getDetailProduct(productCode).subscribe(res => {
            if(res !== null && res !== undefined) {
                let result: Product = res.body || {} as Product;
                this.productForm.patchValue({
                    id: result.id,
                    pdtName: result.pdtName,
                    pdtNameEng: result.pdtNameEng,
                    pdtCode: result.pdtCode,
                    sort: result.sort,
                    used: result.used,
                    categoryId: result.categoryId,
                    status: result.status,
                    option1: result.option1,
                    option2: result.option2,
                    option3: result.option3,
                    saleStartDate: result.saleStartDate,
                    saleEndDate: result.saleEndDate,
                    newStartDate: result.newStartDate,
                    newEndDate: result.newEndDate,
                    bestStartDate: result.bestStartDate,
                    bestEndDate: result.bestEndDate,
                    promotionStartDate: result.promotionStartDate,
                    promotionEndDate: result.promotionEndDate,
                    tax: result.tax,
                    retailAmt: result.retailAmt,
                    amtId: result.amtId,
                    supplyAmt: result.supplyAmt,
                    intro: result.intro,
                    introEng: result.introEng,
                    schedule: result.schedule,
                    scheduleEng: result.scheduleEng,
                    policy: result.policy,
                    policyEng: result.policyEng
                });

                this.categoryIdSelected = result.categoryId;
                this.statusSelected = result.status;
            }
        });
    }

    private selectLocalImage(quillInstance: any) {
        const input = <HTMLInputElement>document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        if (input !== null && input !== undefined) {
            input.onchange = () => {
                if (input.files !== null) {
                    const file = input.files[0];
                    this.saveToServer(file, quillInstance);
                    if (/^image\//.test(file.type)) {
                    } else {
                        console.warn('You could only upload images.');
                    }
                }
            };
        }
    }

    private saveToServer(file: File, quillInstance: any) {
        const fd = new FormData();
        fd.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', environment.apiUrl + '/admin/upload?fileUploadFolder=PRODUCT_INTRO_FOLDER', true);
        xhr.setRequestHeader(
            'Authorization',
            `Bearer ${this._authenticationService.getUserToken()}`
        );

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                this.insertToEditor(data.url, quillInstance);
            }
        };
        xhr.send(fd);
    }

    private insertToEditor(url: string, quillInstance: any) {
        const range = quillInstance.getSelection();
        quillInstance.insertEmbed(range.index, 'image', url, 'user');
    }
}
