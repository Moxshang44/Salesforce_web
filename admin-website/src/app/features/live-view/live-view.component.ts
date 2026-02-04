import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '../../core/layout/header/header.component';

interface SalesManager {
  name: string;
  region: string;
  zones?: number;
  regions?: number;
  totalCall?: number;
  productive?: number;
  telephonic?: number;
}

interface ZonalManager {
  name: string;
  zone: string;
  totalCall: number;
  productive: number;
  telephonic: number;
  target: number;
  achieved: number;
  regions?: number;
  areas?: number;
}

interface RegionalManager {
  name: string;
  region: string;
  totalCall: number;
  productive: number;
  telephonic: number;
  target: number;
  achieved: number;
}

interface AreaSalesManager {
  name: string;
  area: string;
  totalCall: number;
  productive: number;
  telephonic: number;
  target: number;
  achieved: number;
}

interface SalesOfficer {
  name: string;
  territory: string;
  totalCall: number;
  productive: number;
  telephonic: number;
  target: number;
  achieved: number;
}

interface SalesRepresentative {
  name: string;
  route: string;
  totalCall: number;
  productive: number;
  telephonic: number;
  target: number;
  achieved: number;
}

interface TimelineItem {
  type: 'checkin' | 'store' | 'lunch' | 'checkout';
  time: string;
  title: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  duration?: string;
  amount?: string;
}

interface MapMarker {
  id: string;
  name: string;
  role: 'NSM' | 'ZSM' | 'RSM' | 'ASM' | 'SO' | 'SR';
  position: { lat: number; lng: number };
  color: string;
}

@Component({
  selector: 'app-live-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './live-view.component.html',
  styleUrl: './live-view.component.scss'
})
export class LiveViewComponent implements OnInit {
  selectedManager: SalesManager | null = null;
  selectedZSM: ZonalManager | null = null;
  clickedZSM: ZonalManager | null = null;
  clickedRSM: RegionalManager | null = null;
  clickedASM: AreaSalesManager | null = null;
  clickedSO: SalesOfficer | null = null;
  clickedSR: SalesRepresentative | null = null;
  isTimelineOpen = false;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  salesManagers: SalesManager[] = [
    { 
      name: 'Krutik Shah', 
      region: 'INDIA',
      zones: 8,
      regions: 10,
      totalCall: 1461,
      productive: 1120,
      telephonic: 341
    },
    { 
      name: 'Abhishek', 
      region: 'DUBAI',
      zones: 5,
      regions: 7,
      totalCall: 980,
      productive: 750,
      telephonic: 230
    },
    { 
      name: 'Geetansh', 
      region: 'LONDON',
      zones: 6,
      regions: 8,
      totalCall: 1200,
      productive: 950,
      telephonic: 250
    }
  ];

  zonalManagers: ZonalManager[] = [
    { name: 'Jay Mahyavanshi', zone: 'South - East Zone', totalCall: 262, productive: 210, telephonic: 52, target: 25000, achieved: 18700, regions: 10, areas: 8 },
    { name: 'Amit Sharma', zone: 'North-West Zone', totalCall: 310, productive: 245, telephonic: 65, target: 30000, achieved: 20400, regions: 12, areas: 9 },
    { name: 'Nehal Patel', zone: 'East Zone', totalCall: 198, productive: 160, telephonic: 38, target: 22000, achieved: 9850, regions: 8, areas: 6 },
    { name: 'Rahul Verma', zone: 'Central Zone', totalCall: 275, productive: 220, telephonic: 55, target: 28000, achieved: 24600, regions: 11, areas: 8 },
    { name: 'Pujan Mehta', zone: 'North Zone', totalCall: 240, productive: 190, telephonic: 50, target: 26000, achieved: 21300, regions: 9, areas: 7 },
    { name: 'Sandeep Kulkarni', zone: 'South Zone', totalCall: 325, productive: 270, telephonic: 55, target: 35000, achieved: 33900, regions: 13, areas: 10 }
  ];

