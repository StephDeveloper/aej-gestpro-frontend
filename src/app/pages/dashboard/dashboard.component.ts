import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Import des modules ApexCharts
import {
  ChartComponent,
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexStroke,
  ApexTheme
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  xaxis?: ApexXAxis;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  stroke?: ApexStroke;
  legend?: ApexLegend;
  colors?: string[];
  labels?: string[];
  theme?: ApexTheme;
  responsive?: ApexResponsive[];
};

interface DashboardData {
  total_projets: number;
  projets_par_statut: {
    Validé: number;
    Rejeté: number;
    'en cours': number;
    [key: string]: number;
  };
  utilisateurs_uniques: number;
  projets_par_type: {
    [key: string]: number;
  };
  projets_par_forme_juridique: {
    [key: string]: number;
  };
  evolution_mensuelle: {
    period: string;
    total: number;
  }[];
  projets_recents: {
    id: number;
    nom: string;
    prenoms: string;
    email: string;
    type_projet: string;
    forme_juridique: string;
    statut: string;
    created_at: string;
  }[];
  taux_conversion: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent implements OnInit {
  @ViewChild("statusChart") statusChart!: ChartComponent;
  @ViewChild("typeChart") typeChart!: ChartComponent;
  @ViewChild("formeJuridiqueChart") formeJuridiqueChart!: ChartComponent;
  
  // Options du graphique de statuts
  public statusChartOptions: Partial<ChartOptions> = {
    series: [0, 0, 0] as ApexNonAxisChartSeries,
    chart: {
      type: "donut",
      height: 320,
      animations: {
        enabled: true,
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    labels: ['Validé', 'Rejeté', 'En cours'],
    colors: ['#28a745', '#dc3545', '#ffc107'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'bottom',
      fontSize: '14px'
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => {
          return val + " projets";
        }
      }
    }
  };

  // Options du graphique de types de projets
  public typeChartOptions: Partial<ChartOptions> = {
    series: [{
      name: 'Projets',
      data: [0, 0]
    }] as ApexAxisChartSeries,
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#0dcaf0', '#6f42c1'],
    dataLabels: {
      enabled: true,
      offsetX: 30,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: [],
      labels: {
        formatter: function(val: string) {
          return val.toString();
        }
      }
    },
    yaxis: {
      title: {
        text: 'Types de Projets'
      }
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val + " projets";
        }
      }
    },
    legend: {
      show: false
    }
  };

  // Options du graphique de formes juridiques
  public formeJuridiqueChartOptions: Partial<ChartOptions> = {
    series: [0, 0, 0, 0] as ApexNonAxisChartSeries,
    chart: {
      type: "pie",
      height: 320,
      animations: {
        enabled: true,
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    labels: ['SARL', 'SA', 'EI', 'Autre'],
    colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'bottom',
      fontSize: '14px'
    },
    tooltip: {
      enabled: true
    }
  };

  dashboardData: DashboardData | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  
  // Accès à l'objet Math global
  Math = Math;
  
  // Pour les graphiques
  statusColors: string[] = ['#28a745', '#dc3545', '#ffc107'];
  
  typeColors: string[] = ['#0dcaf0', '#6f42c1'];
  
  formeJuridiqueColors: string[] = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.dashboardData = response.data;
          // console.log('Dashboard data:', this.dashboardData);
          // Mise à jour des graphiques avec les données
          this.updateCharts();
        } else {
          this.error = 'Erreur lors du chargement des données du tableau de bord';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Erreur lors du chargement des données du tableau de bord';
        this.isLoading = false;
      }
    });
  }
  
  updateCharts(): void {
    if (!this.dashboardData) return;
    
    // Mise à jour du graphique de statuts
    this.statusChartOptions.series = [
      this.dashboardData.projets_par_statut['Validé'] || 0,
      this.dashboardData.projets_par_statut['Rejeté'] || 0,
      this.dashboardData.projets_par_statut['en cours'] || 0
    ] as ApexNonAxisChartSeries;
    
    // Mise à jour du graphique de types de projets
    const typeKeys = Object.keys(this.dashboardData.projets_par_type);
    if (this.typeChartOptions.xaxis) {
      this.typeChartOptions.xaxis.categories = typeKeys;
    } else {
      this.typeChartOptions.xaxis = {
        categories: typeKeys
      };
    }
    this.typeChartOptions.series = [{
      name: 'Projets',
      data: typeKeys.map(key => this.dashboardData?.projets_par_type[key] || 0)
    }] as ApexAxisChartSeries;
    
    // Mise à jour du graphique de formes juridiques
    const formeKeys = Object.keys(this.dashboardData.projets_par_forme_juridique);
    if (this.formeJuridiqueChartOptions.labels) {
      this.formeJuridiqueChartOptions.labels = formeKeys;
    }
    this.formeJuridiqueChartOptions.series = formeKeys.map(key => 
      this.dashboardData?.projets_par_forme_juridique[key] || 0
    ) as ApexNonAxisChartSeries;
  }
  
  // Méthode pour obtenir les clés d'un objet
  getObjectKeys(obj: {[key: string]: any}): string[] {
    return Object.keys(obj || {});
  }
  
  // Helper pour formater les dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
  
  // Méthode pour naviguer vers la liste des projets
  goToProjects(): void {
    this.router.navigateByUrl('/home/projects');
  }
  
  // Pour obtenir le pourcentage pour les graphiques en camembert
  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
  
  // Calculer la valeur du trait de séparation (stroke-dasharray)
  getStrokeDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 40; // 40 est le rayon du cercle
    return `${(percentage * circumference) / 100} ${circumference}`;
  }
  
  // Génère un ID unique pour les dégradés SVG
  getUniqueId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
