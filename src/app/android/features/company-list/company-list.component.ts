import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BtnRegresarComponent } from '../../../shared/btn-regresar/btn-regresar.component';

export type Company = {
  id: number;
  name: string;
  logo: string;
  address: string;
  rating: number;
};

@Component({
  selector: 'app-company-list',
  imports: [CommonModule, BtnRegresarComponent],
  standalone: true,
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent {
  companies: Company[] = [];
  categoryName = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
  const categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
  this.categoryName = history.state.categoryName || '';
  this.loadCompanies(categoryId);
}


  loadCompanies(categoryId: number) {
    const allCompanies: Record<number, Company[]> = {
      1: [
        { 
          id: 1, 
          name: 'Nails Glam', 
          logo: 'assets/icon/categorias/uas.svg', 
          address: 'Centro', 
          rating: 4.8 
        },
        { 
          id: 2, 
          name: 'Luxury Nails', 
          logo: 'https://imgs.search.brave.com/LoX6gATtCVCbnn8FcxHPzbw5YJKa1ApJdBrpGOelVjA/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly81NDdm/ZGM4YS5kZWxpdmVy/eS5yb2NrZXRjZG4u/bWUvd3AtY29udGVu/dC91cGxvYWRzLzIw/MjEvMDEvbG9nby1h/Y2FkZW1pYS0wMS03/Njh4MjIyLnBuZw', 
          address: 'Col. Roma', 
          rating: 4.6 
        },
      ],
      2: [
        { 
          id: 3, 
          name: 'Lash Studio', 
          logo: 'https://api.sorteos.sa.dibeksolutions.com/uploads/sorteos/1.png', 
          address: 'Zona Norte', 
          rating: 4.9 
        },
      ],
      3: [
        { 
          id: 4, 
          name: 'Barber Bros', 
          logo: 'assets/icon/categorias/barba.svg', 
          address: 'Av. Juárez', 
          rating: 4.7 
        },
      ],
      4: [
        { 
          id: 5, 
          name: 'HairCut Pro', 
          logo: 'assets/icon/categorias/tijeras.svg', 
          address: 'Col. Centro', 
          rating: 4.5 
        },
      ],
    };

    this.companies = allCompanies[categoryId] || [];
  }

verAgenda(company: Company) {
  const categoryId = this.route.snapshot.paramMap.get('categoryId');
  const companySlug = this.slugify(company.name);

  this.router.navigate([
    `/categoria/${categoryId}/empresa/${companySlug}/${company.id}/agenda`
  ]);
}






  private slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')       // espacios por guiones
    .replace(/[^\w\-]+/g, '');  // quitar caracteres raros
}
}
