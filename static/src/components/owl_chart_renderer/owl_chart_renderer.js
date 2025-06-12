/** @odoo-module **/
import { Component, onWillStart, onMounted, useRef, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";

// Paletas de color para light/dark
const PALETTES = {
    light: {
        background: ['rgba(184, 60, 87, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        border:     ['rgb(196, 16, 166)',   'rgba(54, 162, 235, 1)'],
        textColor:  '#333',
        cssVar:     '#333',
    },
    dark: {
        background: ['rgba(189, 192, 16, 0.6)', 'rgba(72, 61, 139, 0.6)'],
        border:     ['rgb(8, 190, 78)',   'rgba(72, 61, 139, 1)'],
        textColor:  '#eee',
        cssVar:     '#eee',
    }
};

export class OwlChartRenderer extends Component {
    setup() {
        this.orm = useService("orm");
        this.rootRef = useRef("root"); 
        this.barRef = useRef("barChart");
        this.pieRef = useRef("pieChart");

        // Inicializamos estado con fecha y tema
        const today = new Date().toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        this.state = useState({ data: [], today, theme: 'light' });
        this.charts = {};

        onWillStart(async () => {
            // Cargar Chart.js
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js");
            // Filtrar sólo hoy
            const isoToday = new Date().toISOString().slice(0, 10);
            const recs = await this.orm.searchRead(
                "weather.record",
                [["date", "=", isoToday]],
                ["city_id", "max_temperature", "min_temperature"]
            );
            // Agrupar y promediar
            const agg = {};
            recs.forEach(r => {
                const city = r.city_id[1];
                if (!agg[city]) agg[city] = { max: [], min: [] };
                if (r.max_temperature != null) agg[city].max.push(r.max_temperature);
                if (r.min_temperature != null) agg[city].min.push(r.min_temperature);
            });
            this.state.data = Object.entries(agg).map(([city, v]) => ({
                city,
                avgMax: v.max.length ? (v.max.reduce((a,b)=>a+b,0)/v.max.length) : 0,
                avgMin: v.min.length ? (v.min.reduce((a,b)=>a+b,0)/v.min.length) : 0,
            }));
        });

        onMounted(() => this._renderCharts());
    }

    toggleTheme() {
        // Alterna el tema
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        // Aplica la clase global
        this.rootRef.el.classList.toggle('dark-theme', this.state.theme === 'dark');
        // document.documentElement.classList.toggle('dark-theme', this.state.theme === 'dark');
        // // Actualiza variable CSS para textos
        // document.documentElement.style.setProperty('--text-color', PALETTES[this.state.theme].cssVar);
        // Refresca los colores de los charts
        this._updateChartStyles();
    }

    _renderCharts() {
        const labels = this.state.data.map(d=>d.city);
        const maxData = this.state.data.map(d=>parseFloat(d.avgMax.toFixed(1)));
        const minData = this.state.data.map(d=>parseFloat(d.avgMin.toFixed(1)));
        const p = PALETTES[this.state.theme];

        // Gráfico de barras
        this.charts.bar = new Chart(this.barRef.el.getContext("2d"), {
            type: "bar",
            data: {
                labels,
                datasets: [
                    { label: "Máxima", data: maxData, backgroundColor: p.background[0], borderColor: p.border[0] },
                    { label: "Mínima", data: minData, backgroundColor: p.background[1], borderColor: p.border[1] },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: p.textColor } },
                    title: {
                        display: true,
                        text: `Temperaturas Promedio (${this.state.today})`,
                        color: p.textColor
                    }
                }
            },
        });

        // Gráfico tipo pie
        this.charts.pie = new Chart(this.pieRef.el.getContext("2d"), {
            type: "pie",
            data: {
                labels,
                datasets: [{ data: minData, backgroundColor: p.background, borderColor: p.border }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom", labels: { color: p.textColor } },
                    title: {
                        display: true,
                        text: `Distribución Mínimas (${this.state.today})`,
                        color: p.textColor
                    }
                }
            },
        });

        // Inicializa CSS var
        document.documentElement.style.setProperty('--text-color', p.cssVar);
    }

    _updateChartStyles() {
        const p = PALETTES[this.state.theme];
        Object.values(this.charts).forEach(chart => {
            chart.data.datasets.forEach((ds,i) => {
                ds.backgroundColor = Array.isArray(p.background) ? p.background[i] : p.background;
                ds.borderColor     = Array.isArray(p.border)     ? p.border[i]     : p.border;
            });
            chart.options.plugins.legend.labels.color = p.textColor;
            chart.options.plugins.title.color = p.textColor;
            chart.update();
        });
    }
}

OwlChartRenderer.template = "weather_temperature_ia.OwlChartRenderer";
registry.category("actions").add("weather_temperature_ia.chart_dashboard", OwlChartRenderer);
