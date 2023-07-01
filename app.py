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
    userId = request.headers.get('userId')
    

    if productId:
        with sqlite3.connect('ecart.db') as conn:
            cur = conn.cursor()
            cur.execute('SELECT p.productId, p.name, p.newPrice, p.oldPrice, p.ratings, p.description, c.categoryId, c.name FROM products p INNER JOIN categories c ON p.categoryId = c.categoryId WHERE p.productId = ?', (productId,))
            itemData = cur.fetchall()

            if itemData:
                productId, name, newPrice, oldPrice, ratings2, description, categoryId, categoryName = itemData[0]
                print(productId)
                cur.execute(
                    """
                    SELECT image FROM productImages WHERE productId = ?;
                    """, (productId,)
                )
                images = cur.fetchall()  # Retrieve all images for the current product

                if userId:
                    cur.execute(
                        """
                        SELECT * FROM productReviews WHERE productId = ? AND userId = ?;
                        """, (productId, userId)
                    )
                    review = cur.fetchone()
                    if review:
                        userReview = review[3]
                        userRating = review[4]
                    else:
                        userReview = None
                        userRating = None
                else:
                    userReview = None
                    userRating = None
                    
                
                cur.execute(
                    """
                    SELECT AVG(rating) FROM productReviews WHERE productId = ?;
                    """,
                    (productId,)
                )
                result = cur.fetchone()
                ratings = result[0]

                cur.execute(
                    """
                    SELECT u.firstName, u.lastName, r.rating, r.review FROM productReviews r JOIN users u WHERE r.userId = u.userId AND productId = ?;
                    """,
                    (productId,)
                )
                reviews = cur.fetchall()

                image_list = []
                for image in images:
                    image_list.append(image[0])

                product = {
                    'productId': productId,
                    'categoryId': categoryId,
                    'categoryName': categoryName,
                    'name': name,
                    'newPrice': newPrice,
                    'oldPrice': oldPrice,
                    'ratings': ratings,
                    'description': description,
                    "images": image_list, 
                    "reviews": reviews,
                    "userReview": userReview,
                    "userRating": userRating
                }
                
                cur.execute(
                    """
                    SELECT p.productId, p.name, p.newPrice, p.categoryId, i.image
                    FROM products p
                    JOIN (
                        SELECT productId, image
                        FROM productImages
                        GROUP BY productId
                    ) i ON p.productId = i.productId
                    WHERE categoryId = ?
                    """, (categoryId,)
                )
                categoryData = cur.fetchall()
                relatedProducts = []
                relatedProductsCnt = 0
                for item in categoryData:
                    relatedProductsCnt +=1
                    productId, name, price, categoryId, image = item
                    relatedProducts.append({
                        'productId': productId,
                        'categoryId': categoryId,
                        'newPrice': newPrice,
                        'oldPrice': oldPrice,
                        'price': price,
                        'image': image
                    })

                # print(categoryData)

                

                return jsonify([product, categoryName, relatedProducts])

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute('SELECT p.productId, p.name, p.newPrice, p.oldPrice, c.categoryId, c.name FROM products p INNER JOIN categories c ON p.categoryId = c.categoryId ')
        itemData = cur.fetchall()

        

    categoryData = {}
    for item in itemData:
        productId, name, newPrice, oldPrice, categoryId, categoryName = item
        cur.execute(
            """
            SELECT image FROM productImages WHERE productId = ?;
            """, (productId,)
        )
            
        image = cur.fetchall()[0][0]  # Retrieve the first image for the current product

        if categoryId not in categoryData:
            categoryData[categoryId] = {'categoryName': categoryName, 'products': []}
        categoryData[categoryId]['products'].append({
            'productId': productId,
            'categoryId': categoryId,
            'name': name,
            'newPrice': newPrice,
            'oldPrice': oldPrice,
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
            """
            SELECT products.productId, products.name, products.newPrice, productImages.image, categories.name, kart.quantity
            FROM users, products, kart, categories, productImages
            WHERE users.userId = ? AND users.userId = kart.userId
                AND products.productId = kart.productId
                AND products.categoryId = categories.categoryId
                AND products.productId = productImages.productId
            LIMIT 1
            """,
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
            cur.execute("UPDATE kart SET quantity = ? WHERE productId = ?", (new_quantity, productId,))
            msg = "Quantity updated successfully"
            conn.commit()
            cur.execute(
                '''SELECT products.productId, products.name, products.newPrice, categories.name, kart.quantity 
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
            product = []
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
            price = product[3]
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
            cur.execute("INSERT INTO orderDetails (orderId, productId, quantity, price, address, landmark, city, pincode, state, country, orderDate, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                        (orderId, productId, quantity, price, orderAddress['address'], orderAddress['landmark'], orderAddress['city'], orderAddress['pinCode'], orderAddress['state'], orderAddress['country'], datetime.now(), "Order Placed"))

           
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
            cur.execute("SELECT p.productId, k.quantity, p.newPrice FROM kart as k, products as p WHERE k.productId = p.productId and userId = ?", (userId,))
            cartItems = cur.fetchall()

            cur.execute("INSERT INTO orders (userId, paymentId) VALUES (?, ?)", (userId, paymentId))
            orderId = cur.lastrowid  # Get the ID of the inserted order

            print(cartItems)
            for item in cartItems:
                productId = item[0]
                quantity = item[1]
                price = item[2]
                # ... Retrieve other necessary information for the order

                cur.execute("INSERT INTO orderDetails (orderId ,productId, quantity, price, address, landmark, city, pincode, state, country, orderDate, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ( orderId ,productId, quantity, price, orderAddress['address'], orderAddress['landmark'], orderAddress['city'], orderAddress['pinCode'], orderAddress['state'], orderAddress['country'], datetime.now(), "Order Placed"))
        
            
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
                    SELECT products.productId, products.name, products.description, products.newPrice, categories.name, productImages.image
                    FROM products
                    JOIN categories ON products.categoryId = categories.categoryId
                    JOIN productImages ON products.productId = productImages.productId
                    WHERE products.productId = ?
                    """,
                    (productId,),
                )

                product = cur.fetchone()

                if product is not None:
                    (
                        productId,
                        productName,
                        productDescription,
                        productPrice,
                        categoryName,
                        productImage,
                    ) = product

                    orderItem = {
                        "orderId": orderId,
                        "title": productName,
                        "quantity": quantity,
                        "price": productPrice,
                        "shipping": address,
                        "image": productImage,
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
        # print(productId)
        review = data["review"]
        rating = data["rating"]
        userId = current_user["userId"]

        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                INSERT INTO productReviews (productId, userId, review, rating)
                VALUES (?, ?, ?, ?)
                """,
                (productId, userId, review, rating),
            )

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

        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                DELETE FROM productReviews
                WHERE productId = ? AND userId = ?
                """,
                (productId, userId),
            )

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

            accountBalance = round(random.uniform(10000, 100000), 2)

            cur.execute(
                "INSERT INTO sellerAccounts (sellerId, accountNumber, accountHolderName, accountBalance, bankName, branchName, ifscCode) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (seller_id, accountNumber, accountHolderName, accountBalance, bankName, branchName, ifscCode),
            )

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


@app.route(authRoute + "/seller/login/", methods=["POST"])
def sellerLogin():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    print(email)

    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM sellers WHERE email = ?", (email,))
        user = cur.fetchone()
        if user is None:
            return jsonify({"message": "Invalid credentials"}), 400
        else:
            db_password = user[4]  # Assuming password hash is stored in the 4th column
            salt = user[5]  # Assuming salt is stored in the 6th column

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
                return jsonify({"token": token, "sellerId": user[0], "email": email, "firstName": user[1], "lastName": user[2]}), 200
            else:
                return jsonify({"message": "Password is incorrect"}), 400    




sellerRoute = "/api/seller"

@app.route(sellerRoute + "/dashboard/", methods=["GET"])
@token_required
def getSellerDashboard(current_user):
    userId = current_user["userId"]
    print(userId)
    try:
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                select sum(p.newPrice) from users as u join orders as o join orderDetails as od join products as p where o.orderId = od.orderId and u.userId = o.userId and od.productId = p.productId and p.sellerId = ?
                """, (userId,)
                )

            totalRevenue = cur.fetchone()[0]

            cur.execute(
                """ 
                select count(o.orderId) from orders as o join orderDetails as od join products as p where o.orderId = od.orderId and od.productId = p.productId and p.sellerId = ?
                """, (userId,)
            )

            totalOrders = cur.fetchone()[0]

            cur.execute(
                """
                 select count(o.orderId) from orders as o join orderDetails as od join products as p where o.orderId = od.orderId and od.productId = p.productId and od.orderStatus = 'Order Placed' and p.sellerId = ?
                """, (userId,)
            )

            pendingOrders = cur.fetchone()[0]

            cur.execute(
                """
                select count(od.productId) from orders as o, orderDetails as od where o.orderId = od.orderId and od.productId in (select productId from products where sellerId = ?);
                """, (userId,)
            )

            totalCustomers = cur.fetchone()[0]

            cur.execute(
                """
                SELECT p.name, i.image as image
                FROM products p
                JOIN productImages i ON p.productId = i.productId
                WHERE p.sellerId = ?
                GROUP BY p.productId;
                """, (userId,)
            )
            
            latestProducts = cur.fetchall()

            cur.execute (
                """
                SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.price, od.orderStatus ,od.productId FROM users as u JOIN orders AS o JOIN orderDetails AS od JOIN products as p WHERE o.orderId = od.orderId and u.userId = o.userId and od.productId = p.productId and p.sellerId = ?;
                """, (userId,)

            )

            orders = cur.fetchall()

            

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
                query = """
                    SELECT SUM(p.newPrice) AS totalSales
                    FROM orders AS o
                    JOIN orderDetails AS od ON o.orderId = od.orderId
                    JOIN products AS p ON od.productId = p.productId
                    WHERE od.orderStatus = 'Order Placed' 
                    AND p.sellerId = ?
                    AND strftime('%Y-%m', od.orderDate) = ?
                """
                cur.execute(query, (userId, f'2023-{month_number}'))
                result = cur.fetchone()
                total_sales = result[0] if result[0] is not None else 0
                sales_data.append({'month': month_name, 'sales': total_sales})

            # print(sales_data)

            cur.execute(
                """
                SELECT p.name, count(p.productId)
                FROM orders as o JOIN orderDetails as od JOIN products as p 
                ON o.orderId = od.orderId and od.productId = p.productId
                WHERE p.sellerId = ? group by p.newPrice   
                """, (userId,)
            )

            result = cur.fetchall()
            

            product_counts = [{'name': row[0], 'value': row[1]} for row in result]


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
                    "productCounts": product_counts,
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
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """ 
                select count(o.orderId) from orders as o join orderDetails as od join products as p where o.orderId = od.orderId and od.productId = p.productId and p.sellerId = ?
                """, (userId,)
            )

            totalOrders = cur.fetchone()[0]

            cur.execute(
                """
                 select count(o.orderId) from orders as o join orderDetails as od join products as p where o.orderId = od.orderId and od.productId = p.productId and od.orderStatus = 'Order Placed' and p.sellerId = ?
                """, (userId,)
            )

            pendingOrders = cur.fetchone()[0]

            cur.execute(
                """
                select count(od.productId) from orders as o, orderDetails as od where o.orderId = od.orderId and od.productId in (select productId from products where sellerId = ?);
                """, (userId,)
            )

            totalCustomers = cur.fetchone()[0]

            cur.execute(
                """
                SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.address || ', ' || od.landmark || ', ' || od.city || '-' || od.pinCode || ', ' || od.state || ', ' || od.country AS address, u.email, od.price, od.orderStatus, od.orderDetailsId FROM users as u JOIN orders AS o JOIN orderDetails AS od JOIN products as p WHERE o.orderId = od.orderId and u.userId = o.userId and od.productId = p.productId and p.sellerId = ?;
                """, (userId,)
            )


            orders = cur.fetchall()

            # today = datetime.date.today()
            cur.execute(
                """
                SELECT COUNT(*) AS orderCount
                FROM users AS u
                JOIN orders AS o
                JOIN orderDetails AS od
                JOIN products AS p
                WHERE o.orderId = od.orderId
                    AND u.userId = o.userId
                    AND od.productId = p.productId
                    AND p.sellerId = ?
                    AND DATE(od.orderDate) = CURRENT_DATE;
                """, (userId,)
            )
            
            todaysOrders = cur.fetchone()

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
    print(orderDetailsId)

    try:
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                UPDATE orderDetails set orderStatus = ? where orderDetailsId = ?;
                """, (orderStatus, orderDetailsId,)
            )

            msg = "Status updated successfully"
            conn.commit()

            cur.execute(
                """
                SELECT o.orderId, u.firstName, u.lastName, p.name, od.orderDate, od.address || ', ' || od.landmark || ', ' || od.city || '-' || od.pinCode || ', ' || od.state || ', ' || od.country AS address, u.email, od.price, od.orderStatus, od.orderDetailsId FROM users as u JOIN orders AS o JOIN orderDetails AS od JOIN products as p WHERE o.orderId = od.orderId and u.userId = o.userId and od.productId = p.productId and p.sellerId = ?;
                """, (userId,)
            )

            orders = cur.fetchall()
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
    print(product_id)
    if product_id != "{id}":
        try:
            with sqlite3.connect("ecart.db") as conn:
                cur = conn.cursor()

                cur.execute(
                    """
                    SELECT c.categoryId, p.productId, p.name, p.newPrice, p.oldPrice, p.ratings, p.description, p.stock, c.name FROM products as p JOIN sellers as s JOIN categories as c WHERE p.sellerId = s.sellerId and p.categoryId=c.categoryId and p.sellerId = ? and p.productId = ?;
                    """, (userId, product_id,)
                )   

                product = cur.fetchone()
                print(product)

                cur.execute(
                    """
                    SELECT image FROM productImages WHERE productId = ?;
                    """, (product_id,)
                )

                images = cur.fetchall()
                imageArray = []
                for image in images:
                    image = image[0] 
                    imageArray.append(image)


                product_obj = {
                    "categoryId": product[0],
                    "productId": product[1],
                    "name": product[2],
                    "newPrice": product[3],
                    "oldPrice": product[4],
                    "ratings": product[5],
                    "description": product[6],
                    "stock": product[7],
                    "categoryName": product[8],
                    "images": imageArray,
                }
                

                return {
                    "message": "Product retrieved successfully",
                    "product": product_obj,
                    "status_code": 200,
                }

        except Exception as e:
            traceback.print_exc()
            return {"message": "Error occurred: " + str(e), "status_code": 500}
    try:
        with sqlite3.connect("ecart.db") as conn:
            cur = conn.cursor()

            cur.execute(
                """
                SELECT c.categoryId, p.productId, p.name, p.newPrice, p.ratings, p.description, p.stock, c.name FROM products as p JOIN sellers as s JOIN categories as c WHERE p.sellerId = s.sellerId and p.categoryId=c.categoryId and p.sellerId = ?;
                """, (userId,)
            )   

            products = cur.fetchall()
            product_objects = []

            for product in products:
                print(product[1])
                cur.execute(
                    """
                    SELECT image FROM productImages WHERE productId = ?;
                    """, (product[1],)
                )

                images = cur.fetchall()  
                
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
                    "image": image,
                }
                
                product_objects.append(product_obj)

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
    with sqlite3.connect('ecart.db') as conn:
        product = request.get_json()
        # print(product["images"])

        cur = conn.cursor()
        try:
            cur.execute('''INSERT INTO products (sellerId ,name, newPrice, oldPrice, ratings, categoryId, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', (userId ,product["itemName"], product["newPrice"], product["oldPrice"], 0, product["categoryId"], product["description"], product["stock"]))

            productId = cur.lastrowid

            for i in range(len(product["images"])):
                cur.execute('''Insert into productImages (productId, image) values (?, ?)''', (productId, product["images"][i]))    
           
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

@app.route(sellerRoute + '/products/', methods=["DELETE"])
@token_required
def deleteProduct(current_user):
    userId = current_user["userId"]
    productId = request.args.get('id')
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            cur.execute('''DELETE FROM products WHERE productId = ? and sellerId = ?''', (productId, userId))
            cur.execute('''DELETE FROM productImages WHERE productId = ?''', (productId,))
            msg = "Deleted successfully"
            conn.commit()
            status_code = 200
        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()

    conn.close()
    return make_response(msg, status_code)

@app.route(sellerRoute + '/products/', methods=["PATCH"])
@token_required
def updateProduct(current_user):
    userId = current_user["userId"]
    product_id = request.args.get('id')
    with sqlite3.connect('ecart.db') as conn:
        product = request.get_json()
        cur = conn.cursor()
        try:
            cur.execute('''UPDATE products SET name = ?, newPrice = ?, oldPrice = ?, categoryId = ?, description = ?, stock = ? WHERE productId = ? and sellerId = ?''', (product["itemName"], product["newPrice"], product["oldPrice"], product["categoryId"], product["description"], product["stock"], product_id, userId))

            
            cur.execute("DELETE FROM productImages WHERE productId = ?", (product_id,))
            for image in product["images"]:
                cur.execute("INSERT INTO productImages (productId, image) VALUES (?, ?)", (product_id, image))
            msg = "Updated successfully"
            conn.commit()
            status_code = 200
        except:
            conn.rollback()
            msg = "Error occurred"
            status_code = 500
            traceback.print_exc()

    conn.close()
    return make_response(msg, status_code)





if __name__ == "__main__":
    app.run()

