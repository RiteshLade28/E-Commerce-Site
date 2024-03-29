from markupsafe import escape
import sqlite3
from flask import Flask, abort, render_template, make_response, jsonify, request
from flask_cors import CORS
import traceback
import jwt
import bcrypt
from functools import wraps
from datetime import datetime, timedelta
import itertools
import random
import psycopg2
import os


app = Flask(__name__)
CORS(app)


route = "/api"
authRoute = "/api/auth"
app.config['SECRET_KEY'] = 'secret'

DB_HOST = os.environ["DB_HOST"]
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]




def execute_query(query, params=None, no_return=False):
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cur = conn.cursor()

    if no_return:
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)
        conn.commit()
        conn.close()
    else:
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)
        data = cur.fetchall()
        conn.commit()
        conn.close()
        return data



def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(' ')[1]  # Extract the token from the header

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Verify and decode the token using your secret key
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data  # Set current_user to the decoded data

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        # Pass current_user as an argument to the decorated function
        return f(*args, current_user=current_user, **kwargs)

    return decorated


@app.route(authRoute + "/signup", methods=["OPTIONS"])
def handleSignupOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    firstname = data.get('firstName')
    lastname = data.get('lastName')
    email = data.get('email')
    password = data.get('password')
    address = data.get('address')
    city = data.get('city')
    pincode = data.get('pincode')
    state = data.get('state')
    country = data.get('country')

    print(firstname, lastname, email, password, address, city, pincode, state, country)

    email_exists = execute_query("SELECT email FROM users WHERE email = %s", (email,))
    if email_exists:
        return jsonify({"message": "Email already exists"}), 400

    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Insert the user data into the database
    insert_query = "INSERT INTO users (firstname, lastname, email, password, salt, address, city, pincode, state, country) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

    execute_query(insert_query, (firstname, lastname, email, hashed_password, salt, address, city, pincode, state, country), no_return=True)
    return jsonify({"message": "Signup successful"}), 201


@app.route(authRoute + "/login/", methods=["OPTIONS"])
def handleLoginOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route('/api/auth/login/', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = execute_query("SELECT * FROM users WHERE email = %s", (email,))
    print(user)
    if not user:
        return jsonify({"message": "Invalid credentials"}), 400
    else:
        user = user[0]  # Get the first row from the result
        db_password = user[2]  # Assuming password hash is stored in the 4th column
        salt = user[3]  # Assuming salt is stored in the 6th column

        salt_bytes = bytes(salt)
        print(user[4])

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt_bytes)

        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            expiry = datetime.utcnow() + timedelta(days=1)
            payload = {
                'email': email,
                'exp': expiry,
                "userId": user[0],
                "email": email
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({"token": token, "userId": user[0], "email": email, "firstName": user[4], "lastName": user[5]}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 400


@app.route("/api/chechauth", methods=["OPTIONS"])
def handleCheckAuthOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route('/api/checkauth', methods=['GET'])
@token_required
def checkAuth(current_user):
    return jsonify({"message": "You are authorized"}), 200


@app.route(route + '/products/',  methods=["OPTIONS"])
# @token_required
def handleProductsAuthOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route(route + '/products/', methods=['GET'])
# @token_required
def getProducts():
    productId = request.args.get('id')
    userId = request.headers.get('userId')

    print(productId)

    if productId != '{id}':
        try:
            itemData = execute_query(
                '''
                SELECT p.productId, p.name, p.newPrice, p.oldPrice, p.ratings, p.description, c.categoryId, c.name 
                FROM products p 
                INNER JOIN categories c ON p.categoryId = c.categoryId 
                WHERE p.productId = %s;
                ''',
                (productId,),
            )

            if itemData:
                productId, name, newPrice, oldPrice, ratings, description, categoryId, categoryName = itemData[0]

                images = execute_query(
                    '''
                    SELECT image FROM productImages WHERE productId = %s;
                    ''',
                    (productId,),
                )

                image_list = [bytes(image[0]).decode('utf-8') for image in images]

                if userId:
                    review = execute_query(
                        '''
                        SELECT * FROM productReviews WHERE productId = %s AND userId = %s;
                        ''',
                        (productId, userId),
                    )
                    if review:
                        userReview = review[0][3]
                        userRating = review[0][4]
                    else:
                        userReview = None
                        userRating = None
                else:
                    userReview = None
                    userRating = None

                ratings_result = execute_query(
                    '''
                    SELECT AVG(rating) FROM productReviews WHERE productId = %s;
                    ''',
                    (productId,),
                )
                ratings = ratings_result[0][0]

                reviews = execute_query(
                    '''
                    SELECT u.firstName, u.lastName, r.rating, r.review 
                    FROM productReviews r 
                    JOIN users u ON r.userId = u.userId 
                    WHERE productId = %s;
                    ''',
                    (productId,),
                )

                product = {
                    'productId': productId,
                    'categoryId': categoryId,
                    'categoryName': categoryName,
                    'name': name,
                    'newPrice': newPrice,
                    'oldPrice': oldPrice,
                    'ratings': ratings,
                    'description': description,
                    'images': image_list,
                    'reviews': reviews,
                    'userReview': userReview,
                    'userRating': userRating,
                }

                categoryData = execute_query(
                    '''
                    SELECT DISTINCT ON (p.productId)
                        p.productId,
                        p.name,
                        p.newPrice,
                        p.oldPrice,
                        p.categoryId,
                        i.image
                    FROM products p
                    JOIN (
                        SELECT DISTINCT ON (productId) 
                            productId,
                            image
                        FROM productImages
                        ORDER BY productId, image 
                    ) i ON p.productId = i.productId
                    WHERE p.categoryId = %s;    
                    ''',
                    (categoryId,),
                )

                # print(categoryData)

                relatedProducts = []
                for item in categoryData:
                    productId, name, newPrice, oldPrice, categoryId, image = item
                    relatedProducts.append({
                        'productId': productId,
                        'categoryId': categoryId,
                        'newPrice': newPrice,
                        'oldPrice': oldPrice,
                        'name': name,
                        'image': bytes(image).decode('utf-8'),
                    })

                return jsonify([product, categoryName, relatedProducts])

        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "An error occurred."}), 500

    try:
        # Retrieve product data with images from PostgreSQL
        query_product_data = '''
            SELECT DISTINCT p.productId, p.name, p.newPrice, p.oldPrice, c.categoryId, c.name, i.image AS categoryName
            FROM products AS p JOIN (
                        SELECT DISTINCT ON (productId) 
                            productId,
                            image
                        FROM productImages
                        ORDER BY productId, image 
                    ) as i ON p.productId = i.productId
            INNER JOIN categories AS c ON p.categoryId = c.categoryId

        '''
        itemData = execute_query(query_product_data)
        # print(itemData)

        categoryData = {}
        for item in itemData:
            productId, name, newPrice, oldPrice, categoryId, categoryName, image = item
            # Convert the image binary data to bytes
            if image is not None:
                image = bytes(image).decode('utf-8')

            if categoryId not in categoryData:
                categoryData[categoryId] = {'categoryName': categoryName, 'products': []}

            categoryData[categoryId]['products'].append({
                'productId': productId,
                'categoryId': categoryId,
                'name': name,
                'newPrice': newPrice,
                'oldPrice': oldPrice,
                'image': image,
            })

        # print(categoryData)

        formattedData = []
        for categoryId, categoryInfo in categoryData.items():
            formattedData.append({
                'categoryId': categoryId,
                'categoryName': categoryInfo['categoryName'],
                'products': categoryInfo['products'],
            })

    

        return jsonify(formattedData)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)




