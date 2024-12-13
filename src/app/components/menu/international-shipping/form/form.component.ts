import { Component, ViewChild, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PoButtonModule,
  PoDialogService,
  PoDividerModule,
  PoFieldModule,
  PoInfoModule,
  PoListViewAction,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoStepperComponent,
  PoStepperModule,
  PoStepperOrientation,
  PoTableColumn,
  PoTableModule,
  PoUploadComponent,
  PoUploadFile,
} from '@po-ui/ng-components';
import { CommonModule } from '@angular/common';
import { BranchService } from '../../../../services/branch.service';
import { CustomerService } from '../../../../services/customer.service';
import { ProcessService } from '../../../../services/process.service';
import { InternationalShippingService } from '../../../../services/international-shipping.service';

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
    CommonModule,
    PoTableModule,
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
  itemsArray = signal<any[]>([]);

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: async () => {
      const payload = this.form.value;
      await this.service
        .create(payload)
        .then(() => {
          this.poNotification.success('Frete internacional criado com sucesso');
          this.callback();
          this.poModal.close();
        })
        .catch((err: any) => {
          console.error(err);
          this.poNotification.error('Erro ao criar frete internacional');
        });
    },
    disabled: true,
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => {
      this.callback();
      this.poModal.close();
    },
  };

  readonly tableActions: Array<PoListViewAction> = [
    {
      label: '',
      type: 'danger',
      icon: 'po-icon-delete',
      action: this.onRemoveCharges.bind(this),
    },
  ];

  readonly columns: Array<PoTableColumn> = [
    {
      property: 'description',
      label: 'Descrição',
      type: 'cellTemplate',
      width: '350px',
    },
    {
      property: 'currency',
      label: 'Moeda',
      type: 'cellTemplate',
      width: '150px',
    },
    {
      property: 'amount',
      label: 'Valor na Moeda',
      type: 'cellTemplate',
      width: '150px',
    },
    {
      property: 'currency_rate',
      label: 'Taxa de Câmbio',
      type: 'cellTemplate',
      width: '150px',
    },
    {
      property: 'amount_brl',
      label: 'Valor em Real',
      type: 'cellTemplate',
      width: '150px',
    },
  ];

  get freightCharges(): FormArray {
    return this.form.get('freight_charges') as FormArray;
  }

  get f() {
    return this.form.controls;
  }

  constructor(
    private fb: FormBuilder,
    private service: InternationalShippingService,
    private poNotification: PoNotificationService,
    public branchService: BranchService,
    public customerService: CustomerService,
    public processService: ProcessService,
    private poAlert: PoDialogService
  ) {
    this.form = this.fb.group({
      id: [null],
      branch: ['', Validators.required],
      customer: ['', Validators.required],
      process: ['', Validators.required],
      ship_name: ['', Validators.required],
      voyage_number: ['', Validators.required],
      freight_type: ['', Validators.required],
      container: ['', Validators.required],
      departure_date: [''],
      arrival_date: [''],
      return_deadline: [''],
      demurrage_fee: [''],
      due_date: [''],
      invoice_name: [''],
      demurrage_currency: ['BRL'],
      freight_charges: this.fb.array([]),
    });
    this.form.valueChanges.subscribe(() => {
      this.primaryAction.disabled = this.form.invalid;
    });
    this.poNotification.setDefaultDuration(2500);
  }

  open(row: any = null) {
    if (row) {
      const data = row;
      data.customer = data.customer.id.toString();
      data.process = data.process.id.toString();
      data.branch = data.branch.id.toString();
      // Limpar o FormArray atual para evitar duplicações
      this.freightCharges.clear();

      // Carregar os valores de freight_charges no FormArray
      if (data.freight_charges && Array.isArray(data.freight_charges)) {
        data.freight_charges.forEach((charge: any) => {
          this.freightCharges.push(
            this.fb.group({
              item: [charge.item || null],
              description: [charge.description || null, Validators.required],
              amount: [
                charge.amount || null,
                [Validators.required, Validators.min(0.01)],
              ],
              currency: [charge.currency || null, [Validators.required]],
              currency_rate: [
                charge.currency_rate || null,
                [Validators.required, Validators.min(0.01)],
              ],
            })
          );
        });
      }

      // Atualizar os outros valores no formulário
      this.form.patchValue(data);
    }
    this.poModal.open();
  }

  addFreightCharge(): void {
    let lastItem: any;
    if (this.freightCharges.length > 0)
      lastItem =
        this.freightCharges.controls[this.freightCharges.controls.length - 1];
    const item =
      this.freightCharges.controls.length == 0 ? 1 : lastItem!.value.item + 1;
    const chargeGroup = this.fb.group({
      item: [item],
      description: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: [null, [Validators.required]],
      currency_rate: [null, [Validators.required, Validators.min(0.01)]],
    });
    this.freightCharges.push(chargeGroup);
  }

  onRemoveCharges(data: any): void {
    this.poAlert.confirm({
      literals: { cancel: 'Não', confirm: 'Sim' },
      title: 'Remover',
      message: 'Deseja realmente remover?',
      confirm: () => {
        const index = this.freightCharges.controls.findIndex(
          (control) => control.value.item === data.value.item
        );

        if (index !== -1) {
          this.freightCharges.removeAt(index);
        }
      },
    });
  }
}
