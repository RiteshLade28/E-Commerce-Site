or product in allProducts:
# 	cur = conn.cursor()
# 	cur.execute('''INSERT INTO products (name, price, ratings, image, categoryId, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)''', (product["itemName"], product["price"], product["ratings"], product["image"], product["categoryId"], product["description"], product["stock"]) )
# 	conn.commit()
# 	msg="added successfully"
# 	print(msg)