import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ActivityService } from '../../../core/services/activity.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Activity {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  ubicacion?: string;
  max_participantes?: number;
  estado?: string;
  organizador_id?: number;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    TimeAgoPipe
  ],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  private activityService = inject(ActivityService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  activities: Activity[] = [];
  dataSource = new MatTableDataSource<Activity>();
  displayedColumns: string[] = ['titulo', 'tipo', 'fecha_inicio', 'estado', 'acciones'];

  filterForm!: FormGroup;
  isLoading = false;
  totalActivities = 0;
  pageSize = 10;
  pageIndex = 0;

  tipos = [
    { value: '', label: 'Todos' },
    { value: 'Reunión', label: 'Reunión' },
    { value: 'Evento', label: 'Evento' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Asamblea', label: 'Asamblea' },
    { value: 'Celebración', label: 'Celebración' },
    { value: 'Otro', label: 'Otro' }
  ];

  estados = [
    { value: '', label: 'Todos' },
    { value: 'Programada', label: 'Programada' },
    { value: 'En Curso', label: 'En Curso' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  ngOnInit(): void {
    this.initFilterForm();
    this.loadActivities();
    this.setupFilterListeners();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      tipo: [''],
      estado: [''],
      fecha_inicio: [''],
      fecha_fin: ['']
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadActivities();
      });
  }

  loadActivities(): void {
    this.isLoading = true;

    const filters = this.filterForm?.value || {};
    const params: any = {
      page: this.pageIndex + 1,
      limit: this.pageSize
    };

    if (filters.tipo) params.tipo = filters.tipo;
    if (filters.estado) params.estado = filters.estado;
    if (filters.search) params.search = filters.search;
    if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
    if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

    this.activityService.getAllActivities(params).subscribe({
      next: (response) => {
        this.activities = response.data || [];
        this.dataSource.data = this.activities;
        this.totalActivities = response.total || this.activities.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.activities = [];
        this.dataSource.data = [];
        this.isLoading = false;

        if (error.status === 403) {
          this.notificationService.warning('No tienes permisos para ver actividades');
        } else if (error.status !== 500) {
          this.notificationService.error('Error al cargar actividades');
        }
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      tipo: '',
      estado: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadActivities();
  }

  openCreateDialog(): void {
    if (!this.canCreateActivity()) {
      this.snackBar.open('No tiene permisos para crear actividades', 'Cerrar', { duration: 3000 });
      return;
    }

    this.snackBar.open('Función de crear actividad disponible próximamente', 'Cerrar', { duration: 3000 });
  }

  editActivity(activity: Activity): void {
    if (!this.canEditActivity()) {
      this.snackBar.open('No tiene permisos para editar actividades', 'Cerrar', { duration: 3000 });
      return;
    }

    this.snackBar.open('Función de editar actividad disponible próximamente', 'Cerrar', { duration: 3000 });
  }

  cancelActivity(id: number): void {
    if (!this.canEditActivity()) {
      this.notificationService.warning('No tiene permisos para cancelar actividades');
      return;
    }

    if (confirm('¿Está seguro de cancelar esta actividad?')) {
      this.activityService.updateActivity(id, { estado: 'Cancelada' }).subscribe({
        next: () => {
          this.notificationService.success('Actividad cancelada exitosamente');
          this.loadActivities();
        },
        error: (error) => {
          console.error('Error canceling activity:', error);
          this.notificationService.error(error.error?.message || 'Error al cancelar actividad');
        }
      });
    }
  }

  onDelete(activity: Activity): void {
    if (!this.canDelete()) {
      this.notificationService.warning('No tiene permisos para eliminar actividades');
      return;
    }

    if (confirm(`¿Está seguro de eliminar la actividad "${activity.titulo}"?`)) {
      this.activityService.deleteActivity(activity.id).subscribe({
        next: () => {
          this.notificationService.success('Actividad eliminada exitosamente');
          this.loadActivities();
        },
        error: (error) => {
          console.error('Error deleting activity:', error);
          this.notificationService.error('Error al eliminar actividad');
        }
      });
    }
  }

  exportToCSV(): void {
    if (!this.canEditActivity()) {
      this.notificationService.warning('No tiene permisos para exportar');
      return;
    }

    this.notificationService.info('Exportación disponible próximamente');
  }

  getTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'Reunión': 'type-meeting',
      'Evento': 'type-event',
      'Mantenimiento': 'type-maintenance',
      'Asamblea': 'type-assembly',
      'Celebración': 'type-celebration',
      'Otro': 'type-other'
    };
    return typeMap[type] || 'type-default';
  }

  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'Reunión': 'groups',
      'Evento': 'event',
      'Mantenimiento': 'build',
      'Asamblea': 'gavel',
      'Celebración': 'celebration',
      'Otro': 'category'
    };
    return iconMap[type] || 'help_outline';
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'Programada': 'status-scheduled',
      'En Curso': 'status-in-progress',
      'Completada': 'status-completed',
      'Cancelada': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'Programada': 'schedule',
      'En Curso': 'sync',
      'Completada': 'check_circle',
      'Cancelada': 'cancel'
    };
    return iconMap[status] || 'help_outline';
  }

  canEdit(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  canCreateActivity(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  canEditActivity(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperAdmin();
  }

  getScheduledCount(): number {
    return this.dataSource.data.filter(a => a.estado === 'Programada').length;
  }

  getInProgressCount(): number {
    return this.dataSource.data.filter(a => a.estado === 'En Curso').length;
  }

  getCompletedCount(): number {
    return this.dataSource.data.filter(a => a.estado === 'Completada').length;
  }

  private getUserFromLocalStorage(): any {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
}