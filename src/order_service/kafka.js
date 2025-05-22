
const { Kafka, Partitioners } = require('kafkajs')
const pool = require('./dataBaseOrders'); 

const kafka = new Kafka({
  clientId: 'order-app',
  brokers: ['kafka:19092'],
  retry: {
    initialRetryTime: 2000,
    retries: 5
  }
})

const producer = kafka.producer({
    allowAutoTopicCreation: true,
    createPartitioner: Partitioners.LegacyPartitioner
})

const admin = kafka.admin(); // Admin client to manage Kafka topics

// Function to check and create the topic if it doesn't exist
const ensureTopicExists = async (topic) => {
  try {
    await admin.connect(); // Connect to Kafka admin client
    const topics = await admin.listTopics(); // Get list of existing topics
    
    if (!topics.includes(topic)) {
      console.log(`Topic ${topic} does not exist. Creating topic...`);
      
      // Create topic if it doesn't exist
      await admin.createTopics({
        topics: [{ topic }],
        waitForLeaders: true,
      });
      
      console.log(`Topic ${topic} created successfully.`);
    } else {
      console.log(`Topic ${topic} already exists.`);
    }
  } catch (error) {
    console.error(`Error ensuring topic exists: ${error.message}`);
  } finally {
    await admin.disconnect(); // Disconnect admin client
  }
};



const sendOrders = async (msg)=>{
  await ensureTopicExists('ordersProducer'); // Ensure the topic exists before sending

 await producer.connect()
 await producer.send({
    topic: 'ordersProducer',
    messages: [{
        value: JSON.stringify(msg)
    }]
 })

 await producer.disconnect()
}

const statusConsumer = kafka.consumer({
  groupId: 'order-status-group', // Group for consuming from productsProducer
  allowAutoTopicCreation: true,
});


const listenToOrderStatus = async () => {
  try {
    await statusConsumer.connect();
    await statusConsumer.subscribe({ topics: ['productsProducer'] });

    await statusConsumer.run({
      eachMessage: async ({ message }) => {
        const jsonMsg = JSON.parse(message.value);
        console.log('Order Status Received:', jsonMsg);

        const { id, acceptReject } = jsonMsg;

        try {
          const db = await pool;
          const results = await db.query("UPDATE orders SET status = $2 WHERE id = $1", [id, acceptReject]);

          // const results = await pool.query("UPDATE orders SET status = $2 WHERE id = $1", [id, acceptReject]);
          console.log(`Order ID: ${id} status updated to ${acceptReject}`);
        } catch (error) {
          console.error(`Error updating status for Order ID: ${id}`, error);
        }
      },
    });
  } catch (error) {
    console.error('Error in status consumer:', error.message);
  }
};



setTimeout(async () => {
  try {
    await listenToOrderStatus();
  } catch (error) {
    console.log(error.message);
  }
}, 2000);


module.exports = {
    kafkaProducer: sendOrders
}
