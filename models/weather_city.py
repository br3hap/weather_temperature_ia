# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class WeatherCity(models.Model):
    _name = 'weather.city'
    _description = 'Ciudad'

    name = fields.Char(string='Ciudad', required=True)
    temperature_ids = fields.One2many('weather.record', 'city_id', string="Registros de temperatura")