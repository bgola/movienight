#!/usr/bin/env python

import asyncio
import logging
import websockets

logging.basicConfig()

USERS = set()

async def register(client):
    logging.info(f"New user: {client}")
    USERS.add(client)
    await notify_number_users(client)

async def unregister(client):
    USERS.remove(client)
    await notify_number_users(client)

async def notify_users(sender, msg):
    if len(USERS) > 1:  # asyncio.wait doesn't accept an empty list
        logging.info(f"sending: {msg}")
        await asyncio.wait([user.send(msg) for user in USERS if user != sender])

async def notify_number_users(sender):
    msg = f"number:{len(USERS)}"
    if USERS:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(msg) for user in USERS])

async def counter(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            await notify_users(websocket, message)
    finally:
        await unregister(websocket)

try:
    import local_cert_settings
    import ssl
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(
            local_cert_settings.localhost_pem,
            local_cert_settings.privkey_pem)
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(counter, '0.0.0.0', 5678, ssl=ssl_context, max_size=None))
except ImportError:
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(counter, '0.0.0.0', 5678))

asyncio.get_event_loop().run_forever()