@app.route(route + "/cartItems/", methods=["OPTIONS"])
def handleCartItemsOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + '/cartItems/')
@token_required
def cartItems(current_user):
    userId = current_user['userId']
    query = """
    SELECT products.productId, products.name, products.newPrice, productImages.image, categories.name, kart.quantity
    FROM users
    JOIN kart ON users.userId = kart.userId
    JOIN products ON products.productId = kart.productId
    JOIN categories ON products.categoryId = categories.categoryId
    JOIN productImages ON products.productId = productImages.productId
    WHERE users.userId = %s
    LIMIT 1
    """

    products = execute_query(query, (userId,))

    totalPrice = 0
    totalItems = 0
    formattedData = []

    for item in products:
        productId, name, price, image, categoryName, quantity = item
        totalPrice += price * quantity
        totalItems += quantity

        formattedData.append({
            'productId': productId,
            'name': name,
            'price': price,
            'image': bytes(image).decode('utf-8'),
            'category': categoryName,
            'quantity': quantity
        })

    response = {
        'formattedData': formattedData,
        'totalPrice': totalPrice,
        'totalItems': totalItems
    }

    print("items " + str(totalItems))
    return jsonify(response)

@app.route(route + "/cartItems/", methods=["DELETE"])
@token_required
def clearCart(current_user):
    userId = current_user['userId']
    query = "DELETE FROM kart WHERE userId = %s"

    try:
        execute_query(query, (userId,))
        msg = "Cart cleared successfully"
        status_code = 200
    except Exception as e:
        msg = "Error occurred"
        status_code = 500
        traceback.print_exc()

    return make_response(msg, status_code)

@app.route(route + "/cartItem", methods=["OPTIONS"])
def handleCartItemOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route(route + "/cartItem", methods=["POST"])
@token_required
def addToCart(current_user):
    productId = request.args.get('id')
    userId = current_user['userId']  # Extract userId from the decoded token

    query_select = "SELECT productId, quantity FROM kart WHERE productId = %s AND userId = %s"
    query_insert = "INSERT INTO kart (userId, productId, quantity) VALUES (%s, %s, %s)"
    query_update = "UPDATE kart SET quantity = %s WHERE productId = %s AND userId = %s"

    existing_product = execute_query(query_select, (productId, userId))

    try:
        if existing_product:
            # If the product already exists, update the quantity by 1
            new_quantity = existing_product[0][1] + 1
            execute_query(query_update, (new_quantity, productId, userId))
            msg = "Quantity updated successfully"
        else:
            # If the product doesn't exist, add a new entry with quantity 1 for the current user
            execute_query(query_insert, (userId, productId, 1), no_return=True)
            msg = "Added successfully"

        status_code = 200
    except Exception as e:
        msg = "Error occurred"
        status_code = 500
        traceback.print_exc()  # Print the traceback for debugging purposes

    return make_response(msg, status_code)


@app.route(route + "/cartItem", methods=["DELETE"])    
@token_required
def removeFromCart(current_user):
    productId = request.args.get('id')

    query = "DELETE FROM kart WHERE productId = %s"

    try:
        execute_query(query, (productId,), no_return=True)
        msg = "Removed successfully"
        status_code = 200
    except Exception as e:
        msg = "Error occurred"
        status_code = 500
        traceback.print_exc()

    return make_response(msg, status_code)

