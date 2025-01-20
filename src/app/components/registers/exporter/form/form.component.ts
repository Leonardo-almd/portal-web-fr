import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PoButtonModule,
  PoFieldModule,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
} from '@po-ui/ng-components';
import { PoDividerModule } from '@po-ui/ng-components';
import { ExporterService } from '../../../../services/exporter.service';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    PoModalModule,
    PoFieldModule,
    ReactiveFormsModule,
    PoDividerModule,
    FormsModule,
    PoButtonModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;

  callback: any;
  form: FormGroup;
  zipcode = signal('');
  uploadModel: any;
  imagePreview: string | ArrayBuffer | null = null;

  readonly uploadRestrictions = {
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  };

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async () => {
      const reader = new FileReader();
      const payload = this.form.value;
      if(this.uploadModel){
        reader.onload = async () => {
          payload.stamp = reader.result;

          await this.service
            .create(payload)
            .then(() => {
              this.poModal.close();
              this.callback();
              this.poNotification.success('Exportador salvo com sucesso!');
            })
            .catch(() => {
              this.poNotification.error('Erro ao criar exportador!');
            });
        };
        reader.readAsDataURL(this.uploadModel)
      } else {
        await this.service
          .create(payload)
          .then(() => {
            this.poModal.close();
            this.callback();
            this.poNotification.success('Exportador salvo com sucesso!');
          })
          .catch(() => {
            this.poNotification.error('Erro ao criar exportador!');
          });
      }
    },
    disabled: true,
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(
    private fb: FormBuilder,
    private service: ExporterService,
    private poNotification: PoNotificationService
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      address: [''],
      neighborhood: [''],
      number: [''],
      complement: [''],
      city: [''],
      state: [''],
      country: [''],
      stamp: [null],
    });
    this.form.valueChanges.subscribe((ev) => {
      this.primaryAction.disabled = this.form.invalid;
    });
    this.poNotification.setDefaultDuration(2500);
  }

  open(exporter: any = null) {
    if (exporter) {
      this.form.patchValue(exporter);
      if (exporter.stamp && typeof exporter.stamp === 'object' && exporter.stamp.data) {
        const buffer = Buffer.from(exporter.stamp.data);
        const base64String = buffer.toString('base64');
        this.imagePreview = `data:image/png;base64,${base64String}`;
        this.form.patchValue({ stamp: `data:image/png;base64,${base64String}` });
      }
    }
    this.poModal.open();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      if (files[0].size > 1 * 1024 * 1024) {
        this.poNotification.error('O arquivo deve ter no máximo 1MB');
        return;
      }
      this.uploadModel = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.uploadModel);
    }
  }

  deleteStampFile(): void {
    this.uploadModel = null;
    this.imagePreview = null;
    this.form.patchValue({ stamp: null });
  }
}
