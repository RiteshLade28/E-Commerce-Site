import psycopg2
import os

DB_HOST = os.environ["DB_HOST"]
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

def execute_query(query, params=None):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cur = conn.cursor()
        cur.execute(query, params)
        conn.commit()
        data = cur.fetchall()
        print(data)
        print("Query executed successfully")
    except Exception as e:
        print("Error occurred:", e)
    finally:
        if conn is not None:
            conn.close()



create_products_table_query = '''
    CREATE TABLE products (
        productId SERIAL PRIMARY KEY,
        sellerId INTEGER,
        name TEXT,
        newprice REAL,
        oldprice REAL,
        ratings REAL,
        categoryId INTEGER,
        description TEXT,
        stock INTEGER,
        FOREIGN KEY(categoryId) REFERENCES categories(categoryId)
    )
'''

create_users_table_query = '''
    CREATE TABLE users (
        userId SERIAL PRIMARY KEY,
        email TEXT,
        password TEXT,
        salt BYTEA,
        firstName TEXT,
        lastName TEXT,
        address TEXT,
        city TEXT,
        pincode TEXT,
        state TEXT,
        country TEXT
    )
'''

create_categories_table_query = '''CREATE TABLE categories
        (categoryId SERIAL PRIMARY KEY,
        name TEXT
        )'''


create_kart_table_query = '''CREATE TABLE kart
		(userId INTEGER NOT NULL,
        quantity INTEGER,
		productId INTEGER,
		FOREIGN KEY(userId) REFERENCES users(userId),
		FOREIGN KEY(productId) REFERENCES products(productId)
		)'''


create_orders_table_query = '''CREATE TABLE orders
        (orderId SERIAL PRIMARY KEY,
        userId INTEGER,
        paymentId INTEGER,
        FOREIGN KEY(userId) REFERENCES users(userId),
        FOREIGN KEY(paymentId) REFERENCES payments(paymentId)
        )'''

create_orderDetails_table_query = '''CREATE TABLE orderDetails
        (orderDetailsId SERIAL PRIMARY KEY,
        orderId INTEGER,
        productId INTEGER,
        quantity INTEGER,
        price REAL,
        address TEXT,
        landmark TEXT,
        city TEXT,
        pincode TEXT,
        state TEXT,
        country TEXT,
        orderDate TEXT,
        shippingDate TEXT,
        deliveryDate TEXT,
        orderStatus TEXT,
        FOREIGN KEY(productId) REFERENCES products(productId),
        FOREIGN KEY(orderId) REFERENCES orders(orderId)
        )'''

create_payments_table_query = '''CREATE TABLE payments
        (paymentId SERIAL PRIMARY KEY,
        userId INTEGER,
        nameOnCard TEXT,
        cardNumber TEXT,
        expiryDate TEXT,
        cvv TEXT,
        paymentDate TEXT,
        FOREIGN KEY(userId) REFERENCES users(userId)
        )'''

create_sellers_table_query = '''CREATE TABLE sellers
        (sellerId SERIAL PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        password TEXT,
        salt bytea,
        phoneNumber TEXT,
        address TEXT,
        city TEXT,
        pincode TEXT,
        state TEXT,
        country TEXT
        )'''

create_sellerCategory_table_query = '''CREATE TABLE sellerCategory (
        seller_id INT,
        category_id INT,
        FOREIGN KEY (seller_id) REFERENCES sellers(sellerId),
        FOREIGN KEY (category_id) REFERENCES categories(categoryId)
        )'''

create_sellerAccounts_table_query = '''CREATE TABLE sellerAccounts
        (sellerAccountId SERIAL PRIMARY KEY,
        sellerId INTEGER,
        accountNumber TEXT,
        accountHolderName TEXT,
        accountBalance REAL,
        bankName TEXT,
        branchName TEXT,
        ifscCode TEXT,
        FOREIGN KEY(sellerId) REFERENCES sellers(sellerId)        
        )'''


create_productImages_table_query = '''CREATE TABLE productImages
        (productImageId SERIAL PRIMARY KEY,
        productId INTEGER,
        image BYTEA,
        FOREIGN KEY(productId) REFERENCES products(productId)
        )'''

create_productReviews_table_query = '''CREATE TABLE productReviews
        (productReviewId SERIAL PRIMARY KEY,
        productId INTEGER,
        userId INTEGER,
        review TEXT,
        rating REAL,
        FOREIGN KEY(productId) REFERENCES products(productId),
        FOREIGN KEY(userId) REFERENCES users(userId)
        )'''



execute_query('''SELECT * from products''', (1,))




