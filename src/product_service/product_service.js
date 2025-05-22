// API
const pool = require('./database')
const path = require('path'); 
const fetch = require('node-fetch');

const fs = require('fs');


//=================================================================================================================
//=================================================================================================================
// POST a product

const addProduct = async (req, res) => {

    const { title, img, price, quantity } = req.body;
    const username = req.params.username;


    if (!username || !title || !img || !price || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const localImagePath = path.join(__dirname, '../../frontend', img);


    if (!fs.existsSync(localImagePath)) {

        try {
            const imageResponse = await fetch(img);
    
            if (imageResponse.status === 404 || !imageResponse.ok) {
                return res.status(404).json({ error: "Image not found" });
            }
    
            pool.query("SELECT * FROM products WHERE img = $1", [img], (error, results) => {
    
                if (error) {
                    console.error("Error checking image:", error.message);
                    return res.status(500).json({ error: "Error checking product" });

                } else if (results.rows.length != 0) {
                    return res.status(409).json({ error: "Image already exists" });

                } else {
                    pool.query(
                        "INSERT INTO products (title, img, price, quantity, username) VALUES ($1, $2, $3, $4, $5)", 
                        [title, img, price, quantity, username], (error) => {
                            if (error) {
                                console.error("Error creating product:", error.message);
                                return res.status(500).json({ error: "Error creating product" });
                            } else {
                                return res.status(201).json({ message: "Product created successfully" });
                            }
                        }
                    );
                }
            });
        } catch (error) {
    
            return res.status(404).json({ error: "Image not found. Please enter a URL to an image or use the project directory my_project/frontend, for accessing the image locally" });
        }
    }

    else{

    pool.query("SELECT * FROM products WHERE img = $1", [img], (error, results) => {

        if (error) {
            return res.status(500).json({ error: "Error checking product" });
        } else if (results.rows.length !== 0) {
            return res.status(409).json({ error: "Image already exists" });
        } else {
            pool.query(
                "INSERT INTO products (title, img, price, quantity, username) VALUES ($1, $2, $3, $4, $5)", 
                [title, img, price, quantity, username], (error) => {
                    if (error) {
                        return res.status(500).json({ error: "Error creating product" });
                    } else {
                        return res.status(201).json({ message: "Product created successfully" });
                    }
                }
            );
        }
    });
}

};

//=================================================================================================================
//=================================================================================================================
// GET a product

const getAllProducts = (req,res) => {

    pool.query("SELECT * FROM products", (error,results) => {

        if (error) {
            console.error("Error 0");
            throw error;
        } else if (results.rows.length == 0) {
            res.status(404).send("Product Database is empty");

        } else{
            res.status(200).json(results.rows);
        }
    })
}

//=================================================================================================================
//=================================================================================================================
// GET specific id

const getAllProductsById = (req, res) => {

    const id = parseInt(req.params.param);  

    pool.query("SELECT * FROM products WHERE id = $1", [id], (error, results) => {

        if (error) {

            console.error("Error while querying the database:", error);
            return res.status(500).send("Internal server error");

        } else if (results.rows.length === 0) {
        
            console.log("Product not found")
            return res.status(404).send("Product not found");

        } else {
            return res.status(200).json(results.rows);

        }
    });
};

//=================================================================================================================
//=================================================================================================================
// GET specific title 

const getAllProductsByTitle = (req, res) => {
    const title = req.params.param;

    pool.query("SELECT * FROM products WHERE title ILIKE $1", [`${title}%`], (error, results) => {
        if (error) {
            console.error("Error while querying the database:", error);

            return res.status(500).send("Internal server error");

        } else if (results.rows.length === 0) {

            return res.status(404).send("Product not found");

        } else {

            return res.status(200).json(results.rows);
        }
    });
};




//=================================================================================================================
//=================================================================================================================
// UPDATE all product

const updateAllProduct = (req, res) => {

    const id = parseInt(req.params.id);  

    pool.query("SELECT * FROM products WHERE id = $1", [id], (error, results) => {

        if (error) {
            console.error("Error 6");
            res.status(500).send("Error checking product");

        } else if (results.rows.length == 0) {
            res.status(404).send("Product not found, nothing updated");

        } else if (results.rows.length != 0) {

            const { title, img, price, quantity } = req.body; 

            let updates = [];
            let values = [];
            let valueIndex = 1;
            if (title) {
                updates.push(`title = $${valueIndex}`);
                values.push(title);
                valueIndex++;
            }
            if (img) {
                updates.push(`img = $${valueIndex}`);
                values.push(img);
                valueIndex++;
            }
            if (price) {
                updates.push(`price = $${valueIndex}`);
                values.push(price);
                valueIndex++;
            }
        
            if (quantity !== undefined) {
                updates.push(`quantity = $${valueIndex}`);
                values.push(quantity);
                valueIndex++;
            }
            if (updates.length === 0) {
                return res.status(400).send("No fields provided for update");
            }
        
            values.push(id);
        
            const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${valueIndex} `; 
        
            pool.query(query, values, (error, results) => {
                if (error) {
                    console.error("Error updating product", error);
                    res.status(500).send("Error updating product");
                } 
                else {
                    
                    res.status(200).send("Product updated");
                }
            });
        }
    });

};

//=================================================================================================================
//=================================================================================================================
// GET a product

const getProducts = (req, res) => {
    // Extract the 'username' from the URL parameters
    const username = req.params.username;

    // Query the database for products that match the username
    pool.query("SELECT * FROM products WHERE username = $1", [username], (error, results) => { // WHERE username = $1", [username]

        if (error) {
            // Handle any error that occurs during the database query
            console.error("Error while querying products: ", error);
            return res.status(500).send("Internal Server Error");
        }

        if (results.rows.length === 0) {
            // If no products were found for the given username
            return res.status(404).send("No products found for this username");
        } else {
            // If products are found, return them as a JSON response
            return res.status(200).json(results.rows);
        }
    });
};



//=================================================================================================================
//=================================================================================================================
// GET specific id

const getProductsById = (req, res) => {

    const id = parseInt(req.params.param);  
    const username = req.params.username;  

    pool.query("SELECT * FROM products WHERE id = $1 AND username = $2", [id , username], (error, results) => {

        if (error) {

            console.error("Error while querying the database:", error);
            return res.status(500).send("Internal server error");

        } else if (results.rows.length === 0) {
        
            console.log("Product not found")
            return res.status(404).send("Product not found");

        } else {
            return res.status(200).json(results.rows);

        }
    });
};

//=================================================================================================================
//=================================================================================================================
// GET specific title 

const getProductsByTitle = (req, res) => {

    const title = req.params.param;
    const username = req.params.username;  

    pool.query("SELECT * FROM products WHERE title ILIKE $1 AND username = $2", [`${title}%` , username], (error, results) => {
        if (error) {
            console.error("Error while querying the database:", error);

            return res.status(500).send("Internal server error");

        } else if (results.rows.length === 0) {

            return res.status(404).send("Product not found");

        } else {

            return res.status(200).json(results.rows);
        }
    });
};

//=================================================================================================================
//=================================================================================================================
// UPDATE a product

const updateProduct = (req, res) => {

    const id = parseInt(req.params.id);  
    const username = req.params.username;  

    pool.query("SELECT * FROM products WHERE id = $1 AND username = $2", [id, username], (error, results) => {

        if (error) {
            console.error("Error 6");
            res.status(500).send("Error checking product");

        } else if (results.rows.length == 0) {
            res.status(404).send("Product not found, nothing updated");

        } else if (results.rows.length != 0) {

            const { title, img, price, quantity } = req.body; 

            let updates = [];
            let values = [];
            let valueIndex = 1;
            if (title) {
                updates.push(`title = $${valueIndex}`);
                values.push(title);
                valueIndex++;
            }
            if (img) {
                updates.push(`img = $${valueIndex}`);
                values.push(img);
                valueIndex++;
            }
            if (price) {
                updates.push(`price = $${valueIndex}`);
                values.push(price);
                valueIndex++;
            }
        
            if (quantity !== undefined) {
                updates.push(`quantity = $${valueIndex}`);
                values.push(quantity);
                valueIndex++;
            }
            if (updates.length === 0) {
                return res.status(400).send("No fields provided for update");
            }
        
            values.push(id);
        
            const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${valueIndex} `; 
        
            pool.query(query, values, (error, results) => {
                if (error) {
                    console.error("Error updating product", error);
                    res.status(500).send("Error updating product");
                } 
                else {
                    
                    res.status(200).send("Product updated");
                }
            });
        }
    });

};


//=================================================================================================================
//=================================================================================================================
// DELETE a product

const deleteProduct = (req, res) => {

    const id = parseInt(req.params.id);

    pool.query("SELECT * FROM products WHERE id = $1", [id], (error, results) => {

        if (error) {
            console.error("Error 6");
            res.status(500).send("Error checking product");

        } else if (results.rows.length == 0) {
            res.status(404).send("Product not found, nothing deleted");

        } else if (results.rows.length != 0) {

            pool.query("DELETE FROM products WHERE id = $1", [id], (error, results) => {

                if (error) {
                    console.error("Error deleting product");
                    res.status(500).send("Error deleting product");
                    throw error;

                } else {
                    res.status(200).send(`Product deleted successfully`);
                }
            });

        }
    });

};

//=================================================================================================================
//=================================================================================================================

const handleProducts = async (orders) => {
    try {
      const db = await pool;
  
      // Check if product amounts are greater than 0
      for await (const obj of orders.products) {
        const { rows } = await db.query("SELECT * FROM products WHERE id = $1", [obj.product_id]);
  
        console.log("Product Data: ", rows);
  
        if (rows.length === 0) {
          console.error(`Product with ID ${obj.product_id} not found.`);
          return false; // Product not found
        }
  
        const quantity = rows[0].quantity; // Access the `quantity` from the result
        console.log("Available Quantity: ", quantity);
  
        if (quantity && quantity < obj.amount) {
          console.log(`Insufficient quantity for Product ID: ${obj.product_id}`);
          return false; // Insufficient stock
        }
      }
  
      
      for await (const obj of orders.products) {
        const { rows } = await db.query("SELECT * FROM products WHERE id = $1", [obj.product_id]);
  
        if (rows.length === 0) {
          console.error(`Product with ID ${obj.product_id} not found for update.`);
          return false;
        }
  
        const currentQuantity = rows[0].quantity;
        const newQuantity = currentQuantity - obj.amount;
  
        await db.query("UPDATE products SET quantity = $1 WHERE id = $2", [newQuantity, obj.product_id]);
        console.log(`Updated Product ID ${obj.product_id} to new quantity: ${newQuantity}`);
      }
  
      return true; 
      
    } catch (error) {
      console.error("Error in handleProducts:", error.message);
      throw error;
    }
  };


// const handleProducts = async (orders) => {
//     try {
//         let isValidOrder = true;

//         for (const obj of orders.products) {

//             if (!obj.product_id) {
//                 console.log("Invalid product_id");
//                 continue; // Skip this product if the ID is invalid
//             }

//             // Query to fetch product data by product_id
//             const product = await new Promise((resolve, reject) => {
//                 pool.query("SELECT * FROM products WHERE id = $1", [obj.product_id], (error, results) => {
//                     if (error) {
//                         console.error("Error in database query:", error.message);
//                         reject(error); // Reject the promise on error
//                     }
//                     resolve(results.rows[0]); // Resolve with the product result
//                 });
//             });

//             // If product not found or insufficient stock
//             if (!product) {
//                 console.log("No product found for ID:", obj.product_id);
//                 isValidOrder = false;
//                 break; // Stop processing if any product is invalid
//             }

//             const quantity = product.quantity;
//             console.log("=======AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
//             console.log("Product quantity:", quantity);
//             console.log("Product Purchase:", obj.amount);
//             console.log("======================================================");

//             if (quantity < obj.amount) {
//                 console.log("Not enough stock for product ID:", obj.product_id);
//                 isValidOrder = false;
//                 break; // Stop processing if not enough stock
//             }

//             // Update product quantity logic
//             const newQuantity = quantity - obj.amount;
//             await new Promise((resolve, reject) => {
//                 pool.query("UPDATE products SET quantity = $1 WHERE id = $2", [newQuantity, obj.product_id], (updateError) => {
//                     if (updateError) {
//                         console.error("Error updating product quantity:", updateError.message);
//                         reject(updateError); // Reject the promise if update fails
//                     }
//                     console.log("Updated product quantity for ID:", obj.product_id);
//                     resolve(); // Resolve when update is successful
//                 });
//             });
//         }

//         // Return the validation result
//         return isValidOrder;

//     } catch (error) {
//         console.log("Error:", error.message);
//         throw new Error(error);
//     }
// };


// const handleProducts = async (orders) => {
//     try {
//       const db = await pool;
  
//       for (const obj of orders.products) {
//         if (!obj.product_id) {
//           console.error("Invalid product_id:", obj.product_id);
//           return false;
//         }
  
//         console.log("Fetching product details for ID:", obj.product_id);
  
//         // Correct PostgreSQL parameterized query
//         const { rows } = await db.query(
//           "SELECT * FROM products WHERE id = $1",
//           [obj.product_id]
//         );
  
//         if (!rows || rows.length === 0) {
//           console.error("Product not found for ID:", obj.product_id);
//           return false; // Product not found
//         }
  
//         const quantity = rows[0].quantity;
//         if (quantity < obj.amount) {
//           console.error("Insufficient stock for product ID:", obj.product_id);
//           return false; // Insufficient stock
//         }
//       }
  
//       // Update product quantities
//       for (const obj of orders.products) {
//         const { rows } = await db.query(
//           "SELECT * FROM products WHERE id = $1",
//           [obj.product_id]
//         );
//         const newQuantity = rows[0].quantity - obj.amount;
  
//         await db.query(
//           "UPDATE products SET quantity = $1 WHERE id = $2",
//           [newQuantity, obj.product_id]
//         );
  
//         console.log("Updated quantity for product ID:", obj.product_id);
//       }
  
//       return true;
//     } catch (error) {
//       console.error("Error in handleProducts:", error.message);
//       throw error;
//     }
//   };

//=================================================================================================================
//=================================================================================================================

module.exports = {addProduct, getAllProducts, getAllProductsById , getAllProductsByTitle, updateAllProduct, 
                  getProducts, getProductsById , getProductsByTitle, updateProduct, deleteProduct, handleProducts};    

//=================================================================================================================
//=================================================================================================================
