// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {


  private injectStyles() {
  if (document.getElementById('custom-toast-style')) return;

  const style = document.createElement('style');
  style.id = 'custom-toast-style';
  style.innerHTML = `
    .custom-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 9999;
    }

    .custom-toast.show {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

 show(message: string, duration: number = 3000) {
  this.injectStyles(); // ✅ Inyecta el CSS si no está

  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}


showBoletoNoDisponibleToast(numeros: string | number, duration: number = 8000) {
  this.injectBoletoStyles();

  const toast = document.createElement('div');
  toast.className = 'boleto-toast';
  toast.innerHTML = `
    <div class="boleto-toast-icon">❌</div>
    <div class="boleto-toast-content">
      <strong>Boleto${numeros.toString().includes(',') ? 's' : ''} ${numeros}</strong><br/>
      Ya no ${numeros.toString().includes(',') ? 'están disponibles' : 'está disponible'}
    </div>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}


private injectBoletoStyles() {
  if (document.getElementById('boleto-toast-style')) return;

  const style = document.createElement('style');
  style.id = 'boleto-toast-style';
  style.innerHTML = `
    .boleto-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      background: #ff3b3b;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 9999;
      max-width: 90%;
    }

    .boleto-toast.show {
      opacity: 1;
    }

    .boleto-toast-icon {
      font-size: 28px;
      margin-right: 12px;
    }

    .boleto-toast-content {
      line-height: 1.4;
    }
  `;
  document.head.appendChild(style);
}


}