@app.route(route + "/cartItem", methods=["PATCH"])
@token_required
def updateQuantity(current_user):
    productId = request.args.get('id')
    new_quantity = request.headers.get('quantity')

    query_update = "UPDATE kart SET quantity = %s WHERE productId = %s"
    query_select = """
        SELECT products.productId, products.name, products.newPrice, categories.name, kart.quantity
        FROM products
        JOIN kart ON kart.productId = products.productId
        JOIN categories ON products.categoryId = categories.categoryId
        WHERE kart.productId = %s
    """

    try:
        execute_query(query_update, (new_quantity, productId), no_return=True)
        msg = "Quantity updated successfully"

        # Fetch the updated product data
        product = execute_query(query_select, (productId,))
        status_code = 200
    except Exception as e:
        msg = "Error occurred"
        product = []
        status_code = 500
        traceback.print_exc()  # Print the traceback for debugging purposes

    return make_response(jsonify(product=product, message=msg), status_code)


@app.route(route + '/orders/',  methods=["OPTIONS"])
# @token_required
def handleOrdersAuthOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + "/orders/", methods=["POST"])
@token_required
def placeOrder(current_user):
    data = request.json
    orderPayment = data["orderPayment"]
    orderAddress = data["orderAddress"]
    productId = request.args.get('id')
    userId = current_user['userId']  # Extract userId from the decoded token

    query_fetch_product_price = "SELECT newPrice FROM products WHERE productId = %s"
    query_insert_payment = """
        INSERT INTO payments (userId, nameOnCard, cardNumber, expiryDate, cvv, paymentDate)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING paymentId
    """
    query_insert_order = "INSERT INTO orders (userId, paymentId) VALUES (%s, %s) RETURNING orderId"
    query_insert_order_details = """
        INSERT INTO orderDetails (orderId, productId, quantity, price, address, landmark, city, pincode, state, country, orderDate, orderStatus)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    try:
        # Fetch the product price
        product_price = execute_query(query_fetch_product_price, (productId,))
        price = product_price[0][0] if product_price else None

        if price is None:
            return jsonify({"msg": "Invalid product ID"}), 400

        # Insert into payments table and get the generated payment ID
        payment_data = (
            userId,
            orderPayment['cardName'],
            orderPayment['cardNumber'],
            orderPayment['expDate'],
            orderPayment['cvv'],
            datetime.now()
        )
        payment_id = execute_query(query_insert_payment, payment_data)[0][0]

        # Insert into orders table and get the ID of the inserted order
        order_data = (userId, payment_id)
        order_id = execute_query(query_insert_order, order_data)[0][0]

        # Insert into orderDetails table
        quantity = 1
        order_details_data = (
            order_id,
            productId,
            quantity,
            price,
            orderAddress['address'],
            orderAddress['landmark'],
            orderAddress['city'],
            orderAddress['pinCode'],
            orderAddress['state'],
            orderAddress['country'],
            datetime.now(),
            "Order Placed"
        )
        execute_query(query_insert_order_details, order_details_data, no_return=True)

        msg = "Order placed successfully"
        status_code = 200
    except Exception as e:
        msg = "Error occurred: " + str(e)
        status_code = 500
        traceback.print_exc()

    return jsonify({"orderId": order_id, "msg": msg}), status_code

@app.route(route + '/orders/cart/',  methods=["OPTIONS"])
# @token_required
def handleOrdersCartAuthOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + "/orders/cart/", methods=["POST"])
@token_required
def placeOrderFromCart(current_user):
    # Retrieve cart data from the request
    data = request.json
    orderPayment = data["orderPayment"]
    orderAddress = data["orderAddress"]
    userId = current_user['userId'] 

    query_insert_payment = """
        INSERT INTO payments (userId, nameOnCard, cardNumber, expiryDate, cvv, paymentDate)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING paymentId
    """
    query_fetch_cart_items = """
        SELECT p.productId, k.quantity, p.newPrice
        FROM kart AS k
        JOIN products AS p ON k.productId = p.productId
        WHERE userId = %s
    """
    query_insert_order = "INSERT INTO orders (userId, paymentId) VALUES (%s, %s) RETURNING orderId"
    query_insert_order_details = """
        INSERT INTO orderDetails (orderId, productId, quantity, price, address, landmark, city, pincode, state, country, orderDate, orderStatus)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    with psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    ) as conn:
        cur = conn.cursor()
        try:
            # Insert into payments table and get the generated payment ID
            payment_data = (
                userId,
                orderPayment['cardName'],
                orderPayment['cardNumber'],
                orderPayment['expDate'],
                orderPayment['cvv'],
                datetime.now()
            )
            payment_id = execute_query(query_insert_payment, payment_data)[0][0]

            # Fetch the cart items for the current user
            cart_items = execute_query(query_fetch_cart_items, (userId,))

            # Insert into orders table and get the ID of the inserted order
            order_data = (userId, payment_id)
            order_id = execute_query(query_insert_order, order_data)[0][0]

            for item in cart_items:
                productId, quantity, price = item
                order_details_data = (
                    order_id,
                    productId,
                    quantity,
                    price,
                    orderAddress['address'],
                    orderAddress['landmark'],
                    orderAddress['city'],
                    orderAddress['pinCode'],
                    orderAddress['state'],
                    orderAddress['country'],
                    datetime.now(),
                    "Order Placed"
                )
                execute_query(query_insert_order_details, order_details_data)

            conn.commit()
            status_code = 200
            msg = "Order placed successfully"

        except Exception as e:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()

    return jsonify({"orderId": order_id, "msg": msg}), status_code

    