  regionalManagers: RegionalManager[] = [
    { name: 'Amit Khanna', region: 'Delhi NCR', totalCall: 262, productive: 210, telephonic: 52, target: 25000, achieved: 18700 },
    { name: 'Neeraj Gupta', region: 'Pune & Rest of Maharashtra', totalCall: 310, productive: 245, telephonic: 65, target: 30000, achieved: 20400 },
    { name: 'Pradeep Singh', region: 'Haryana', totalCall: 198, productive: 160, telephonic: 38, target: 22000, achieved: 9850 },
    { name: 'Anil Verma', region: 'Rajasthan', totalCall: 275, productive: 220, telephonic: 55, target: 28000, achieved: 24600 },
    { name: 'Manoj Kulkarni', region: 'Mumbai', totalCall: 240, productive: 190, telephonic: 50, target: 26000, achieved: 21300 },
    { name: 'Rajesh Mehta', region: 'Gujarat', totalCall: 325, productive: 270, telephonic: 55, target: 35000, achieved: 33900 }
  ];

  areaSalesManagers: AreaSalesManager[] = [
    { name: 'Rohit Kapoor', area: 'Andheri Area', totalCall: 180, productive: 145, telephonic: 35, target: 18000, achieved: 15200 },
    { name: 'Siddharth Nair', area: 'Bandra Area', totalCall: 195, productive: 160, telephonic: 35, target: 20000, achieved: 17800 },
    { name: 'Vikram Joshi', area: 'Powai Area', totalCall: 170, productive: 135, telephonic: 35, target: 17000, achieved: 14200 },
    { name: 'Arjun Deshmukh', area: 'Thane Area', totalCall: 210, productive: 175, telephonic: 35, target: 22000, achieved: 19800 },
    { name: 'Karan Malhotra', area: 'Borivali Area', totalCall: 185, productive: 150, telephonic: 35, target: 19000, achieved: 16500 },
    { name: 'Rahul Iyer', area: 'Goregaon Area', totalCall: 200, productive: 165, telephonic: 35, target: 21000, achieved: 18800 }
  ];

  salesOfficers: SalesOfficer[] = [
    { name: 'Pradeep Singh', territory: 'Andheri West Territory', totalCall: 150, productive: 120, telephonic: 30, target: 15000, achieved: 12800 },
    { name: 'Anil Verma', territory: 'Andheri East Territory', totalCall: 165, productive: 135, telephonic: 30, target: 16000, achieved: 14200 },
    { name: 'Vikram Desai', territory: 'Bandra West Territory', totalCall: 140, productive: 115, telephonic: 25, target: 14000, achieved: 11800 },
    { name: 'Suresh Kumar', territory: 'Bandra East Territory', totalCall: 155, productive: 130, telephonic: 25, target: 15500, achieved: 13800 },
    { name: 'Ramesh Patel', territory: 'Powai Territory', totalCall: 135, productive: 110, telephonic: 25, target: 13500, achieved: 11200 },
    { name: 'Nitin Agarwal', territory: 'Thane West Territory', totalCall: 160, productive: 140, telephonic: 20, target: 16000, achieved: 15200 }
  ];

  salesRepresentatives: SalesRepresentative[] = [
    { name: 'Manoj Kulkarni', route: 'Route A - Andheri West', totalCall: 120, productive: 95, telephonic: 25, target: 12000, achieved: 10200 },
    { name: 'Rajesh Mehta', route: 'Route B - Andheri East', totalCall: 130, productive: 105, telephonic: 25, target: 13000, achieved: 11200 },
    { name: 'Sunil Joshi', route: 'Route C - Bandra West', totalCall: 115, productive: 90, telephonic: 25, target: 11500, achieved: 9800 },
    { name: 'Kiran Shah', route: 'Route D - Bandra East', totalCall: 125, productive: 100, telephonic: 25, target: 12500, achieved: 10800 },
    { name: 'Ravi Iyer', route: 'Route E - Powai', totalCall: 110, productive: 85, telephonic: 25, target: 11000, achieved: 9200 },
    { name: 'Sandeep Reddy', route: 'Route F - Thane West', totalCall: 135, productive: 110, telephonic: 25, target: 13500, achieved: 11800 }
  ];

