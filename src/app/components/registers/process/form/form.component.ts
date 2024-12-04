import { Component, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoFieldModule, PoModalAction, PoModalComponent, PoModalModule, PoNotificationService } from '@po-ui/ng-components';
import { PoDividerModule } from '@po-ui/ng-components';
import { ProcessService } from '../../../../services/process.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [PoModalModule, PoFieldModule, ReactiveFormsModule, PoDividerModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @ViewChild(PoModalComponent, { static: true }) poModal!: PoModalComponent;

  callback: any;
  form: FormGroup;
  zipcode = signal('');

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async() => {
      const payload = this.form.value;

      await this.service.create(payload).then(() => {
        this.poModal.close();
        this.callback();
        this.poNotification.success('Processo salvo com sucesso!');
      }).catch(() => {
        this.poNotification.error('Erro ao criar processo!');
      })
    },
    disabled: true
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(private fb: FormBuilder, private service: ProcessService, private poNotification: PoNotificationService){
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      importer: ['', [Validators.required]],
      exporter: ['', [Validators.required]],
      bl: ['', [Validators.required]],
      destinationHarbor: ['', [Validators.required]],
      originHarbor: ['', [Validators.required]],
    })
    this.form.valueChanges.subscribe((ev) => {
      this.primaryAction.disabled = this.form.invalid;
    })
    this.poNotification.setDefaultDuration(2500)
  }


  open(process = null) {
    if(process) {
      this.form.patchValue(process);
    }
    this.poModal.open();
  }

}
