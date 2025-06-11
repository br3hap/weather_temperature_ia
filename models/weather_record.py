# -*- coding: utf-8 -*-
import logging
import openai

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class WeatherRecord(models.Model):
    _name = 'weather.record'
    _description = 'Registro de temperatura por día'

    city_id = fields.Many2one('weather.city', string="Ciudad", required=True, ondelete='cascade')
    date = fields.Date(string="Fecha", default=fields.Date.today, required=True)
    max_temperature = fields.Float(string="Temp. Máxima")
    min_temperature = fields.Float(string="Temp. Mínima")
    predicted = fields.Boolean(string="Predicción por IA", default=False)

    _sql_constraints = [
        ('unique_city_date', 'unique(city_id, date)', 'Ya existe un registro para esta ciudad.')
    ]


    def update_temperature_data(self):
        api_key = self.env['ir.config_parameter'].sudo().get_param('weather_temperature_ai.openai_api_key')
        if not api_key:
            _logger.warning("No se ha configurado la clave de API de OpenAI")
            return

        openai.api_key = api_key
        cities = self.env['weather.city'].search([])

        for city in cities:
            today = fields.Date.today()
            if self.search_count([('city_id', '=', city.id), ('date', '=', today)]):
                continue


            prompt = (
                f"Dame solo dos números estimados de temperatura máxima y mínima para hoy en {city.name}, Perú, separados por una barra. "
                "Ejemplo: 26.4 / 15.2. Solo los números, nada más."
            )

            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4.1-mini",
                    messages=[{"role": "user", "content": prompt}]
                )
                content = response['choices'][0]['message']['content'].strip()
                parts = content.replace(',', '.').split('/')
                try:
                    max_temp = float(parts[0])
                    min_temp = float(parts[1])
                except (ValueError, IndexError):
                    _logger.warning(f"Respuesta no válida de OpenAI para {city.name}: {content}")
                    continue

                self.create({
                    'city_id': city.id,
                    'date': today,
                    'max_temperature': max_temp,
                    'min_temperature': min_temp,
                    'predicted': True
                })
            except Exception as e:
                _logger.error(f"Error al obtener temperaturas para {city.name}: {e}")

        