@app.route(route + "/orders/", methods=["GET"])
@token_required
def getOrders(current_user):
    userId = current_user["userId"]  # Extract userId from the decoded token

    query_orders = """
        SELECT orders.orderId, orderDetails.productId, orderDetails.quantity, orderDetails.price, orderDetails.address, orderDetails.landmark, orderDetails.city, orderDetails.pincode, orderDetails.state, orderDetails.country, orderDetails.orderDate
        FROM orders
        JOIN orderDetails ON orders.orderId = orderDetails.orderId
        WHERE orders.userId = %s
    """

    query_product_details = """
        SELECT products.productId, products.name, products.description, products.newPrice, categories.name, productImages.image
        FROM products
        JOIN categories ON products.categoryId = categories.categoryId
        JOIN productImages ON products.productId = productImages.productId
        WHERE products.productId = %s
    """

    try:
        orders_data = execute_query(query_orders, (userId,))
        orders = []
        for order in orders_data:
            (
                orderId,
                productId,
                quantity,
                price,
                address,
                landmark,
                city,
                pincode,
                state,
                country,
                orderDate,
            ) = order

            product_data = execute_query(query_product_details, (productId,))
            if product_data:
                (
                    productId,
                    productName,
                    productDescription,
                    productPrice,
                    categoryName,
                    productImage,
                ) = product_data[0]

                orderItem = {
                    "orderId": orderId,
                    "title": productName,
                    "quantity": quantity,
                    "price": productPrice,
                    "shipping": address,
                    "image": bytes(productImage).decode('utf-8'),
                    "payment": "Credit Card",  # Replace with appropriate payment method
                    "status": "Delivered",  # Replace with appropriate order status
                    "deliveryDate": datetime.strptime(orderDate, "%Y-%m-%d %H:%M:%S.%f").strftime("%Y-%m-%d %H:%M:%S")    
                }

                orders.append(orderItem)

        formattedOrderedProducts = []
        for orderId, group in itertools.groupby(orders, key=lambda x: x["orderId"]):
            group_list = list(group)
            total_price = sum(order["price"] for order in group_list)
            formattedOrderedProducts.append({
                "id": str(orderId),
                "totalPrice": str(total_price),
                "orders": group_list
            })

        return {
            "message": "Orders retrieved successfully",
            "status_code": 200,
            "orderedProducts": formattedOrderedProducts,
        }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}


@app.route(route + "/categories/", methods=["OPTIONS"])
def handleCategoriesOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + "/categories/", methods=["GET"])
def getCategories():
    query_categories = "SELECT categoryId, name FROM categories"

    try:
        categories_data = execute_query(query_categories)
        formattedCategories = []
        for categoryId, name in categories_data:
            formattedCategories.append({"id": categoryId, "name": name})

        return {
            "message": "Categories retrieved successfully",
            "status_code": 200,
            "categories": formattedCategories,
        }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}

@app.route(route + "/reviews/", methods=["OPTIONS"])
def handleReviewsOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + "/reviews/", methods=["POST"])
@token_required
def addReview(current_user):
    try:
        data = request.json
        productId = request.args.get('id')
        review = data["review"]
        rating = data["rating"]
        userId = current_user["userId"]

        query_insert_review = """
            INSERT INTO productReviews (productId, userId, review, rating)
            VALUES (%s, %s, %s, %s)
        """

        with psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        ) as conn:
            cur = conn.cursor()

            review_data = (productId, userId, review, rating)
            cur.execute(query_insert_review, review_data)

            conn.commit()

            return {"message": "Review added successfully", "status_code": 200}

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}
 
@app.route(route + "/reviews/", methods=["DELETE"])
@token_required
def deleteReview(current_user):
    try:
        productId = request.args.get('id')
        userId = current_user["userId"]

        query_delete_review = """
            DELETE FROM productReviews
            WHERE productId = %s AND userId = %s
        """

        with psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        ) as conn:
            cur = conn.cursor()

            review_data = (productId, userId)
            cur.execute(query_delete_review, review_data)

            conn.commit()

            return {"message": "Review deleted successfully", "status_code": 200}

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}

# Seller APIs

