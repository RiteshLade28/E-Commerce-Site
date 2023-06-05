from markupsafe import escape
from flask import Flask, abort, render_template, make_response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

route = "/api"

items = [
    {
        "category": "Electronics", 
        "itemName": "Mobile",
        "quantity": 1,
        "price": 10000,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1KdhxxNo9tu4SRc2T9iYmjupEDjif_ldwlTzuc0bcNUpKUfj6khn1C70MhG8E57ph_Z4&usqp=CAU"
    },
    {
        "category": "Electronics", 
        "itemName": "Headphone",
        "quantity": 1,
        "price": 1000,
        "image": "https://www.skullcandy.in/wp-content/uploads/2021/07/Riff_S5PXY-L003_Black_Hero_v007.jpg"
    },
]

products = [
    {
        "id": 1,
        "category": "Electronics", 
        "itemName": "Mobile",
        "price": 10000,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1KdhxxNo9tu4SRc2T9iYmjupEDjif_ldwlTzuc0bcNUpKUfj6khn1C70MhG8E57ph_Z4&usqp=CAU"
    },
    {
        "id": 2,
        "category": "Electronics", 
        "itemName": "Headphone",
        "price": 1000,
        "image": "https://www.skullcandy.in/wp-content/uploads/2021/07/Riff_S5PXY-L003_Black_Hero_v007.jpg"
    },
    {
        "id": 3,
        "category": "Electronics", 
        "itemName": "Charger",
        "price": 500,
        "image": "https://m.media-amazon.com/images/I/61CvDggHJmL.jpg"
    },
    {
        "id": 4,
        "category": "Electronics", 
        "itemName": "Laptop",
        "price": 100000,
        "image": "https://www.lenovo.com/medias/lenovo-laptop-legion-5-15-intel-subseries-hero.png?context=bWFzdGVyfHJvb3R8MzA2MjM2fGltYWdlL3BuZ3xoOGUvaDI2LzE0MzMyNjk1MzE0NDYyLnBuZ3w0NTQ5M2UyMWNkNjIyYmEzNmI0MWM0YTU4MjM0YjcxZmZhNTAxZThiZWE2OTUwNDJjOTQ2MDI3NWY3YzA3NzNm"
    },
    {
        "id": 5,
        "category": "Electronics", 
        "itemName": "Fan",
        "price": 2500,
        "image": "https://cdn.moglix.com/p/3we7mCoJz4PXz.jpg"
    }
]


@app.route(route + '/products/')
def getProducts():
    return make_response(jsonify(products))

@app.route(route + '/cartItems/')
def cartItems():
    return make_response(jsonify(items))

@app.route('/cart/')
def cart():
    return render_template('cart.html')

@app.route('/addItem/')
def addItem():
    return '<h1>Item added to cart</h1>'

@app.route('/removeItem/')
def removeItem():
    return '<h1>Item removed from cart</h1>'

@app.route('/productDes/<int:product_id>/')
def showProductDescription(product_id):
    return '<h1>Show product description of product {}</h1>'.format(product_id)

@app.errorhandler(404)
def page_not_found(error):
    return "<h1>404 not found</h1>"