// server.js
import Fastify from 'fastify';
import { Kafka } from 'kafkajs';
import JSONbig from 'json-bigint';


const fastify = Fastify({ logger: true });

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
    req.rawBody = body;
    done(null, body);
});

// Kafka setup
const kafka = new Kafka({ brokers: ['14.225.192.60:9094'] });
const producer = kafka.producer();
await producer.connect();

// Route nhận sự kiện
fastify.post('/webhook/order', async (request, reply) => {
    const event = JSONbig.parse(request.rawBody);
    if (event) {

        const shopId = event.shop_id.toString();
        const orderId = event.data.order_id.toString();

        const message = {
            shopId: shopId,
            orderId: orderId,
            limit: 0
        }
        try {
            await producer.send({
                topic: 'order-details-sync',
                messages: [{
                    key: message.shopId.toString(),
                    value: JSON.stringify(message)
                }],
            });
            reply.code(200).send({ message: 'Event sent to Kafka' });
        } catch (err) {
            request.log.error(err);
            reply.code(500).send({ error: 'Failed to send event' });
        }

    }
});
fastify.post('/webhook/product/change', async (request, reply) => {

    console.log("Received product change webhook:", request.rawBody);
    const event = JSONbig.parse(request.rawBody);

    if (event) {

        const shopId = event.shop_id.toString();
        const productId = event.data.product_id.toString();
        const status = event.data.status.toString();
        const updateTime = event.data.update_time.toString();


        const message = {
            shopId: shopId.toString(),
            productId: productId.toString(),
            event: status.toString(),
            updateTime: updateTime.toString(),
        }
        console.log("Parsed message:", message);
        try {
            await producer.send({
                topic: 'product-sync',
                messages: [{
                    key: message.shopId.toString(),
                    value: JSON.stringify(message)
                }],
            });
            reply.code(200).send({ message: 'Event sent to Kafka' });
        } catch (err) {
            request.log.error(err);
            reply.code(500).send({ error: 'Failed to send event' });
        }
    }
});


// Start server
const PORT = process.env.PORT || 3005;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});