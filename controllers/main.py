import logging
from odoo import http
from odoo.http import request, Response
import json

_logger = logging.getLogger('main')


class Main(http.Controller):

    @http.route('/weather_temperature_ia/citya', type='http', auth='public', methods=['POST'], csrf=False)
    def create_city(self, **kw):
        raw = request.httprequest.get_data(as_text=True)

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return Response(json.dumps({'error': 'JSON inválido'}), status=400, mimetype='application/json')

        name = data.get('name')
        if not name:
            return Response(json.dumps({'error': 'Falta el campo "name".'}),
                            status=400, mimetype='application/json')

        city = request.env['weather.city'].sudo().create({'name': name})
        return Response(json.dumps({'id': city.id, 'name': city.name}),
                        status=201, mimetype='application/json')