import { Component, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoFieldModule, PoModalAction, PoModalComponent, PoModalModule, PoNotificationService } from '@po-ui/ng-components';
import { BranchService } from '../../../../services/branch.service';
import { PoDividerModule } from '@po-ui/ng-components';

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
        this.poNotification.success('Filial salva com sucesso!');
      }).catch(() => {
        this.poNotification.error('Erro ao criar filial!');
      })
    },
    disabled: true
  };

  readonly secundaryAction: PoModalAction = {
    label: 'Fechar',
    action: () => this.poModal.close(),
  };

  constructor(private fb: FormBuilder, private service: BranchService, private poNotification: PoNotificationService){
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      cgc: ['', [Validators.required, Validators.minLength(14)]],
      address: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
    })
    this.form.valueChanges.subscribe((ev) => {
      this.primaryAction.disabled = this.form.invalid;
      if(ev.zipcode && ev.zipcode.length === 8 && this.zipcode() !== ev.zipcode ) {
        this.service.getAddressIBGE(ev.zipcode).then((res) => {
          this.form.patchValue({
            address: res.logradouro,
            neighborhood: res.bairro,
            city: res.localidade,
            state: res.uf
          })
          this.zipcode.set(ev.zipcode);
        }).catch(() => {
          console.error('CEP não encontrado');
        })
      }
    })
    this.poNotification.setDefaultDuration(2500)
  }


  open(branch = null) {
    if(branch) {
      this.form.patchValue(branch);
    }
    this.poModal.open();
    console.log(this.form.value)
  }

}
