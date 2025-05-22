
const { Kafka, Partitioners } = require('kafkajs')
const { handleProducts } = require('./product_service')

const kafka = new Kafka({
  clientId: 'products-app',
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

const admin = kafka.admin();


// Function to ensure the topic exists
const ensureTopicExists = async (topic) => {
  try {
    await admin.connect(); // Connect to Kafka admin client
    const topics = await admin.listTopics(); // Get list of existing topics

    // Check if the topic exists, if not, create it
    if (!topics.includes(topic)) {
      console.log(`Topic ${topic} does not exist. Creating topic...`);
      await admin.createTopics({
        topics: [{ topic }],
        waitForLeaders: true, // Wait for leader to be assigned
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
  await ensureTopicExists('productsProducer'); // Ensure the topic exists before sending

 await producer.connect()
 await producer.send({
    topic: 'productsProducer',
    messages: [{
        value: JSON.stringify(msg)
    }]
 })

 await producer.disconnect()
}

const consumer = kafka.consumer({
    groupId: "products-group",
    allowAutoTopicCreation: true,
})


const fetchProductsFromOrderTopic = async ()=>{
    try {
      await consumer.connect()
      await consumer.subscribe({topics: ["ordersProducer"]})
  
      await consumer.run({
        eachMessage: async ({message}) => {
          const jsonMsg = JSON.parse(message.value)
          const result = await handleProducts(jsonMsg)
  
          if(result){
            msg = {id: jsonMsg.id , acceptReject: "Accepted"}
            await sendOrders(msg)
          }
  
          if(!result){  
            msg = {id: jsonMsg.id , acceptReject: "Rejected"}
            await sendOrders(msg)
  
          }
  
        }
      })
    } catch (error) {               
      await consumer.disconnect()
      console.log(error.message)
    }
  }

  
setTimeout(async ()=>{
  try {
    await fetchProductsFromOrderTopic()
  } catch (error) {
    console.log(error.message)
  }
},2000)
