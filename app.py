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


app = Flask(__name__)
CORS(app)


route = "/api"
authRoute = "/api/auth"
app.config['SECRET_KEY'] = 'secret'



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
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')
    address = data.get('address')
    city = data.get('city')
    pincode = data.get('pincode')
    state = data.get('state')
    country = data.get('country')

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute("SELECT email FROM users WHERE email = ?", (email,))
        if cur.fetchone() is not None:
            return jsonify({"message": "Email already exists"}), 400

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        cur.execute("INSERT INTO users (firstname, lastname, email, password, salt, address, city, pincode, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (firstname, lastname, email, hashed_password, salt, address, city, pincode, state, country))
        conn.commit()
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

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cur.fetchone()
        if user is None:
            return jsonify({"message": "Invalid credentials"}), 400
        else:
            db_password = user[2]  # Assuming password hash is stored in the 4th column
            salt = user[3]  # Assuming salt is stored in the 6th column

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

            if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
                expiry = datetime.utcnow() + timedelta(days=1)
                payload = {
                    'email': email,
                    'exp': expiry,
                    "userId": user[0], 
                    "email": email
                }
                token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
                # print(token)
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
    if productId:
        with sqlite3.connect('ecart.db') as conn:
            cur = conn.cursor()
            cur.execute('SELECT p.productId, p.name, p.price, p.ratings, p.image, p.description, c.categoryId, c.name FROM products p INNER JOIN categories c ON p.categoryId = c.categoryId WHERE p.productId = ?', (productId,))
            itemData = cur.fetchall()

        if itemData:
            productId, name, price, ratings, image, description, categoryId, categoryName = itemData[0]
            product = {
                'productId': productId,
                'categoryId': categoryId,
                'categoryName': categoryName,
                'name': name,
                'price': price,
                'ratings': ratings,
                'image': image,
                'description': description
            }
            
            cur.execute('SELECT productId, name, price, image, categoryId FROM products where categoryId = ?', (categoryId,))
            categoryData = cur.fetchall()
            relatedProducts = []
            relatedProductsCnt = 0
            for item in categoryData:
                relatedProductsCnt +=1
                productId, name, price, image, categoryId = item
                relatedProducts.append({
                    'productId': productId,
                    'categoryId': categoryId,
                    'name': name,
                    'price': price,
                    'image': image
                })

            # print(categoryData)

            

            return jsonify([product, categoryName, relatedProducts])

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute('SELECT p.productId, p.name, p.price, p.image, c.categoryId, c.name FROM products p INNER JOIN categories c ON p.categoryId = c.categoryId')
        itemData = cur.fetchall()

    categoryData = {}
    for item in itemData:
        productId, name, price, image, categoryId, categoryName = item
        if categoryId not in categoryData:
            categoryData[categoryId] = {'categoryName': categoryName, 'products': []}
        categoryData[categoryId]['products'].append({
            'productId': productId,
            'categoryId': categoryId,
            'name': name,
            'price': price,
            'image': image
        })

    formattedData = []
    for categoryId, categoryInfo in categoryData.items():
        formattedData.append({
            'categoryId': categoryId,
            'categoryName': categoryInfo['categoryName'],
            'products': categoryInfo['products']
        })

    return jsonify(formattedData)


@app.route(route + '/products/', methods=["POST"])
@token_required
def addProduct(current_user):
    new_quantity = request.headers.get('quantity')
    with sqlite3.connect('ecart.db') as conn:
        product = request.get_json()
        print(product["itemName"])
        cur = conn.cursor()
        try:
            # If the product doesn't exist, add a new entry with quantity 1
            cur.execute('''INSERT INTO products (name, price, image, ratings, categoryId, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)''', (product["itemName"], product["price"], product["image"], product["ratings"], product["categoryId"], product["description"], product["stock"]))
            msg = "Added successfully"
            conn.commit()
            status_code = 200
        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()  # Print the traceback for debugging purposes

    conn.close()
    return make_response(msg, status_code)


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
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT products.productId, products.name, products.price, products.image, categories.name, kart.quantity FROM users, products, kart, categories WHERE users.userId = ? AND users.userId = kart.userId AND products.productId = kart.productId AND products.categoryId = categories.categoryId",
            (userId,),
        )
        products = cur.fetchall()

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
            'image': image,
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
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM kart WHERE userId = ?", (userId,))
            conn.commit()
            msg = "Cart cleared successfully"
            status_code = 200
        except:
            conn.rollback()
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

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()

        try:
            # Check if the product already exists in the cart for the current user
            cur.execute("SELECT productId, quantity FROM kart WHERE productId = ? AND userId = ?", (productId, userId))
            existing_product = cur.fetchone()

            if existing_product:
                # If the product already exists, update the quantity by 1
                new_quantity = existing_product[1] + 1
                cur.execute("UPDATE kart SET quantity = ? WHERE productId = ? AND userId = ?", (new_quantity, productId, userId))

                msg = "Quantity updated successfully"
            else:
                # If the product doesn't exist, add a new entry with quantity 1 for the current user
                cur.execute("INSERT INTO kart (userId, productId, quantity) VALUES (?, ?, ?)", (userId, productId, 1))
                msg = "Added successfully"

            conn.commit()
            status_code = 200
        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()  # Print the traceback for debugging purposes

    conn.close()
    return make_response(msg, status_code)


