const pool = require('./dataBaseOrders'); 
const kafka = require('./kafka');
const  kafka_product  = require('../product_service/kafka');

//=================================================================================================================
//=================================================================================================================
// GET an order

const getOrders = async (req, res) => {
    const username = req.params.username;

    try {
        const results = await pool.query('SELECT * FROM orders WHERE username = $1', [username]);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error("Error 0");
        res.status(500).send("Error retrieving order");
        throw error;
    }
};

//=================================================================================================================
//=================================================================================================================
// GET an order by id

const getOrderById = async (req, res) => {

    const id = parseInt(req.params.id);  
    const username = req.params.username;  

    try {
        const results = await pool.query('SELECT * FROM orders WHERE id = $1 AND username = $2', [id, username]);

        if (results.rows.length === 0) {
            return res.status(404).send("Order not found");
        }

        res.status(200).json(results.rows[0]);

    } catch (error) {
        console.error("Error 1");
        res.status(500).send("Error retrieving order");
        throw error;
    }
};

//=================================================================================================================
//=================================================================================================================
// Add an order

// const addOrder = async (req, res) => {
//     const { products, total_price, status } = req.body;
//     const username = req.params.username;  

//     if (!products || !total_price || !status) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     try {
//         const query = 'INSERT INTO orders (products, total_price, status, username) VALUES ($1::json, $2, $3, $4) RETURNING *';
//         const values = [JSON.stringify(products), total_price, status, username]; 

//         pool.query(query, values, (error, results) => {
//             if (error) {
//                 console.error("Error creating order:", error.message);
//                 return res.status(500).json({ error: "Error creating order" });
//             } else {
//                 return res.status(201).json({ message: "Order created successfully" });
//             }
//         });

//         //send to kafka
//         const msg = {
//             id: results[0].insertId,
//             products: products
//         }

//         await kafka.kafkaProducer(msg)


//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error creating order");
//     }
// };


const addOrder = async (req, res) => {

    const { products, total_price, status } = req.body;
    const username = req.params.username;  

    if (!products || !total_price || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const query = `
            INSERT INTO orders (products, total_price, status, username) 
            VALUES ($1::json, $2, $3, $4) 
            RETURNING id, products;
        `;
        const values = [JSON.stringify(products), total_price, status, username]; 

        pool.query(query, values, async (error, results) => {

            if (error) {
                console.error("Error creating order:", error.message);
                return res.status(500).json({ error: "Error creating order" });

            } else {
                const insertedOrder = results.rows[0];

                console.log("Inserted order:", insertedOrder);

                msg = {
                    id: insertedOrder.id,
                    products: insertedOrder.products 
                };

                try {
                    await kafka.kafkaProducer(msg);
                    
                    console.log("VVVVVV sent to Kafka:", msg);

                    // await kafka_product.kafkaConsumer();

                } catch (kafkaError) {
                    console.error("Error sending to Kafka:", kafkaError.message);
                    return res.status(500).json({ error: "Order created but failed to send to Kafka" });
                }

                return res.status(201).json({ message: "Order created successfully", order: insertedOrder });
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).send("Unexpected error occurred while creating the order");
    }
};

//=================================================================================================================
//=================================================================================================================
// Delete an order

const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const username = req.params.username;  

    try {
        await pool.query('DELETE FROM orders WHERE id = $1 AND username = $2', [id, username]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting order");
    }
};
//=================================================================================================================
//=================================================================================================================
// Update Status of an order

const updateOrderStatus = async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;
  
    const validStatuses = ['Accepted', 'Rejected', 'Pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send("Invalid status value");
    }
  
    try {
      pool.query("SELECT * FROM orders WHERE id = $1", [id], (error, results) => {
        if (error) {
          console.error("Error querying orders table:", error);
          return res.status(500).send("Error checking order");
        }
  
        if (results.rows.length === 0) {
          return res.status(404).send("Order not found, nothing updated");
        }
  
        pool.query("UPDATE orders SET status = $2 WHERE id = $1", [id, status], (updateError) => {

            if (updateError) {
              console.error("Error updating order:", updateError);
              return res.status(500).send("Error updating order");
            }

            res.status(200).send("Order status updated successfully");
          }
        );
      });
      
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).send("An unexpected error occurred");
    }
  };
  
module.exports = {getOrders, getOrderById, addOrder, deleteOrder, updateOrderStatus};
