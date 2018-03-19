from sanic import response
import aio_pika
import aioredis
import asyncio
import uuid
from . import Veil as bp
from .chat import OP_CODES
from .match import discover, add_to_discovery, remove_from_discovery
import base64
import itsdangerous
import geoip2.database
import json

s = itsdangerous.Signer('mysecretkeyboi')

def validate_token(token):
    guid = s.unsign(token).decode('utf-8')
    return guid

@bp.route('/auth', methods=['GET', 'OPTIONS'])
async def get_token(request):
    guid = str(uuid.uuid4()).encode('utf-8')
    token = s.sign(guid).decode('utf-8')
    out = response.json(None, status=200)
    out.cookies['token'] = token
    return out

async def read_messages(queue, ws):
    async for message in queue:
        with message.process():
            if not ws.open:
                return

            msg = json.loads(message.body.decode())
            if OP_CODES(msg['op']) == OP_CODES.CHAT:
                await ws.send(json.dumps({
                    'op': OP_CODES.CHAT.value,
                    'text': msg['text']
                }))
            elif OP_CODES(msg['op']) == OP_CODES.LEAVE:
                await ws.close()
                return

async def send_messages(exchange, ws, sendto):
    while ws.open:
        msg = await ws.recv()
        await exchange.publish(
            aio_pika.Message(body=json.dumps({
                'op': OP_CODES.CHAT.value,
                'text': msg
            }).encode()), 
            routing_key=sendto
        )
    else:
        await exchange.publish(
            aio_pika.Message(body=json.dumps({
                'op': OP_CODES.LEAVE.value
            }).encode()), 
            routing_key=sendto
        )
    
@bp.websocket('/')
async def chat(request, ws):
    app = request.app
    guid = validate_token(str(request.cookies['token']))
    # create UUID associated with this session
    ip = request.cookies.get("r")
    print(ip)
    geoip_reader = geoip2.database.Reader(app.config['GEOIP_PATH'])
    geo_response = geoip_reader.city(ip)
        
    data = await asyncio.gather(
        discover(app, guid),
        add_to_discovery(app, guid, latitude=geo_response.location.latitude, longitude=geo_response.location.longitude),
    )
    send_to = data[0]
    print(f"Found match {guid} -> {send_to}")
    await ws.send(json.dumps({
        'op': OP_CODES.JOIN.value
    }))

    connection = await aio_pika.connect_robust(
        app.config.AMQP_URL, loop=app.loop
    )
    # listen for messages to yourself
    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange('veil', aio_pika.ExchangeType.DIRECT)
        queue = await channel.declare_queue(guid, auto_delete=True)
        await queue.bind(exchange, routing_key=guid)
        
        await asyncio.gather(
            read_messages(queue, ws),
            send_messages(exchange, ws, send_to)
        )
