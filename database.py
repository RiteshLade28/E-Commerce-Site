import sqlite3

allProducts = [
    {
        "categoryId": 1, 
        "itemName": "Mobile",
        "price": 10000,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1KdhxxNo9tu4SRc2T9iYmjupEDjif_ldwlTzuc0bcNUpKUfj6khn1C70MhG8E57ph_Z4&usqp=CAU"
    },
    {
        "categoryId": 1, 
        "itemName": "Headphone",
        "price": 1000,
        "image": "https://www.skullcandy.in/wp-content/uploads/2021/07/Riff_S5PXY-L003_Black_Hero_v007.jpg"
    },
    {
        "categoryId": 1, 
        "itemName": "Charger",
        "price": 500,
        "image": "https://m.media-amazon.com/images/I/61CvDggHJmL.jpg"
    },
    {
        "categoryId": 1, 
        "itemName": "Laptop",
        "price": 100000,
        "image": "https://www.lenovo.com/medias/lenovo-laptop-legion-5-15-intel-subseries-hero.png?context=bWFzdGVyfHJvb3R8MzA2MjM2fGltYWdlL3BuZ3xoOGUvaDI2LzE0MzMyNjk1MzE0NDYyLnBuZ3w0NTQ5M2UyMWNkNjIyYmEzNmI0MWM0YTU4MjM0YjcxZmZhNTAxZThiZWE2OTUwNDJjOTQ2MDI3NWY3YzA3NzNm"
    },
    {
        "categoryId": 1, 
        "itemName": "Fan",
        "price": 2500,
        "image": "https://cdn.moglix.com/p/3we7mCoJz4PXz.jpg"
    }
]

cartItems = [
    {
        "productId": 1, 
        "quantity": 1
    },
    {
        "productId": 2, 
        "quantity": 1
    },
]

conn = sqlite3.connect("ecart.db")

# conn.execute('''CREATE TABLE products
# 		(productId INTEGER PRIMARY KEY,
# 		name TEXT,
# 		price REAL,
# 		image TEXT,
# 		categoryId INTEGER,
# 		FOREIGN KEY(categoryId) REFERENCES categories(categoryId)
# 		)''')

# conn.execute('''CREATE TABLE categories
# 		(categoryId INTEGER PRIMARY KEY,
# 		name TEXT
# 		)''')


# conn.execute('''CREATE TABLE kart
# 		(productId INTEGER,
#         quantity INTEGER,
# 		FOREIGN KEY(productId) REFERENCES products(productId)
# 		)''')

# for product in allProducts:
# 	cur = conn.cursor()
# 	cur.execute('''INSERT INTO products (name, price, image, categoryId) VALUES (?, ?, ?, ?)''', (product["itemName"], product["price"], product["image"], product["categoryId"],))
# 	conn.commit()
# 	msg="added successfully"
# 	print(msg)

for item in cartItems:
    cur = conn.cursor()
    cur.execute('''INSERT INTO kart (productId, quantity) VALUES (?, ?)''', (item["productId"], item["quantity"]))
    conn.commit()
    msg="added successfully"
    print(msg)

conn.close()