import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface Attachment {
  name: string;
  type: string;
  size: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'done' | 'in-progress';
  assignee?: string;
  location?: string;
  date: string;
  time: string;
  reportedTo: string;
  assignedBy?: string;
  objective?: string;
  checklist?: string[];
  attachments?: Attachment[];
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
  isSidebarOpen = false;
  selectedTask: Task | null = null;

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
      title: 'Joint working with Krutik Shah',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      location: 'Andheri Route',
      date: '12 Jan 2026',
      time: '10:00AM to 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Sales has dropped by 13.5% in Route 12 for past 2 weeks. Figure out a way to get back on track and also find out the reason why sales is dropping?',
      checklist: [
        "Achieve today's targeted sales",
        "Train SR to achieve maximum sales",
        "Add new retailers in the route"
      ],
      attachments: [
        { name: 'Route_12_Performance.pdf', type: 'PDF', size: '1.2 MB' }
      ]
    },
    {
      id: '2',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Conduct a thorough stock audit of Mahadev Traders to verify inventory levels and identify any discrepancies.',
      checklist: [
        "Verify stock levels",
        "Check expiry dates",
        "Document findings"
      ],
      attachments: []
    },
    {
      id: '3',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Allocate necessary assets to Sharma General Store and ensure proper documentation.',
      checklist: [
        "Allocate assets",
        "Update inventory",
        "Get acknowledgment"
      ],
      attachments: []
    },
    {
      id: '4',
      title: 'New SR Onboarding',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Onboard new sales representative and provide necessary training.',
      checklist: [
        "Complete documentation",
        "Provide training",
        "Assign route"
      ],
      attachments: []
    },
    {
      id: '5',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Conduct stock audit and verify inventory.',
      checklist: [],
      attachments: []
    },
    {
      id: '6',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Allocate assets to store.',
      checklist: [],
      attachments: []
    },
    {
      id: '7',
      title: 'New SR Onboarding',
      status: 'in-progress',
      assignee: 'Ravi Gupta',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Onboard new sales representative.',
      checklist: [],
      attachments: []
    },
    {
      id: '8',
      title: 'Distributor Stock Audit',
      status: 'done',
      location: 'Mahadev Traders, Near chodhri Circle',
      date: 'Today',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Conduct stock audit.',
      checklist: [],
      attachments: []
    },
    {
      id: '9',
      title: 'Asset Allocation',
      status: 'done',
      location: 'Sharma General Store, Vastrapur, Near..',
      date: '12 Jan 2026',
      time: '10:00 AM - 12:00 PM',
      reportedTo: 'Zakir Khan (ASM)',
      assignedBy: 'Amit Shah (SO)',
      objective: 'Allocate assets.',
      checklist: [],
      attachments: []
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

  // Sidebar methods
  openTaskSidebar(task: Task, event: Event): void {
    if (this.activeTab === 'my-tasks') {
      event.stopPropagation();
      this.selectedTask = task;
      this.isSidebarOpen = true;
    }
  }

  closeTaskSidebar(): void {
    this.isSidebarOpen = false;
    this.selectedTask = null;
  }

  reportIssue(): void {
    // TODO: Implement report issue logic
    console.log('Reporting issue for task:', this.selectedTask?.id);
  }

  markTaskDone(): void {
    if (this.selectedTask) {
      this.selectedTask.status = 'done';
      // Update in the tasks array
      const taskIndex = this.myTasks.findIndex(t => t.id === this.selectedTask?.id);
      if (taskIndex !== -1) {
        this.myTasks[taskIndex].status = 'done';
      }
      this.closeTaskSidebar();
    }
  }

  downloadAttachment(attachment: Attachment): void {
    // TODO: Implement download logic
    console.log('Downloading attachment:', attachment.name);
  }

  formatFileSize(size: string): string {
    return size;
  }
}