@app.route(authRoute + "/seller/", methods=["OPTIONS"])
def handleSellerSignUpOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route(authRoute + "/seller/signup/", methods=["POST"])
def sellerSignUp():
    data = request.json
    firstName = data["firstName"]
    lastName = data["lastName"]
    email = data["email"]
    password = data["password"]
    categories = data["categories"]
    phoneNumber = data["phoneNumber"]
    address = data["address"]
    city = data["city"]
    pincode = data["pincode"]
    state = data["state"]
    country = data["country"]
    accountNumber = data["accountNumber"]
    accountHolderName = data["accountHolderName"]
    bankName = data["bankName"]
    branchName = data["branchName"]
    ifscCode = data["ifscCode"]

    try:
        # Check if the email already exists in the database
        query_check_email = "SELECT email FROM users WHERE email = %s"
        result = execute_query(query_check_email, (email,))
        if result:
            return jsonify({"message": "Email already exists"}), 400

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

        query_insert_seller = """
            INSERT INTO sellers (firstName, lastName, email, password, salt, phoneNumber, address, city, pincode, state, country)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING sellerId
        """
        query_insert_seller_account = """
            INSERT INTO sellerAccounts (sellerId, accountNumber, accountHolderName, accountBalance, bankName, branchName, ifscCode)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        query_insert_seller_category = """
            INSERT INTO sellerCategory (seller_id, category_id) VALUES (%s, %s)
        """
        query_select_category_id = "SELECT categoryId FROM categories WHERE name = %s"
        query_insert_category = "INSERT INTO categories (name) VALUES (%s)"

        with psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        ) as conn:
            cur = conn.cursor()

            # Insert seller data
            seller_data = (firstName, lastName, email, hashed_password, salt, phoneNumber, address, city, pincode, state, country)
            cur.execute(query_insert_seller, seller_data)
            seller_id = cur.fetchone()[0]

            print("seller_id", seller_id)

            # Insert seller account data
            accountBalance = round(random.uniform(10000, 100000), 2)
            seller_account_data = (seller_id, accountNumber, accountHolderName, accountBalance, bankName, branchName, ifscCode)
            cur.execute(query_insert_seller_account, seller_account_data)

            # Insert seller categories
            for category in categories:
                cur.execute(query_select_category_id, (category,))
                category_id = cur.fetchone()
                if category_id is None:
                    cur.execute(query_insert_category, (category,))
                    category_id = cur.lastrowid
                else:
                    category_id = category_id[0]

                seller_category_data = (seller_id, category_id)
                cur.execute(query_insert_seller_category, seller_category_data)

            # conn.commit()
            status_code = 201
            msg = "Seller signed up successfully"

    except Exception as e:
        traceback.print_exc()
        status_code = 500
        msg = "Error occurred"

    return jsonify({"msg": msg}), status_code


@app.route(authRoute + "/seller/login/", methods=["POST"])
def sellerLogin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        query_select_seller = "SELECT * FROM sellers WHERE email = %s"
        result = execute_query(query_select_seller, (email,))

        if not result:
            return jsonify({"message": "Invalid credentials"}), 400

        user = result[0]
        db_password = user[4]  # Assuming password hash is stored in the 5th column
        salt = user[5]  # Assuming salt is stored in the 6th column

        print(salt)

        salt_bytes = bytes(salt)

        print(salt_bytes)

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt_bytes)

        if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
            expiry = datetime.utcnow() + timedelta(days=1)
            payload = {
                'email': email,
                'exp': expiry,
                "userId": user[0],  
                "email": email
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

            return jsonify({"token": token, "sellerId": user[0], "email": email, "firstName": user[1], "lastName": user[2]}), 200
        else:
            return jsonify({"message": "Password is incorrect"}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": "Error occurred: " + str(e)}), 500




sellerRoute = "/api/seller"

@app.route(sellerRoute + "/dashboard/", methods=["GET"])
@token_required
def getSellerDashboard(current_user):
    userId = current_user["userId"]
    try:
        # Calculate totalRevenue
        query_total_revenue = """
            SELECT SUM(p.newPrice)
            FROM users as u
            JOIN orders as o ON u.userId = o.userId
            JOIN orderDetails as od ON o.orderId = od.orderId
            JOIN products as p ON od.productId = p.productId
            WHERE p.sellerId = %s
        """
        totalRevenue = execute_query(query_total_revenue, (userId,))[0][0]

        # Calculate totalOrders
        query_total_orders = """
            SELECT COUNT(o.orderId)
            FROM orders as o
            JOIN orderDetails as od ON o.orderId = od.orderId
            JOIN products as p ON od.productId = p.productId
            WHERE p.sellerId = %s
        """
        totalOrders = execute_query(query_total_orders, (userId,))[0][0]

        # Calculate pendingOrders
        query_pending_orders = """
            SELECT COUNT(o.orderId)
            FROM orders as o
            JOIN orderDetails as od ON o.orderId = od.orderId
            JOIN products as p ON od.productId = p.productId
            WHERE od.orderStatus = 'Order Placed' AND p.sellerId = %s
        """
        pendingOrders = execute_query(query_pending_orders, (userId,))[0][0]

        # Calculate totalCustomers
        query_total_customers = """
            SELECT COUNT(od.productId)
            FROM orders as o, orderDetails as od
            WHERE o.orderId = od.orderId AND od.productId IN (SELECT productId FROM products WHERE sellerId = %s)
        """
        totalCustomers = execute_query(query_total_customers, (userId,))[0][0]

        # Retrieve latestProducts
        query_latest_products = """
            SELECT p.name, i.image as image
            FROM products p
            JOIN productImages i ON p.productId = i.productId
            WHERE p.sellerId = %s
            GROUP BY p.productId, i.image;
        """
        latestProducts = execute_query(query_latest_products, (userId,))

        for product in latestProducts:
            product['image'] = bytes(product['image']).decode('utf-8')
        

        # Retrieve orders
        query_orders = """
            SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.price, od.orderStatus, od.productId
            FROM users AS u
            JOIN orders AS o ON u.userId = o.userId
            JOIN orderDetails AS od ON o.orderId = od.orderId
            JOIN products AS p ON od.productId = p.productId
            WHERE p.sellerId = %s;
        """
        orders = execute_query(query_orders, (userId,))

        # Retrieve sales data for each month
        months = {
            '01': 'Jan',
            '02': 'Feb',
            '03': 'Mar',
            '04': 'Apr',
            '05': 'May',
            '06': 'Jun',
            '07': 'Jul',
            '08': 'Aug',
            '09': 'Sep',
            '10': 'Oct',
            '11': 'Nov',
            '12': 'Dec'
        }
        sales_data = []
        for month_number, month_name in months.items():
            query_sales_data = """
                SELECT SUM(p.newPrice) AS totalSales
                FROM orders AS o
                JOIN orderDetails AS od ON o.orderId = od.orderId
                JOIN products AS p ON od.productId = p.productId
                WHERE od.orderStatus = 'Order Placed' 
                AND p.sellerId = %s
                AND EXTRACT(YEAR FROM TO_DATE(od.orderDate, 'YYYY-MM-DD')) = 2023
                AND EXTRACT(MONTH FROM TO_DATE(od.orderDate, 'YYYY-MM-DD')) = %s
            """





            total_sales = execute_query(query_sales_data, (userId, month_number))[0][0]
            sales_data.append({'month': month_name, 'sales': total_sales})

        # Retrieve product counts
        query_product_counts = """
            SELECT p.name, count(p.productId)
            FROM orders as o 
            JOIN orderDetails as od ON o.orderId = od.orderId 
            JOIN products as p ON od.productId = p.productId
            WHERE p.sellerId = %s
            GROUP BY p.newPrice, p.name
        """
        product_counts = execute_query(query_product_counts, (userId,))

        formatted_product_counts = [{'name': row[0], 'value': row[1]} for row in product_counts]

        return {
            "message": "Dashboard retrieved successfully",
            "status_code": 200,
            "dashboard": {
                "totalRevenue": totalRevenue,
                "totalOrders": totalOrders,
                "pendingOrders": pendingOrders,
                "totalCustomers": totalCustomers,
                "latestProducts": latestProducts,
                "orders": orders,
                "salesData": sales_data,
                "productCounts": formatted_product_counts,
            },
        }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}

@app.route(sellerRoute + "/orders/", methods=["GET"])
@token_required
def getSellerOrders(current_user):
    userId = current_user["userId"]
    try:
        # Calculate totalOrders
        query_total_orders = """
            SELECT COUNT(o.orderId)
            FROM orders as o
            JOIN orderDetails as od ON o.orderId = od.orderId
            JOIN products as p ON od.productId = p.productId
            WHERE p.sellerId = %s
        """
        totalOrders = execute_query(query_total_orders, (userId,))[0][0]

        # Calculate pendingOrders
        query_pending_orders = """
            SELECT COUNT(o.orderId)
            FROM orders as o
            JOIN orderDetails as od ON o.orderId = od.orderId
            JOIN products as p ON od.productId = p.productId
            WHERE od.orderStatus = 'Order Placed' AND p.sellerId = %s
        """
        pendingOrders = execute_query(query_pending_orders, (userId,))[0][0]

        # Calculate totalCustomers
        query_total_customers = """
            SELECT COUNT(od.productId)
            FROM orders as o, orderDetails as od
            WHERE o.orderId = od.orderId AND od.productId IN (SELECT productId FROM products WHERE sellerId = %s)
        """
        totalCustomers = execute_query(query_total_customers, (userId,))[0][0]

        # Retrieve orders
        query_orders = """
            SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.address || ', ' || od.landmark || ', ' || od.city || '-' || od.pinCode || ', ' || od.state || ', ' || od.country AS address, u.email, od.price, od.orderStatus, od.orderDetailsId
            FROM users as u
            JOIN orders AS o
            JOIN orderDetails AS od
            JOIN products as p
            WHERE o.orderId = od.orderId and u.userId = o.userId and od.productId = p.productId and p.sellerId = %s;
        """
        orders = execute_query(query_orders, (userId,))

        # Retrieve today's orders
        query_todays_orders = """
            SELECT COUNT(*) AS orderCount
            FROM users AS u
            JOIN orders AS o
            JOIN orderDetails AS od
            JOIN products AS p
            WHERE o.orderId = od.orderId
                AND u.userId = o.userId
                AND od.productId = p.productId
                AND p.sellerId = %s
                AND DATE(od.orderDate) = CURRENT_DATE;
        """
        todaysOrders = execute_query(query_todays_orders, (userId,))[0][0]

        order_objects = []
        for order in orders:
            order_obj = {
                "id": order[0],
                "custName": order[1] + " " + order[2],
                "productName": order[3],
                "orderDate": order[4],
                "amount": order[7],
                "address": order[5],
                "email": order[6],
                "status": order[8],
                "orderDetailsId": order[9]
            }
            order_objects.append(order_obj)

        return {
            "message": "Orders retrieved successfully",
            "sellerOrders": {
                "totalOrders": totalOrders,
                "pendingOrders": pendingOrders,
                "totalCustomers": totalCustomers,
                "orders": order_objects,
                "newOrders": todaysOrders,
            },
            "status_code": 200,
        }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}


@app.route(sellerRoute + "/orders/", methods=["PATCH"])
@token_required
def updateSellerOrders(current_user):
    userId = current_user["userId"]
    body = request.get_json()
    orderDetailsId = body.get('orderDetailsId')
    orderStatus = body.get('orderStatus')

    try:
        # Update orderStatus in the orderDetails table
        update_query = """
            UPDATE orderDetails SET orderStatus = %s WHERE orderDetailsId = %s;
        """
        execute_query(update_query, (orderStatus, orderDetailsId), no_return=True)

        msg = "Status updated successfully"

        # Retrieve updated orders
        query_orders = """
            SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.address || ', ' || od.landmark || ', ' || od.city || '-' || od.pinCode || ', ' || od.state || ', ' || od.country AS address, u.email, od.price, od.orderStatus, od.orderDetailsId
            FROM users as u
            JOIN orders AS o
            JOIN orderDetails AS od
            JOIN products as p
            WHERE o.orderId = od.orderId AND u.userId = o.userId AND od.productId = p.productId AND p.sellerId = %s;
        """
        orders = execute_query(query_orders, (userId,))

        order_objects = []
        for order in orders:
            order_obj = {
                "id": order[0],
                "custName": order[1] + " " + order[2],
                "productName": order[3],
                "orderDate": order[4],
                "amount": order[7],
                "address": order[5],
                "email": order[6],
                "status": order[8],
                "orderDetailsId": order[9]
            }
            order_objects.append(order_obj)

        return {
            "message": msg,
            "sellerOrders": {
                "orders": order_objects,
            },
            "status_code": 200,
        }
    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}

@app.route(sellerRoute + "/products/", methods=["GET"])
@token_required
def getSellerProducts(current_user):
    userId = current_user["userId"]
    product_id = request.args.get('id')

    print('product_id', product_id)

    if product_id != "{id}":
        try:
            # Retrieve a single product with the given product_id
            query_product = """
                SELECT c.categoryId, p.productId, p.name, p.newPrice, p.oldPrice, p.ratings, p.description, p.stock, c.name 
                FROM products AS p
                JOIN sellers AS s ON p.sellerId = s.sellerId
                JOIN categories AS c ON p.categoryId = c.categoryId
                WHERE p.sellerId = %s AND p.productId = %s;
            """
            product = execute_query(query_product, (userId, product_id,))

           
                    

            categoryId, productId, name, newPrice, oldPrice, ratings, description, stock, categoryName = product[0]
            if product:
                product_obj = {
                    "categoryId": categoryId,
                    "productId": productId,
                    "name": name,
                    "newPrice": newPrice,
                    "oldPrice": oldPrice,
                    "ratings": ratings,
                    "description": description,
                    "stock": stock,
                    "categoryName": categoryName,
                    "images": [],
                }

                # Retrieve images for the product
                query_images = """
                    SELECT image FROM productImages WHERE productId = %s;
                """
                images = execute_query(query_images, (product_id,))
                if images:
                    product_obj["images"] = [bytes(image[0]).decode('utf-8') for image in images]

                return {
                    "message": "Product retrieved successfully",
                    "product": product_obj,
                    "status_code": 200,
                }
            else:
                return {
                    "message": "Product not found",
                    "status_code": 404,
                }

        except Exception as e:
            traceback.print_exc()
            return {"message": "Error occurred: " + str(e), "status_code": 500}

    try:
        # Retrieve all products for the seller with images
        query_products = """
            SELECT c.categoryId, p.productId, p.name, p.newPrice, p.ratings, p.description, p.stock, c.name
            FROM products AS p
            JOIN sellers AS s ON p.sellerId = s.sellerId
            JOIN categories AS c ON p.categoryId = c.categoryId
            WHERE p.sellerId = %s;
        """

        query_images = """
            SELECT image FROM productImages WHERE productId = %s;
        """

        
        products = execute_query(query_products, (userId,))
        # print(products)
        product_objects = []

        for product in products:
            product_id = product[1]

            images = execute_query(query_images, (product_id,))
            image = images[0][0] if images else None


            product_obj = {
                "categoryId": product[0],
                "productId": product[1],
                "name": product[2],
                "price": product[3],
                "ratings": product[4],
                "description": product[5],
                "stock": product[6],
                "categoryName": product[7],
                "image": bytes(image).decode('utf-8') if image else None,
            }

            product_objects.append(product_obj)
            # print(product_objects)

        return {
            "message": "Products retrieved successfully",
            "sellerProducts": {
                "products": product_objects,
            },
            "status_code": 200,
        }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}


@app.route(sellerRoute + '/products/', methods=["POST"])
@token_required
def addProduct(current_user):
    userId = current_user["userId"]
    new_quantity = request.headers.get('quantity')
    product = request.get_json()

    # print(product[name])

    try:
        query_insert_product = '''
            INSERT INTO products (sellerId, name, newPrice, oldPrice, ratings, categoryId, description, stock)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING productId;
        '''
        productId = execute_query(query_insert_product, (
            userId, product["itemName"], product["newPrice"], product["oldPrice"],
            0, product["categoryId"], product["description"], product["stock"]
        ), no_return=False)[0][0]

        print("productId", productId)

        query_insert_images = '''
            INSERT INTO productImages (productId, image) VALUES (%s, %s);
        '''
        for image in product["images"]:
            execute_query(query_insert_images, (productId, image), no_return=True)

        msg = "Added successfully"
        status_code = 200

        return make_response(msg, status_code)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)

@app.route(sellerRoute + '/products/', methods=["DELETE"])
@token_required
def deleteProduct(current_user):
    userId = current_user["userId"]
    productId = request.args.get('id')

    try:
        query_delete_product = '''
            DELETE FROM products WHERE productId = %s AND sellerId = %s;
        '''
        execute_query(query_delete_product, (productId, userId), no_return=True)

        query_delete_images = '''
            DELETE FROM productImages WHERE productId = %s;
        '''
        execute_query(query_delete_images, (productId,), no_return=True)

        msg = "Deleted successfully"
        status_code = 200

        return make_response(msg, status_code)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)

@app.route(sellerRoute + '/products/', methods=["PATCH"])
@token_required
def updateProduct(current_user):
    userId = current_user["userId"]
    product_id = request.args.get('id')
    product = request.get_json()

    try:
        query_update_product = '''
            UPDATE products 
            SET name = %s, newPrice = %s, oldPrice = %s, categoryId = %s, description = %s, stock = %s 
            WHERE productId = %s AND sellerId = %s;
        '''
        execute_query(query_update_product, (product["itemName"], product["newPrice"], product["oldPrice"], product["categoryId"], product["description"], product["stock"], product_id, userId), no_return=True)

        query_delete_images = '''
            DELETE FROM productImages WHERE productId = %s;
        '''
        execute_query(query_delete_images, (product_id,), no_return=True)

        query_insert_images = '''
            INSERT INTO productImages (productId, image) VALUES (%s, %s);
        '''
        images = [(product_id, image) for image in product["images"]]
        for image in product["images"]:
            execute_query(query_insert_images, (product_id, image), no_return=True)

        msg = "Updated successfully"
        status_code = 200

        return make_response(msg, status_code)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)


@app.route(authRoute + '/user/profile/', methods=["GET"])
@token_required
def getProfile(current_user):
    userId = current_user["userId"]

    try:
        query_get_user = '''
            SELECT * FROM users WHERE userId = %s;
        '''
        user = execute_query(query_get_user, (userId,))

        if user:
            user = user[0]  # Since the query returns a list, extract the first element
            userDetails = {
                "userId": user[0],
                "firstName": user[4],
                "lastName": user[5],
                "address": user[6],
                "city": user[7],
                "pinCode": user[8],
                "state": user[9],
                "country": user[10],
            }

            return {
                "message": "User retrieved successfully",
                "user": userDetails,
                "status_code": 200,
            }
        else:
            return make_response("User not found", 404)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)

@app.route(authRoute + '/user/profile/', methods=["PATCH"])
@token_required
def updateProfile(current_user):
    userId = current_user["userId"]
    user = request.get_json()

    try:
        query_update_user = '''
            UPDATE users SET firstName = %s, lastName = %s, address = %s, city = %s, pinCode = %s, state = %s, country = %s WHERE userId = %s;
        '''
        execute_query(query_update_user, (user["firstName"], user["lastName"], user["address"], user["city"], user["pinCode"], user["state"], user["country"], userId), no_return=True)

        msg = "Updated successfully"
        status_code = 200

        return make_response(msg, status_code)

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)

@app.route(authRoute + '/seller/profile/', methods=["GET"])
@token_required
def getSellerProfile(current_user):
    userId = current_user["userId"]

    try:
        # Fetch seller details
        query_fetch_seller = '''
            SELECT * FROM sellers WHERE sellerId = %s;
        '''
        seller = execute_query(query_fetch_seller, (userId,))

        print(userId)
        
        # Fetch seller account details
        query_fetch_seller_account = '''
            SELECT * FROM sellerAccounts WHERE sellerId = %s;
        '''


        sellerAccount = execute_query(query_fetch_seller_account, (userId,))

        # print(sellerAccount)

        # Fetch seller categories
        query_fetch_seller_categories = '''
            SELECT category_id FROM sellerCategory WHERE seller_id = %s;
        '''
        sellerCategory = execute_query(query_fetch_seller_categories, (userId,))
        seller_categories = [category[0] for category in sellerCategory]

        print(sellerCategory)

        sellerDetails = {
            "sellerId": seller[0][0],
            "firstName": seller[0][1],
            "lastName": seller[0][2],
            "phoneNumber": seller[0][6],
            "address": seller[0][7],
            "city": seller[0][8],
            "pinCode": seller[0][9],
            "state": seller[0][10],
            "country": seller[0][11],
            "accountNumber": sellerAccount[0][2],
            "accountHolderName": sellerAccount[0][3],
            "bankName": sellerAccount[0][5],
            "branchName": sellerAccount[0][6],
            "ifscCode": sellerAccount[0][7],
            "category": seller_categories
        }

        return {
            "message": "Seller retrieved successfully",
            "seller": sellerDetails,
            "status_code": 200,
        }

    except Exception as e:
        traceback.print_exc()
        return make_response("Error occurred", 500)

@app.route(authRoute + '/seller/profile/', methods=["PATCH"])
@token_required
def updateSellerProfile(current_user):
    userId = current_user["userId"]
    seller = request.get_json()

    try:
        # Update seller details
        query_update_seller = '''
            UPDATE sellers
            SET firstName = %s, lastName = %s, phoneNumber = %s, address = %s, city = %s, pinCode = %s, state = %s, country = %s
            WHERE sellerId = %s;
        '''
        execute_query(query_update_seller, (seller["firstName"], seller["lastName"], seller["phoneNumber"], seller["address"], seller["city"], seller["pinCode"], seller["state"], seller["country"], userId), no_return=True)

        # Update seller account details
        query_update_seller_account = '''
            UPDATE sellerAccounts
            SET accountNumber = %s, accountHolderName = %s, bankName = %s, branchName = %s, ifscCode = %s
            WHERE sellerId = %s;
        '''
        execute_query(query_update_seller_account, (seller["accountNumber"], seller["accountHolderName"], seller["bankName"], seller["branchName"], seller["ifscCode"], userId), no_return=True) 

        # Delete and insert seller categories
        query_delete_seller_categories = '''
            DELETE FROM sellerCategory WHERE seller_id = %s;
        '''
        execute_query(query_delete_seller_categories, (userId,), no_return=True)

        query_insert_seller_category = '''
            INSERT INTO sellerCategory (seller_id, category_id) VALUES (%s, %s);
        '''
        for category in seller["category"]:
            # Check if category exists
            query_select_category_id = '''
                SELECT categoryId FROM categories WHERE name = %s;
            '''
            category_id = execute_query(query_select_category_id, (category,))
            if not category_id:
                # Category does not exist, create it and get its ID
                query_insert_category = '''
                    INSERT INTO categories (name) VALUES (%s) RETURNING categoryId;
                '''
                category_id = execute_query(query_insert_category, (category,), no_return=False)[0][0]
            else:
                category_id = category_id[0]

            # Insert the seller-category relationship
            execute_query(query_insert_seller_category, (userId, category_id), no_return=True)

        msg = "Updated successfully"
        status_code = 200
        return make_response(msg, status_code)

    except Exception as e:
        traceback.print_exc()
        msg = "Error occurred"
        status_code = 500
        return make_response(msg, status_code)

if __name__ == "__main__":
    app.run()

