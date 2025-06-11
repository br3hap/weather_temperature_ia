# -*- coding: utf-8 -*-
{
    'name': 'Temperatura Min/Max',
    'version': '1.0',
    'summary': """ Módulo que permite ubicar la temperatura mínima y máxima de las ciudades del Perú Con OpenAI""",
    'author': 'Breithner Aquituari',
    'website': '',
    'category': '',
    'depends': ['base', 'base_setup'],
    "data": [
        "security/ir.model.access.csv",
        "views/res_config_settings_views.xml",
        "data/ir_cron.xml",
        "views/menu_views.xml",
        "views/weather_city_views.xml",
        # "views/weather_record_views.xml"
    ],
    
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