  ngOnInit(): void {
    // Check if there's an NSM name, ZSM name, and/or RSM name in the route
    this.route.params.subscribe(params => {
      if (params['nsmName']) {
        const nsmName = decodeURIComponent(params['nsmName']).replace(/-/g, ' ');
        const manager = this.salesManagers.find(m => 
          m.name.toLowerCase() === nsmName.toLowerCase()
        );
        if (manager) {
          this.selectedManager = manager;
        }
      }

      if (params['zsmName']) {
        const zsmName = decodeURIComponent(params['zsmName']).replace(/-/g, ' ');
        const zsm = this.zonalManagers.find(z => 
          z.name.toLowerCase() === zsmName.toLowerCase()
        );
        if (zsm) {
          this.clickedZSM = zsm;
        }
      }

      if (params['rsmName']) {
        const rsmName = decodeURIComponent(params['rsmName']).replace(/-/g, ' ');
        const rsm = this.regionalManagers.find(r => 
          r.name.toLowerCase() === rsmName.toLowerCase()
        );
        if (rsm) {
          this.clickedRSM = rsm;
        }
      }

      if (params['asmName']) {
        const asmName = decodeURIComponent(params['asmName']).replace(/-/g, ' ');
        const asm = this.areaSalesManagers.find(a => 
          a.name.toLowerCase() === asmName.toLowerCase()
        );
        if (asm) {
          this.clickedASM = asm;
        }
      }

      if (params['soName']) {
        const soName = decodeURIComponent(params['soName']).replace(/-/g, ' ');
        const so = this.salesOfficers.find(s => 
          s.name.toLowerCase() === soName.toLowerCase()
        );
        if (so) {
          this.clickedSO = so;
        }
      }
    });
  }

  selectManager(manager: SalesManager): void {
    this.selectedManager = manager;
    // Navigate to the route with NSM name
    const routeName = manager.name.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/admin/live-view', routeName]);
  }

  getAchievementPercentage(target: number, achieved: number): number {
    return (achieved / target) * 100;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  getManagerInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name[0];
  }

  viewLiveActivity(zsm: ZonalManager, event: Event): void {
    event.stopPropagation();
    this.selectedZSM = zsm;
    this.isTimelineOpen = true;
  }

