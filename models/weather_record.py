# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class WeatherRecord(models.Model):
    _name = 'weather.record'
    _description = 'Registro de temperatura por día'

    name = fields.Char('Name')
