# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class WeatherRecord(models.Model):
    _name = 'weather.record'
    _description = 'Registro de temperatura por día'

    # name = fields.Char('Name')
    city_id = fields.Many2one('weather.city', string="Ciudad", required=True, ondelete='cascade')
    date = fields.Date(string="Fecha", default=fields.Date.today, required=True)
    max_temperature = fields.Float(string="Temp. Máxima")
    min_temperature = fields.Float(string="Temp. Mínima")
    predicted = fields.Boolean(string="Predicción por IA", default=False)

    _sql_constraints = [
        ('unique_city_date', 'unique(city_id, date)', 'Ya existe un registro para esta ciudad.')
    ]
