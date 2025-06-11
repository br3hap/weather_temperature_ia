# -*- coding: utf-8 -*-
{
    'name': 'Temperatura Min/Max',
    'version': '1.0',
    'summary': """ Módulo que permite ubicar la temperatura mínima y máxima de las ciudades del Perú """,
    'author': 'Breithner Aquituari',
    'website': '',
    'category': '',
    'depends': ['base', ],
    "data": [
        "security/ir.model.access.csv",
        "views/weather_city_views.xml",
        "views/weather_record_views.xml"
    ],
    
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
