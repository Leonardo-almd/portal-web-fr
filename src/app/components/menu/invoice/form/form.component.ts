import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoInfoModule,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoStepperComponent,
  PoStepperModule,
  PoStepperOrientation,
  PoUploadComponent,
  PoUploadFile,
} from '@po-ui/ng-components';
import { InvoiceService } from '../../../../services/invoice.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../../services/branch.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    PoModalModule,
    PoFieldModule,
    ReactiveFormsModule,
    PoDividerModule,
    FormsModule,
    PoStepperModule,
    PoButtonModule,
    PoInfoModule,
    CommonModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;
  @ViewChild(PoStepperComponent) poStepperComponent!: PoStepperComponent;

  callback: any;
  form: FormGroup;
  fileUpload: any;
  orientation: PoStepperOrientation = PoStepperOrientation.Vertical;

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async () => {
      const formData = new FormData();
      formData.append('file', this.fileUpload, this.fileUpload.name);
      for (const key in this.form.value) {
        if (this.form.value.hasOwnProperty(key)) {
          formData.append(key, this.form.value[key]);
        }
      }
      this.service.createInvoice(formData).subscribe({
        next: res => {
          this.poModal.close();
          this.callback();
          this.poNotification.success('Invoice criada com sucesso');
        },
        error: err => {
          this.poNotification.error(`Erro ao criar invoice: ${err}`);
          console.log(err)
        }
      })
    },
    disabled: true
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(
    private fb: FormBuilder,
    private service: InvoiceService,
    private poNotification: PoNotificationService,
    public branchService: BranchService
  ) {
    this.form = this.fb.group({
      branch: ['', Validators.required],
      date: ['', Validators.required],
    });
    this.form.valueChanges.subscribe(() => {
      this.primaryAction.disabled = this.form.invalid || !this.fileUpload;
    })
    this.poNotification.setDefaultDuration(2500);
  }

  open() {
    this.poModal.open();
  }

  canActiveNextStep() {
    return this.form.valid;
  }

  onUpload(event: any) {
    event.data = { test: 'test' };
    event.file.name = 'file.xlsx';
    console.log(event);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileUpload = file;
      this.primaryAction.disabled = false;
      // const formData = new FormData();
      // formData.append('file', file, file.name);
      // formData.append('payload', 'vdfvfdvd');
      // formData.append('test', 'fdsdfbd');

      // this.http.post('http://localhost:3000/invoices/upload', formData,{
      //   headers: {Authorization: `Bearer ${localStorage.getItem('access_token')}`}
      // }).subscribe(
      //   (response: any) => console.log('Upload success', response),
      //   (error: any) => console.error('Upload error', error)
      // );
    }
  }
}
