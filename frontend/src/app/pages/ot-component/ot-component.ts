import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DropdownItem, DropdownService } from '../../service/dropdown.service';
import {
  OtCreateRequest,
  OtTrabajadorRequest,
  OtDetalleRequest,
  CrearOtCompletaRequest,
  OtService
} from '../../service/ot.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-create-ot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ot-component.html',
  styleUrl: './ot-component.css'
})
export class CreateOtComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  loading = false;

  // Propiedades públicas para que el template las vea sin errores de tipado
  usernameLogueado: string = '—';
  trabajadorIdLogueado: number | null = null;

  // Dropdowns principales
  clientes:  DropdownItem[] = [];
  areas:     DropdownItem[] = [];
  proyectos: DropdownItem[] = [];
  fases:     DropdownItem[] = [];
  sites:     DropdownItem[] = [];
  regiones:  DropdownItem[] = [];

  // Dropdowns dinámicos
  trabajadoresDisponibles: DropdownItem[] = [];
  maestrosDisponibles:     DropdownItem[] = [];
  proveedoresDisponibles:  DropdownItem[] = [];

  // Ya no es necesario este campo (lo reemplazamos por trabajadorIdLogueado)
  // currentTrabajadorId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private otService: OtService,
    private dropdownService: DropdownService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtenemos la información del usuario autenticado UNA vez
    const user = this.authService.currentUser;

    // Asignamos valores para el template
    this.usernameLogueado     = user?.username || '—';
    this.trabajadorIdLogueado = user?.idTrabajador ?? null;

    // Inicializamos el formulario
    this.form = this.fb.group({
      ot:            ['', [Validators.required, Validators.min(1)]],
      ceco:          ['', [Validators.required, Validators.maxLength(20)]],
      idCliente:     ['', Validators.required],
      idArea:        ['', Validators.required],
      idProyecto:    ['', Validators.required],
      idFase:        ['', Validators.required],
      idSite:        ['', Validators.required],
      idRegion:      ['', Validators.required],
      descripcion:   [''],
      fechaApertura: ['', Validators.required],

      trabajadores: this.fb.array([]),
      detalles:     this.fb.array([])
    });

    this.cargarDropdowns();
  }

  get f() { return this.form.controls; }

  get trabajadoresArray() { return this.form.get('trabajadores') as FormArray; }
  get detallesArray()     { return this.form.get('detalles')     as FormArray; }

  agregarTrabajador() {
    this.trabajadoresArray.push(
      this.fb.group({
        idTrabajador: ['', Validators.required],
        rolEnOt:      ['', [Validators.required, Validators.maxLength(50)]]
      })
    );
  }

  eliminarTrabajador(index: number) {
    this.trabajadoresArray.removeAt(index);
  }

  agregarDetalle() {
    this.detallesArray.push(
      this.fb.group({
        idMaestro:      ['', Validators.required],
        idProveedor:    ['', Validators.required],
        cantidad:       ['', [Validators.required, Validators.min(0.01)]],
        precioUnitario: ['', [Validators.required, Validators.min(0.01)]]
      })
    );
  }

  eliminarDetalle(index: number) {
    this.detallesArray.removeAt(index);
  }

  private cargarDropdowns(): void {
    this.dropdownService.getClientes().subscribe(d => this.clientes = d);
    this.dropdownService.getAreas().subscribe(d => this.areas = d);
    this.dropdownService.getProyectos().subscribe(d => this.proyectos = d);
    this.dropdownService.getFases().subscribe(d => this.fases = d);
    this.dropdownService.getSites().subscribe(d => this.sites = d);
    this.dropdownService.getRegiones().subscribe(d => this.regiones = d);

    // Descomenta cuando tengas estos endpoints
    // this.dropdownService.getTrabajadores().subscribe(d => this.trabajadoresDisponibles = d);
    // this.dropdownService.getMaestrosCodigo().subscribe(d => this.maestrosDisponibles = d);
    // this.dropdownService.getProveedores().subscribe(d => this.proveedoresDisponibles = d);
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa los campos obligatorios',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    this.loading = true;

    const values = this.form.value;

    const otPayload: OtCreateRequest = {
      ot:             Number(values.ot),
      ceco:           values.ceco.trim(),
      idCliente:      Number(values.idCliente),
      idArea:         Number(values.idArea),
      idProyecto:     Number(values.idProyecto),
      idFase:         Number(values.idFase),
      idSite:         Number(values.idSite),
      idRegion:       Number(values.idRegion),
      descripcion:    values.descripcion?.trim() || undefined,
      fechaApertura:  values.fechaApertura,
      diasAsignados:  0,
      idOtsAnterior:  null
    };

    const trabajadores: OtTrabajadorRequest[] = (values.trabajadores || []).map((t: any) => ({
      idTrabajador: Number(t.idTrabajador),
      rolEnOt: t.rolEnOt.trim()
    }));

    const detalles: OtDetalleRequest[] = (values.detalles || []).map((d: any) => ({
      idMaestro: Number(d.idMaestro),
      idProveedor: Number(d.idProveedor),
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario)
    }));

    const payload: CrearOtCompletaRequest = {
      ot: otPayload,
      trabajadores,
      detalles
    };

    this.otService.crearOtCompleta(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Orden creada!',
          text: `OT #${res.ot} registrada exitosamente`,
          timer: 2800,
          showConfirmButton: false
        });
        this.router.navigate(['/ots/list']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear OT',
          text: err.message || 'Ocurrió un problema inesperado',
        });
      },
      complete: () => this.loading = false
    });
  }

  resetForm(): void {
    this.form.reset();
    this.trabajadoresArray.clear();
    this.detallesArray.clear();
    this.submitted = false;
  }
}
