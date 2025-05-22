# import psycopg2

# conn = psycopg2.connect(
#     dbname="products",
#     user="postgres",
#     password="5409",
#     host="localhost",
#     port="5432"
# )

# cur = conn.cursor()
# cur.execute("SELECT * FROM products WHERE username = 'a';")
# print(cur.fetchall())
# cur.close()
# conn.close()


import psycopg2

# Connect to the PostgreSQL database running in the `order_db` container
conn = psycopg2.connect(
    dbname="orders",          # Matches POSTGRES_DB
    user="postgres",          # Matches POSTGRES_USER
    password="5409",          # Matches POSTGRES_PASSWORD
    host="order_db",          # Use the container name as the hostname
    port="5432"               # Internal Docker port
)

# Create a cursor to execute SQL queries
cur = conn.cursor()

# Execute a query to fetch data
cur.execute("SELECT * FROM orders;")
cur.execute("SELECT * FROM orders WHERE username = 'c';")

print(cur.fetchall())  # Print the query results

# Clean up
cur.close()
conn.close()
