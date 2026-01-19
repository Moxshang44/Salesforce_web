import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'in-progress';
  assignee?: string;
  location?: string;
  date: string;
  time: string;
  reportedTo: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, ModalComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  activeTab: 'my-tasks' | 'given-task' = 'my-tasks';
  isAddTaskModalOpen = false;
  currentStep = 1;

  // Form data
  taskType = 'India';
  taskTitle = '';
  assignTo = '';
  reportBackTo = '';
  startDate = '';
  endDate = '';
  isFullDayTask = true;
  startTime = '';
  endTime = '';
  linkTaskTo: 'route' | 'retailer' | 'distributor' | 'employee' = 'route';
  searchRoute = '';
  objective = '';
  checklistItems: string[] = [
    "Achieve today's targeted sales",
    "Train SR to achieve maximum sales",
    "Communicate with retailers on low buying"
  ];
  newChecklistItem = '';
  uploadedFiles: File[] = [];

  myTasks: Task[] = [
    {
      id: '1',
      title: 'New SR Onboarding',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '2',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '3',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '4',
      title: 'New SR Onboarding',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '5',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '6',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '7',
      title: 'New SR Onboarding',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '8',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '9',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)'
    }
  ];

  givenTasks: Task[] = [
    {
      id: '10',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '11',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '12',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '13',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '14',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '15',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '16',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '17',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    },
    {
      id: '18',
      title: 'Payment Collection',
      status: 'in-progress',
      location: 'GG Store, Navrangpura',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      assignee: 'Majnu Bhai (SR)',
      reportedTo: 'Zakir Khan (ASM)'
    }
  ];

  getTasks(): Task[] {
    return this.activeTab === 'my-tasks' ? this.myTasks : this.givenTasks;
  }

  setActiveTab(tab: 'my-tasks' | 'given-task'): void {
    this.activeTab = tab;
  }

  openAddTaskModal(): void {
    this.isAddTaskModalOpen = true;
    this.currentStep = 1;
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.taskTitle = '';
    this.assignTo = '';
    this.reportBackTo = '';
    this.startDate = '';
    this.endDate = '';
    this.isFullDayTask = true;
    this.startTime = '';
    this.endTime = '';
    this.linkTaskTo = 'route';
    this.searchRoute = '';
    this.objective = '';
    this.checklistItems = [
      "Achieve today's targeted sales",
      "Train SR to achieve maximum sales",
      "Communicate with retailers on low buying"
    ];
    this.newChecklistItem = '';
    this.uploadedFiles = [];
  }

  addChecklistItem(): void {
    if (this.newChecklistItem.trim()) {
      this.checklistItems.push(this.newChecklistItem.trim());
      this.newChecklistItem = '';
    }
  }

  removeChecklistItem(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadedFiles = Array.from(input.files);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.uploadedFiles = Array.from(event.dataTransfer.files);
    }
  }

  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  saveTask(): void {
    // TODO: Implement save logic
    console.log('Saving task...', {
      taskType: this.taskType,
      taskTitle: this.taskTitle,
      assignTo: this.assignTo,
      reportBackTo: this.reportBackTo,
      startDate: this.startDate,
      endDate: this.endDate,
      isFullDayTask: this.isFullDayTask,
      startTime: this.startTime,
      endTime: this.endTime,
      linkTaskTo: this.linkTaskTo,
      searchRoute: this.searchRoute,
      objective: this.objective,
      checklistItems: this.checklistItems,
      uploadedFiles: this.uploadedFiles
    });
    this.closeAddTaskModal();
  }

  getDateDisplay(): string {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const end = new Date(this.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} to ${end}`;
    }
    return 'Select dates';
  }

  onDateRangeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Handle date range input
  }
}