@app.route(route + "/cartItem", methods=["DELETE"])    
@token_required
def removeFromCart(current_user):
    productId = request.args.get('id')
    print(productId)
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM kart WHERE productId = ?", (productId,))
            conn.commit()
            msg = "removed successfully"
            status_code = 200
        except:
            conn.rollback()
            msg = "error occurred"
            status_code = 500
    conn.close()
    return make_response(msg, status_code)

@app.route(route + "/cartItem", methods=["PATCH"])
@token_required
def updateQuantity(current_user):
    productId = request.args.get('id')
    new_quantity = request.headers.get('quantity')

    print(new_quantity)
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            cur.execute("UPDATE kart SET quantity = ? WHERE productId = ?", (new_quantity, productId))
            msg = "Quantity updated successfully"
            conn.commit()
            cur.execute(
                '''SELECT products.productId, products.name, products.price, products.image, categories.name, kart.quantity 
                   FROM products
                   JOIN kart ON kart.productId = products.productId
                   JOIN categories ON products.categoryId = categories.categoryId
                   WHERE kart.productId = ?''', (productId,)
            )
            product = cur.fetchall()
            status_code = 200
        except Exception as e:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()  # Print the traceback for debugging purposes

    conn.close()
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

    
    orderId = None
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()

        try:
            # Fetch the product price
            cur.execute("SELECT * FROM products WHERE productId = ?", (productId,))
            product = cur.fetchone()
            price = product[2]
            print("price " + str(price))
            # Insert into payments table
            cur.execute("INSERT INTO payments (userId, nameOnCard, cardNumber, expiryDate, cvv, paymentDate) VALUES (?, ?, ?, ?, ?, ?)", 
                        (userId, orderPayment['cardName'], orderPayment['cardNumber'], orderPayment['expDate'], orderPayment['cvv'], datetime.now()))

            paymentId = cur.lastrowid  # Get the generated payment ID

             # Insert into orders table
            cur.execute("INSERT INTO orders (userId, paymentId) VALUES ( ?, ?)", 
                        (userId, paymentId))

            orderId = cur.lastrowid  # Get the ID of the inserted order
            # print(productId)  
            
            # Insert into orderDetails table
            quantity = 1
            cur.execute("INSERT INTO orderDetails (orderId, productId, quantity, price, address, landmark, city, pincode, state, country, orderDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                        (orderId, productId, quantity, price, orderAddress['address'], orderAddress['landmark'], orderAddress['city'], orderAddress['pinCode'], orderAddress['state'], orderAddress['country'], datetime.now()))

           
            msg = "Order placed successfully"
            conn.commit()
            status_code = 200
        except Exception as e:
            conn.rollback()
            msg = "Error occurred: " + str(e)
            status_code = 500
            traceback.print_exc()

    return jsonify({"orderId": orderId, "msg":msg}), status_code

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

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO payments (userId, nameOnCard, cardNumber, expiryDate, cvv, paymentDate) VALUES (?, ?, ?, ?, ?, ?)", 
                        (userId, orderPayment['cardName'], orderPayment['cardNumber'], orderPayment['expDate'], orderPayment['cvv'], datetime.now()))
            paymentId = cur.lastrowid
            cur.execute("SELECT p.productId, k.quantity, p.price FROM kart as k, products as p WHERE k.productId = p.productId and userId = ?", (userId,))
            cartItems = cur.fetchall()

            cur.execute("INSERT INTO orders (userId, paymentId) VALUES (?, ?)", (userId, paymentId))
            orderId = cur.lastrowid  # Get the ID of the inserted order

            print(cartItems)
            for item in cartItems:
                productId = item[0]
                quantity = item[1]
                price = item[2]
                # ... Retrieve other necessary information for the order

                cur.execute("INSERT INTO orderDetails (orderId ,productId, quantity, price, address, landmark, city, pincode, state, country, orderDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ( orderId ,productId, quantity, price, orderAddress['address'], orderAddress['landmark'], orderAddress['city'], orderAddress['pinCode'], orderAddress['state'], orderAddress['country'], datetime.now()))
        
            
            conn.commit()
            status_code = 200
            msg = "Order placed successfully"

        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()

    return jsonify({"orderId": orderId, "msg": msg}), status_code
    
    
@app.route(route + "/orders/", methods=["GET"])
@token_required
def getOrders(current_user):
    userId = current_user["userId"]  # Extract userId from the decoded token

    try:
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                SELECT orders.orderId, orderDetails.productId, orderDetails.quantity, orderDetails.price, orderDetails.address, orderDetails.landmark, orderDetails.city, orderDetails.pincode, orderDetails.state, orderDetails.country, orderDetails.orderDate
                FROM orders
                JOIN orderDetails ON orders.orderId = orderDetails.orderId
                WHERE orders.userId = ?
                """,
                (userId,),
            )

            orders = cur.fetchall()

            orderedProducts = []
            for order in orders:
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

                cur.execute(
                    """
                    SELECT products.productId, products.name, products.description, products.price, products.image, categories.name
                    FROM products
                    JOIN categories ON products.categoryId = categories.categoryId
                    WHERE products.productId = ?
                    """,
                    (productId,),
                )

                product = cur.fetchone()
                (
                    productId,
                    productName,
                    productDescription,
                    productPrice,
                    productImage,
                    categoryName,
                ) = product

                orderItem = {
                    "orderId": orderId,
                    "title": productName,
                    "quantity": quantity,
                    "price": productPrice,
                    "image": productImage,
                    "shipping": address,
                    "payment": "Credit Card",  # Replace with appropriate payment method
                    "status": "Delivered",  # Replace with appropriate order status
                    "deliveryDate": orderDate,
                }

                orderedProducts.append(orderItem)

            formattedOrderedProducts = []
            for orderId, group in itertools.groupby(orderedProducts, key=lambda x: x["orderId"]):
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
    try:
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                SELECT categoryId, name
                FROM categories
                """
            )

            categories = cur.fetchall()

            formattedCategories = []
            for category in categories:
                categoryId, name = category
                formattedCategories.append({"id": categoryId, "name": name})

            return {
                "message": "Categories retrieved successfully",
                "status_code": 200,
                "categories": formattedCategories,
            }

    except Exception as e:
        traceback.print_exc()
        return {"message": "Error occurred: " + str(e), "status_code": 500}


@app.route(authRoute + "/seller/signup/", methods=["OPTIONS"])
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

    with sqlite3.connect("ecart.db") as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT email FROM users WHERE email = ?", (email,))
            if cur.fetchone() is not None:
                return jsonify({"message": "Email already exists"}), 400

            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
            cur.execute(
                "INSERT INTO sellers (firstName, lastName, email, password, salt, phoneNumber, address, city, pincode, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (firstName, lastName, email, hashed_password, salt, phoneNumber, address, city, pincode, state, country),
            )

            seller_id = cur.lastrowid  # Get the ID of the newly inserted seller

            for category in categories:
                cur.execute("SELECT categoryId FROM categories WHERE name = ?", (category,))
                category_id = cur.fetchone()
                if category_id is None:
                    cur.execute("INSERT INTO categories (name) VALUES (?)", (category,))
                    category_id = cur.lastrowid
                else:
                    category_id = category_id[0]

                cur.execute("INSERT INTO sellerCategory (seller_id, category_id) VALUES (?, ?)", (seller_id, category_id))

            conn.commit()
            status_code = 201
            msg = "Seller signed up successfully"
        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()

    return jsonify({"msg": msg}), status_code



if __name__ == "__main__":
    app.run()