  selectZSM(zsm: ZonalManager): void {
    this.clickedZSM = zsm;
    this.isTimelineOpen = false;
    
    // Navigate to the route with NSM and ZSM names
    if (this.selectedManager) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = zsm.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName]);
    }
  }

  isZSMSelected(zsm: ZonalManager): boolean {
    return this.clickedZSM?.name === zsm.name;
  }

  selectRSM(rsm: RegionalManager, event: Event): void {
    event.stopPropagation();
    this.clickedRSM = rsm;
    this.isTimelineOpen = false;
    
    // Navigate to the route with NSM, ZSM, and RSM names
    if (this.selectedManager && this.clickedZSM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = rsm.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName]);
    }
  }

  isRSMSelected(rsm: RegionalManager): boolean {
    return this.clickedRSM?.name === rsm.name;
  }

  selectASM(asm: AreaSalesManager, event: Event): void {
    event.stopPropagation();
    this.clickedASM = asm;
    this.isTimelineOpen = false;
    
    // Navigate to the route with NSM, ZSM, RSM, and ASM names
    if (this.selectedManager && this.clickedZSM && this.clickedRSM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = this.clickedRSM.name.toLowerCase().replace(/\s+/g, '-');
      const asmRouteName = asm.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName, asmRouteName]);
    }
  }

  isASMSelected(asm: AreaSalesManager): boolean {
    return this.clickedASM?.name === asm.name;
  }

  selectSO(so: SalesOfficer, event: Event): void {
    event.stopPropagation();
    this.clickedSO = so;
    this.isTimelineOpen = false;
    
    // Navigate to the route with NSM, ZSM, RSM, ASM, and SO names
    if (this.selectedManager && this.clickedZSM && this.clickedRSM && this.clickedASM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = this.clickedRSM.name.toLowerCase().replace(/\s+/g, '-');
      const asmRouteName = this.clickedASM.name.toLowerCase().replace(/\s+/g, '-');
      const soRouteName = so.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName, asmRouteName, soRouteName]);
    }
  }

  isSOSelected(so: SalesOfficer): boolean {
    return this.clickedSO?.name === so.name;
  }

  isSRSelected(sr: SalesRepresentative): boolean {
    return this.clickedSR?.name === sr.name;
  }

  // Helper methods for type-safe comparisons in template
  isSOItemSelected(so: SalesOfficer): boolean {
    return this.clickedSO !== null && this.clickedSO.name === so.name;
  }

  isASMItemSelected(asm: AreaSalesManager): boolean {
    return this.clickedASM !== null && this.clickedASM.name === asm.name;
  }

  isRSMItemSelected(rsm: RegionalManager): boolean {
    return this.clickedRSM !== null && this.clickedRSM.name === rsm.name;
  }

  isZSMItemSelected(zsm: ZonalManager): boolean {
    return this.clickedZSM !== null && this.clickedZSM.name === zsm.name;
  }

  isManagerSelected(manager: SalesManager): boolean {
    return this.selectedManager !== null && 
           this.selectedManager.name === manager.name && 
           this.selectedManager.region === manager.region;
  }

  closeTimeline(): void {
    this.isTimelineOpen = false;
    this.selectedZSM = null;
  }

  // Navigation methods for breadcrumbs
  navigateToHome(): void {
    this.router.navigate(['/admin/live-view']);
    this.selectedManager = null;
    this.clickedZSM = null;
    this.clickedRSM = null;
    this.clickedASM = null;
    this.clickedSO = null;
    this.clickedSR = null;
  }

  navigateToNSM(): void {
    if (this.selectedManager) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName]);
      this.clickedZSM = null;
      this.clickedRSM = null;
      this.clickedASM = null;
      this.clickedSO = null;
      this.clickedSR = null;
    }
  }

  navigateToZSM(): void {
    if (this.selectedManager && this.clickedZSM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName]);
      this.clickedRSM = null;
      this.clickedASM = null;
      this.clickedSO = null;
      this.clickedSR = null;
    }
  }

  navigateToRSM(): void {
    if (this.selectedManager && this.clickedZSM && this.clickedRSM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = this.clickedRSM.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName]);
      this.clickedASM = null;
      this.clickedSO = null;
      this.clickedSR = null;
    }
  }

  navigateToASM(): void {
    if (this.selectedManager && this.clickedZSM && this.clickedRSM && this.clickedASM) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = this.clickedRSM.name.toLowerCase().replace(/\s+/g, '-');
      const asmRouteName = this.clickedASM.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName, asmRouteName]);
      this.clickedSO = null;
      this.clickedSR = null;
    }
  }

  navigateToSO(): void {
    if (this.selectedManager && this.clickedZSM && this.clickedRSM && this.clickedASM && this.clickedSO) {
      const nsmRouteName = this.selectedManager.name.toLowerCase().replace(/\s+/g, '-');
      const zsmRouteName = this.clickedZSM.name.toLowerCase().replace(/\s+/g, '-');
      const rsmRouteName = this.clickedRSM.name.toLowerCase().replace(/\s+/g, '-');
      const asmRouteName = this.clickedASM.name.toLowerCase().replace(/\s+/g, '-');
      const soRouteName = this.clickedSO.name.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/admin/live-view', nsmRouteName, zsmRouteName, rsmRouteName, asmRouteName, soRouteName]);
      this.clickedSR = null;
    }
  }

  // Convert lat/lng to percentage position for overlay
  // Map center is approximately 19.1364, 72.8273 (Andheri West)
  // Map bounds approximately: 19.08 to 19.17 (lat), 72.80 to 72.86 (lng)
  getMarkerX(position: { lat: number; lng: number }): number {
    const minLng = 72.78;
    const maxLng = 72.87;
    const range = maxLng - minLng;
    const normalized = (position.lng - minLng) / range;
    return normalized * 100;
  }

  getMarkerY(position: { lat: number; lng: number }): number {
    const minLat = 19.08;
    const maxLat = 19.17;
    const range = maxLat - minLat;
    const normalized = (position.lat - minLat) / range;
    return normalized * 100;
  }

  timelineData: TimelineItem[] = [
    { type: 'checkin', time: '8:58 AM', title: 'CHECKED IN', location: 'Mumbai Central' },
    { type: 'store', time: '09:26 AM', title: 'Sharma General Store', checkIn: '09:26 AM', checkOut: '09:38 AM', amount: '₹2.5k' },
    { type: 'store', time: '10:04 AM', title: 'Golden Bakery', checkIn: '10:04 AM', checkOut: '10:15 AM', amount: '₹5.0k' },
    { type: 'store', time: '10:22 AM', title: 'Sunrise Mart', checkIn: '10:22 AM', checkOut: '10:35 AM', amount: '₹1.5k' },
    { type: 'store', time: '10:48 AM', title: 'City Fresh Store', checkIn: '10:48 AM', checkOut: '11:00 AM', amount: '₹5.5k' },
    { type: 'lunch', time: '11:26 AM', title: 'LUNCH BREAK', duration: '25 min', amount: '₹5.5k' },
    { type: 'store', time: '12:30 PM', title: 'Daily Needs Shop', checkIn: '12:30 PM', checkOut: '12:45 PM', amount: '₹3.5k' },
    { type: 'checkout', time: '8:08 PM', title: 'CHECKED OUT', location: 'Mumbai Central', amount: '₹2.5k' }
  ];

  mapMarkers: MapMarker[] = [
    // NSM - Red
    { id: '1', name: 'Krutik Shah', role: 'NSM', position: { lat: 19.1364, lng: 72.8273 }, color: '#FF0000' }, // Andheri West
    
    // ZSM - Blue
    { id: '2', name: 'Jay Mahyavanshi', role: 'ZSM', position: { lat: 19.1197, lng: 72.8467 }, color: '#0000FF' }, // Andheri Station
    { id: '3', name: 'Amit Sharma', role: 'ZSM', position: { lat: 19.1500, lng: 72.8000 }, color: '#0000FF' }, // Versova
    
    // RSM - Green
    { id: '4', name: 'Nehal Patel', role: 'RSM', position: { lat: 19.1000, lng: 72.8500 }, color: '#00FF00' }, // Jogeshwari
    { id: '5', name: 'Rahul Verma', role: 'RSM', position: { lat: 19.1600, lng: 72.8400 }, color: '#00FF00' }, // Lokhandwala
    
    // ASM - Orange
    { id: '6', name: 'Amit Khanna', role: 'ASM', position: { lat: 19.1250, lng: 72.8300 }, color: '#FFA500' }, // Andheri East
    { id: '7', name: 'Neeraj Gupta', role: 'ASM', position: { lat: 19.1100, lng: 72.8200 }, color: '#FFA500' }, // Vile Parle
    
    // SO - Purple
    { id: '8', name: 'Pradeep Singh', role: 'SO', position: { lat: 19.1400, lng: 72.8100 }, color: '#800080' }, // Oshiwara
    { id: '9', name: 'Anil Verma', role: 'SO', position: { lat: 19.0950, lng: 72.8350 }, color: '#800080' }, // Goregaon
    { id: '10', name: 'Vikram Desai', role: 'SO', position: { lat: 19.1300, lng: 72.8450 }, color: '#800080' }, // Andheri Kurla Road
    { id: '11', name: 'Suresh Kumar', role: 'SO', position: { lat: 19.1450, lng: 72.8150 }, color: '#800080' }, // Four Bungalows
    { id: '12', name: 'Ramesh Patel', role: 'SO', position: { lat: 19.1050, lng: 72.8250 }, color: '#800080' }, // Santacruz
    
    // SR - Magenta
    { id: '13', name: 'Manoj Kulkarni', role: 'SR', position: { lat: 19.1350, lng: 72.8400 }, color: '#FF00FF' }, // Andheri West - near station
    { id: '14', name: 'Rajesh Mehta', role: 'SR', position: { lat: 19.1200, lng: 72.8150 }, color: '#FF00FF' }, // Juhu
    { id: '15', name: 'Sunil Joshi', role: 'SR', position: { lat: 19.1500, lng: 72.8300 }, color: '#FF00FF' }, // Versova Beach
    { id: '16', name: 'Kiran Shah', role: 'SR', position: { lat: 19.1150, lng: 72.8500 }, color: '#FF00FF' }, // Jogeshwari West
    { id: '17', name: 'Nitin Agarwal', role: 'SR', position: { lat: 19.1550, lng: 72.8200 }, color: '#FF00FF' }, // Lokhandwala Complex
    { id: '18', name: 'Deepak Malhotra', role: 'SR', position: { lat: 19.0900, lng: 72.8400 }, color: '#FF00FF' }, // Goregaon West
    { id: '19', name: 'Ravi Iyer', role: 'SR', position: { lat: 19.1250, lng: 72.8050 }, color: '#FF00FF' }, // Vile Parle West
    { id: '20', name: 'Sandeep Reddy', role: 'SR', position: { lat: 19.1400, lng: 72.8550 }, color: '#FF00FF' } // Andheri East
  ];
}

