import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmployeeFormStep1Component } from './components/employee-form-step1/employee-form-step1.component';

interface Employee {
  id: number;
  name: string;
  code: string;
  role: string;
  reportingTo: string;
  assignedArea: string;
  routesCount?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ButtonComponent, ModalComponent, EmployeeFormStep1Component],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
  currentPage = 1;
  totalPages = 2;
  isAddModalOpen = false;
  currentStep = 1;

  employees: Employee[] = [
    {
      id: 1,
      name: 'Ankit Patel',
      code: '#EMP2001',
      role: 'SR',
      reportingTo: 'Neha Singh',
      assignedArea: 'Ahmedabad Division',
      routesCount: 8,
      isActive: true
    },
    {
      id: 2,
      name: 'Neha Singh',
      code: '#EMP2002',
      role: 'SO',
      reportingTo: 'Rahul Sharma',
      assignedArea: 'Gujarat Division',
      routesCount: 0,
      isActive: true
    },
    {
      id: 3,
      name: 'Rahul Sharma',
      code: '#EMP2003',
      role: 'ASM',
      reportingTo: 'Pooja Mehta',
      assignedArea: 'Ahmedabad Area',
      routesCount: 0,
      isActive: true
    },
    {
      id: 4,
      name: 'Pooja Mehta',
      code: '#EMP2004',
      role: 'RSM',
      reportingTo: 'Sanjay Khanna',
      assignedArea: 'Gujarat Region',
      routesCount: 0,
      isActive: true
    },
    {
      id: 5,
      name: 'Sanjay Khanna',
      code: '#EMP2005',
      role: 'ZSM',
      reportingTo: 'Amit Verma',
      assignedArea: 'West Zone',
      routesCount: 0,
      isActive: true
    },
    {
      id: 6,
      name: 'Amit Verma',
      code: '#EMP2006',
      role: 'NSM',
      reportingTo: '-',
      assignedArea: 'India',
      routesCount: 0,
      isActive: true
    },
    {
      id: 7,
      name: 'Ravi Kumar',
      code: '#EMP2007',
      role: 'SR',
      reportingTo: 'Manoj Das',
      assignedArea: 'Pune Division',
      routesCount: 6,
      isActive: true
    },
    {
      id: 8,
      name: 'Manoj Das',
      code: '#EMP2008',
      role: 'SO',
      reportingTo: 'Kiran Joshi',
      assignedArea: 'Maharashtra Division',
      routesCount: 0,
      isActive: true
    },
    {
      id: 9,
      name: 'Kiran Joshi',
      code: '#EMP2009',
      role: 'ASM',
      reportingTo: 'Deepak Nair',
      assignedArea: 'Pune Area',
      routesCount: 0,
      isActive: true
    },
    {
      id: 10,
      name: 'Deepak Nair',
      code: '#EMP2010',
      role: 'RSM',
      reportingTo: 'Suresh Iyer',
      assignedArea: 'Maharashtra Region',
      routesCount: 0,
      isActive: true
    }
  ];

  onBulkUpload(): void {
    console.log('Bulk Upload clicked');
  }

  onExcel(): void {
    console.log('Excel clicked');
  }

  onAdd(): void {
    this.currentStep = 1;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  getModalTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Add Employee — Step 1: Basic Employee Details';
      case 2:
        return 'Add Employee — Step 2: Additional Details';
      default:
        return 'Add Employee';
    }
  }

  onSaveStep1(formData: any): void {
    console.log('Save step 1:', formData);
    // For now, just close the modal after step 1
    // In a full implementation, you would move to step 2
    this.isAddModalOpen = false;
    this.currentStep = 1;
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onEdit(employee: Employee): void {
    console.log('Edit employee:', employee);
  }

  onDelete(employee: Employee): void {
    console.log('Delete employee:', employee);
      if (confirm(`Are you sure you want to delete "${employee.name}"?`)) {
      // Remove the employee from the list
      this.employees = this.employees.filter(d => d.id !== employee.id);
      console.log('employee deleted:', employee);
    } else {
      console.log('Delete cancelled');
    }
  }

  onView(employee: Employee): void {
    console.log('View employee:', employee);
  }

  onInfo(employee: Employee): void {
    console.log('Info employee:', employee);
  }

  toggleActive(employee: Employee): void {
    employee.isActive = !employee.isActive;
  }
}
