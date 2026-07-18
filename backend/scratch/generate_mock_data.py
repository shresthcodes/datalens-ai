import csv
import random
from datetime import datetime, timedelta

def generate_mock_data():
    regions = ["North", "South", "East", "West", "Central"]
    categories = {
        "Electronics": ["Smartphone", "Laptop", "Headphones", "Smartwatch", "Tablet"],
        "Furniture": ["Office Chair", "Desk", "Bookshelf", "Sofa", "Dining Table"],
        "Office Supplies": ["Binder", "Paper", "Pens", "Stapler", "Notebook"],
        "Apparel": ["T-Shirt", "Jeans", "Jacket", "Sneakers", "Socks"]
    }
    
    start_date = datetime(2025, 1, 1)
    
    with open("d:/project/retail_sales.csv", mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["order_date", "product_category", "product_name", "revenue", "quantity", "region", "discount", "profit"])
        
        # Generate 150 records
        for i in range(150):
            # Generate date spread out over 2025
            date_val = start_date + timedelta(days=random.randint(0, 360))
            order_date = date_val.strftime("%Y-%m-%d")
            
            # Select category and product
            category = random.choice(list(categories.keys()))
            product = random.choice(categories[category])
            
            # Base price and margin depending on category
            if category == "Electronics":
                base_price = random.uniform(100.0, 1000.0)
                margin = random.uniform(0.15, 0.30)
            elif category == "Furniture":
                base_price = random.uniform(80.0, 500.0)
                margin = random.uniform(0.20, 0.40)
            elif category == "Office Supplies":
                base_price = random.uniform(5.0, 50.0)
                margin = random.uniform(0.30, 0.60)
            else: # Apparel
                base_price = random.uniform(15.0, 120.0)
                margin = random.uniform(0.40, 0.70)
                
            quantity = random.randint(1, 10)
            discount = round(random.choice([0.0, 0.05, 0.1, 0.15, 0.2]), 2)
            
            # Calculate revenue and profit
            revenue = round((base_price * quantity) * (1.0 - discount), 2)
            cost = (base_price * quantity) * (1.0 - margin)
            profit = round(revenue - cost, 2)
            
            region = random.choice(regions)
            
            writer.writerow([order_date, category, product, revenue, quantity, region, discount, profit])

if __name__ == "__main__":
    generate_mock_data()
    print("Mock data generated at d:/project/retail_sales.csv")
