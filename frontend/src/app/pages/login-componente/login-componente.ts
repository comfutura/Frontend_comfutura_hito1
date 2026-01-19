// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
   templateUrl: './login-componente.html',
  styleUrl: './login-componente.css',
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si ya está autenticado → redirigir
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos',
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        const username = this.authService.currentUser?.username || 'Usuario';

        Swal.fire({
          title: '¡Bienvenido!',
          text: `Hola ${username}`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: '#d4edda',
          color: '#155724',
          iconColor: '#155724'
        });

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: err.message || 'Credenciales incorrectas',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      },
      complete: () => this.isLoading = false
    });
  }
}
