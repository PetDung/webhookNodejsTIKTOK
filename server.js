// server.js
import Fastify from 'fastify';
import { Kafka } from 'kafkajs';

const fastify = Fastify({ logger: true });

// Kafka setup
const kafka = new Kafka({ brokers: ['14.225.192.60:9094'] });
const producer = kafka.producer();
await producer.connect();

// Route nhận sự kiện
fastify.post('/webhook/order', async (request, reply) => {
    const event = request.body;
    if (event) {

        const shopId = event.shop_id;
        const orderId = event.data.order_id;

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
  const event = request.body;
  if (event) {

        const shopId = event.shop_id;
        const productId = event.data.product_id;
        const status = event.data.status; 
        const updateTime = event.data.update_time;


        const message = {
            shopId: shopId.toString(),
            productId: productId.toString(),
            event: status,
            updateTime: updateTime.toString(),
        }
        console.log("Received product change event:", message);
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
