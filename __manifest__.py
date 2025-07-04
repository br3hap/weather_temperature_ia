# -*- coding: utf-8 -*-
{
    'name': 'Temperatura Min/Max',
    'version': '1.0',
    'summary': """ Módulo que permite ubicar la temperatura mínima y máxima de las ciudades del Perú Con OpenAI""",
    'author': 'Breithner Aquituari',
    'website': '',
    'category': '',
    'depends': ['base', 'base_setup', 'mail', 'web'],
    "data": [
        "security/ir.model.access.csv",
        "views/menu_views.xml",
        "views/res_config_settings_views.xml",
        "data/ir_cron.xml",
        "views/weather_city_views.xml",
        "views/owl_chart_template.xml",
    ],
    
    'assets': {
            'web.assets_backend': [
                'weather_temperature_ia/static/src/**/*'
            ],
        },
    
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
