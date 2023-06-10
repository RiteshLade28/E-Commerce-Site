import sqlite3

allProducts =  [
    {
        "categoryId": 1, 
        "itemName": "Mobile",
        "price": 10000,
        "ratings": 4.5,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1KdhxxNo9tu4SRc2T9iYmjupEDjif_ldwlTzuc0bcNUpKUfj6khn1C70MhG8E57ph_Z4&usqp=CAU",
        "description": "This is a mobile phone iPhone 14.  It has rounded display corners that follow a beautiful curved design, and these corners are within a standard rectangle. When measured as a standard rectangular shape, the screen is 6.06 inches diagonally (actual viewable area is less).",
        "stock": 10
    },
    {
        "categoryId": 1, 
        "itemName": "Headphone",
        "price": 1000,
	    "ratings": 4,
        "image": "https://www.skullcandy.in/wp-content/uploads/2021/07/Riff_S5PXY-L003_Black_Hero_v007.jpg", 
        "description": "This is a headphone. Meet our newest (and smallest) true wireless earbuds: Dime™. With exceptional sound quality, simple controls and a super-affordable price point, these little buds are poised to create some big noise in the market.",
        "stock": 10
    },
    {
        "categoryId": 1, 
        "itemName": "Charger",
        "price": 500,
        "ratings": 3.5,
        "image": "https://m.media-amazon.com/images/I/61CvDggHJmL.jpg",
        "description": "This is a charger. Charging Cable Not Included. Compatible With All Standard Usb Type-C Cables Such As Usb-C To Usb-C, Usb-C To Lightning And Etc. For Optimum Results, Please Use With Authentic Samsung Cables Which Can Be Purchased Separately Enjoy The Flexibility Enabled By Usb-C Compatible Cables. You Can Alternate The Types Of Cables To Charge A Variety Of Mobile Devices That You Own. Just Plug In A Cable ?? There'S No Need To Change The Adapter Plugged Into Your Wall Outlet",
	    "stock": 10
    },
    {
        "categoryId": 1, 
        "itemName": "Laptop",
        "price": 100000,
	    "ratings": 5,
        "image": "https://www.lenovo.com/medias/lenovo-laptop-legion-5-15-intel-subseries-hero.png?context=bWFzdGVyfHJvb3R8MzA2MjM2fGltYWdlL3BuZ3xoOGUvaDI2LzE0MzMyNjk1MzE0NDYyLnBuZ3w0NTQ5M2UyMWNkNjIyYmEzNmI0MWM0YTU4MjM0YjcxZmZhNTAxZThiZWE2OTUwNDJjOTQ2MDI3NWY3YzA3NzNm",
	    "description": "This is a laptop Lenovo Legion 5, It is a Windows 10 Home laptop with a 15.60-inch display that has a resolution of 1920x1080 pixels. It is powered by a Ryzen 5 processor and it comes with 4GB of RAM. The Lenovo Legion 5 packs 1TB of HDD storage and 256GB of SSD storage. Graphics are powered by Nvidia GeForce GTX 1650 Ti. Connectivity options include Wi-Fi 802.11 Yes, Bluetooth and it comes with 4 USB ports (2 x USB 3.2 Gen 1 (Type A), 1 x USB 3.2 Gen 1 (Type C), 1 x USB 3.2 Gen 2 (Type A), 1 x HDMI Port, Headphone and Mic Combo Jack, RJ45 (LAN) ports.",
	    "stock": 10
    },
    {
        "categoryId": 1, 
        "itemName": "Fan",
        "price": 2500,
        "image": "https://cdn.moglix.com/p/3we7mCoJz4PXz.jpg",
        "ratings": 3.5,
        "description": "The Atomberg Renesa+ 140cm Sweep 3 Blade Ceiling Fan assists you with remaining cool and agreeable consistently. Everything we do at Atomberg is centered around our core belief “Why not?”. Why not use smart technology to make lives easier and better? Why not work towards an energy-efficient future? The Renesa+ is built on that belief. All our fans are powered by BLDC technology: Brushless Direct Current. This means that they consume only 28 to 32 watts while running at the highest speed. Which in turn means that you can save up to Rs.1500 per fan per year on your electricity bills! It doesn’t end there. It runs almost three times longer on an inverter. It can be easily operated by a smart remote which has boost, sleep, and timer mode. It is just what your smart home deserves.",
        "stock": 10
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

conn.execute('''CREATE TABLE products
		(productId INTEGER PRIMARY KEY,
		name TEXT,
		price REAL,
		ratings REAL,
		image TEXT,
		categoryId INTEGER,
        description TEXT,
        stock INTEGER,
		FOREIGN KEY(categoryId) REFERENCES categories(categoryId)
		)''')

# conn.execute('''CREATE TABLE categories
# 		(categoryId INTEGER PRIMARY KEY,
# 		name TEXT
# 		)''')


# conn.execute('''CREATE TABLE kart
# 		(productId INTEGER,
#         quantity INTEGER,
# 		FOREIGN KEY(productId) REFERENCES products(productId)
# 		)''')

for product in allProducts:
	cur = conn.cursor()
	cur.execute('''INSERT INTO products (name, price, ratings, image, categoryId, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)''', (product["itemName"], product["price"], product["ratings"], product["image"], product["categoryId"], product["description"], product["stock"]) )
	conn.commit()
	msg="added successfully"
	print(msg)

# for item in cartItems:
#     cur = conn.cursor()
#     cur.execute('''INSERT INTO kart (productId, quantity) VALUES (?, ?)''', (item["productId"], item["quantity"]))
#     conn.commit()
#     msg="added successfully"
#     print(msg)

conn.close()