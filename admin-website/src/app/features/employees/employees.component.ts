import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmployeeFormStep1Component } from './components/employee-form-step1/employee-form-step1.component';

interface Employee {
  id: number;
  name: string;
  code: string;
  role: string;
  reportingTo: string;
  assignedArea: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, ModalComponent, EmployeeFormStep1Component],
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
      name: 'Krati Patel',
      code: '#EMP0182',
      role: 'SR',
      reportingTo: 'Rahul Sharma',
      assignedArea: 'Ahmedabad West',
      isActive: true
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      code: '#EMP0165',
      role: 'ASM',
      reportingTo: 'Pooja Mehta',
      assignedArea: 'Gujarat Region',
      isActive: true
    },
    {
      id: 3,
      name: 'Pooja Mehta',
      code: '#EMP0164',
      role: 'RSM',
      reportingTo: 'Sanjay Khamla',
      assignedArea: 'West Zone',
      isActive: true
    },
    {
      id: 4,
      name: 'Sanjay Khamla',
      code: '#EMP0185',
      role: 'ZSM',
      reportingTo: 'Amit Verma',
      assignedArea: 'India',
      isActive: true
    },
    {
      id: 5,
      name: 'Amit Verma',
      code: '#EMP0150',
      role: 'NSM',
      reportingTo: '-',
      assignedArea: 'India',
      isActive: true
    },
    {
      id: 6,
      name: 'Ravi Kumar',
      code: '#EMP2207',
      role: 'SR',
      reportingTo: 'Manoj Deo',
      assignedArea: 'Pune Division',
      isActive: true
    },
    {
      id: 7,
      name: 'Manoj Deo',
      code: '#EMP1304',
      role: 'SO',
      reportingTo: 'Kiran Joshi',
      assignedArea: 'Maharashtra Region',
      isActive: true
    },
    {
      id: 8,
      name: 'Kiran Joshi',
      code: '#EMP0230',
      role: 'ASM',
      reportingTo: 'Deepak Nair',
      assignedArea: 'Central Region',
      isActive: true
    },
    {
      id: 9,
      name: 'Deepak Nair',
      code: '#EMP0350',
      role: 'RSM',
      reportingTo: 'Suresh Iyer',
      assignedArea: 'South Zone',
      isActive: true
    },
    {
      id: 10,
      name: 'Suresh Iyer',
      code: '#EMP0201',
      role: 'ZSM',
      reportingTo: 'Amit Verma',
      assignedArea: 'Southern Region',
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
  }

  onView(employee: Employee): void {
    console.log('View employee:', employee);
  }

  toggleActive(employee: Employee): void {
    employee.isActive = !employee.isActive;
  }
}
