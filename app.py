from markupsafe import escape
import sqlite3
from flask import Flask, abort, render_template, make_response, jsonify, request
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)


route = "/api"

@app.route(route + '/products/')
def getProducts():
    productId = request.args.get('id')
    if productId:
        with sqlite3.connect('ecart.db') as conn:
            cur = conn.cursor()
            cur.execute('SELECT p.productId, p.name, p.price, p.image, c.categoryId, c.name FROM products p INNER JOIN categories c ON p.categoryId = c.categoryId WHERE p.productId = ?', (productId,))
            itemData = cur.fetchall()

        if itemData:
            productId, name, price, image, categoryId, categoryName = itemData[0]
            product = {
                'productId': productId,
                'categoryId': categoryId,
                'name': name,
                'price': price,
                'image': image
            }
            return jsonify(product)
        # else:
        #     return jsonify({})  # Return an empty response if the product is not found

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
def addProduct():
    new_quantity = request.headers.get('quantity')
    with sqlite3.connect('ecart.db') as conn:
        product = request.get_json()
        print(product["itemName"])
        cur = conn.cursor()
        try:
            # If the product doesn't exist, add a new entry with quantity 1
            cur.execute('''INSERT INTO products (name, price, image, categoryId) VALUES (?, ?, ?, ?)''', (product["itemName"], product["price"], product["image"], product["categoryId"],))
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

@app.route(route + '/cartItems/')
def cartItems():
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT products.productId, products.name, products.price, products.image, categories.name, kart.quantity FROM products, kart, categories WHERE products.productId = kart.productId AND products.categoryId = categories.categoryId"
        )
        products = cur.fetchall()

    totalPrice = 0
    totalItems = 0
    for row in products:
        quantity = row[5]
        totalPrice += row[2] * quantity
        totalItems += row[5]

    formattedData = []
    for item in products:
        productId, name, price, image, categoryName, quantity = item
        formattedData.append({
            'productId': productId,
            'itemName': name,
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

@app.route(route + "/cartItem", methods=["OPTIONS"])
def handleCartItemOptions():
    response = jsonify({})
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@app.route(route + "/cartItem", methods=["POST"])
def addToCart():
    productId = request.args.get('id')
    print(productId)
    with sqlite3.connect('ecart.db') as conn:
        cur = conn.cursor()
        try:
            # Check if the product already exists in the cart
            cur.execute("SELECT productId, quantity FROM kart WHERE productId = ?", (productId,))
            existing_product = cur.fetchone()

            if existing_product:
                # If the product already exists, update the quantity by 1
                new_quantity = existing_product[1] + 1
                cur.execute("UPDATE kart SET quantity = ? WHERE productId = ?", (new_quantity, productId))

                msg = "Quantity updated successfully"
            else:
                # If the product doesn't exist, add a new entry with quantity 1
                cur.execute("INSERT INTO kart (productId, quantity) VALUES (?, ?)", (productId, 1))
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
def removeFromCart():
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
def updateQuantity():
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

    

if __name__ == "__main__":
    app.run()

