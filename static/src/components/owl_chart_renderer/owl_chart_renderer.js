/** @odoo-module **/

import { Component, onMounted, useRef, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";

export class OwlChartRenderer extends Component {
    setup() {
        this.orm = useService("orm");
        this.chartRef = useRef("chart");

        this.state = useState({
            title: "Temperaturas por Ciudad",
            data: [],
        });

        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js");

            const result = await this.orm.searchRead("weather.record", [], ["city_id", "max_temperature", "min_temperature"]);
            const grouped = {};

            for (const record of result) {
                const city = record.city_id[1];
                if (!grouped[city]) grouped[city] = { max: [], min: [] };
                grouped[city].max.push(record.max_temperature);
                grouped[city].min.push(record.min_temperature);
            }

            this.state.data = Object.entries(grouped).map(([city, values]) => ({
                city,
                max: values.max.reduce((a, b) => a + b, 0) / values.max.length,
                min: values.min.reduce((a, b) => a + b, 0) / values.min.length,
            }));
        });

        onMounted(() => {
            const ctx = this.chartRef.el.getContext("2d");
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: this.state.data.map(d => d.city),
                    datasets: [
                        {
                            label: "Máxima",
                            data: this.state.data.map(d => d.max),
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                        },
                        {
                            label: "Mínima",
                            data: this.state.data.map(d => d.min),
                            backgroundColor: "rgba(54, 162, 235, 0.5)",
                        }
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: this.state.title
                        }
                    }
                }
            });
        });
    }
}

OwlChartRenderer.template = "OwlChartRenderer";
registry.category("actions").add("weather_temperature_ia.chart_dashboard", OwlChartRenderer);
