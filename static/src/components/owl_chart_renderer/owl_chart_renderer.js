/** @odoo-module **/
import { Component, onMounted, onWillStart, useRef, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";

export class OwlChartRenderer extends Component {
    setup() {
        this.orm = useService("orm");
        this.barRef = useRef("barChart");
        this.pieRef = useRef("pieChart");
        const today = new Date().toLocaleDateString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // this.state = { data: [] };
        this.state = useState({
            today,   // <-- fecha ya lista
            data: []
        });

        onWillStart(async () => {
            // Carga Chart.js dinámicamente
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js");

            const isoToday = new Date().toISOString().slice(0, 10);
            // Obtiene registros
            const recs = await this.orm.searchRead(
                "weather.record", 
                [["date","=", isoToday]], 
                ["city_id", "max_temperature", "min_temperature"]
            );
            // Agrupa y promedia
            const agg = {};
            recs.forEach(r => {
                const city = r.city_id[1];
                if (!agg[city]) agg[city] = { max: [], min: [] };
                agg[city].max.push(r.max_temperature);
                agg[city].min.push(r.min_temperature);
            });
            this.state.data = Object.entries(agg).map(([city, v]) => ({
                city,
                max: v.max.reduce((a,b)=>a+b,0)/v.max.length,
                min: v.min.reduce((a,b)=>a+b,0)/v.min.length,
            }));
        });

        onMounted(() => {
            const labels = this.state.data.map(d => d.city);
            const maxData = this.state.data.map(d => d.max);
            const minData = this.state.data.map(d => d.min);

            // Gráfico de barras
            new Chart(this.barRef.el.getContext("2d"), {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        { label: "Máxima", data: maxData },
                        { label: "Mínima", data: minData },
                    ],
                },
                options: { 
                    responsive: true, 
                    plugins: { 
                        legend: { position: "top" }
                    } },
            });

            // Gráfico pie de mínimas
            new Chart(this.pieRef.el.getContext("2d"), {
                type: "pie",
                data: {
                    labels,
                    datasets: [{ label: "Mínima", data: minData }],
                },
                options: { 
                    responsive: true, 
                    plugins: { 
                        legend: { position: "bottom" }
                    } },
            });
        });
    }
}

OwlChartRenderer.template = "weather_temperature_ia.OwlChartRenderer";
registry.category("actions").add("weather_temperature_ia.chart_dashboard", OwlChartRenderer);
