CREATE DATABASE IF NOT EXISTS practice;
USE practice;


CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock INT
);

INSERT INTO products VALUES
(1, 'Laptop',       'Electronics', 65000, 10),
(2, 'Smartphone',   'Electronics', 30000, 25),
(3, 'Headphones',   'Electronics',  2500, 40),
(4, 'Keyboard',     'Accessories',  1500, 50),
(5, 'Mouse',        'Accessories',   800, 60),
(6, 'Monitor',      'Electronics', 12000, 15),
(7, 'Backpack',     'Bags',          1800, 30),
(8, 'Shoes',        'Fashion',       3500, 20);


CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    city VARCHAR(50)
);

INSERT INTO customers VALUES
(101, 'Ravi',    'Hyderabad'),
(102, 'Priya',   'Bangalore'),
(103, 'Arjun',   'Chennai'),
(104, 'Sneha',   'Hyderabad'),
(105, 'Rahul',   'Mumbai');

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    status VARCHAR(20),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO orders VALUES
(1001, 101, '2026-09-01', 'Delivered'),
(1002, 102, '2026-09-02', 'Delivered'),
(1003, 101, '2026-09-05', 'Pending'),
(1004, 103, '2026-09-07', 'Shipped'),
(1005, 104, '2026-09-10', 'Delivered'),
(1006, 105, '2026-09-12', 'Cancelled'),
(1007, 102, '2026-09-15', 'Delivered');


CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO sales VALUES
(1,  1001, 1, 1),   -- Laptop
(2,  1001, 3, 2),   -- Headphones

(3,  1002, 2, 1),   -- Smartphone
(4,  1002, 5, 2),   -- Mouse

(5,  1003, 6, 1),   -- Monitor
(6,  1003, 4, 1),   -- Keyboard

(7,  1004, 8, 2),   -- Shoes

(8,  1005, 7, 1),   -- Backpack
(9,  1005, 5, 1),   -- Mouse

(10, 1006, 1, 1),   -- Laptop

(11, 1007, 2, 2),   -- Smartphone
(12, 1007, 3, 1);   -- Headphones


SELECT EXTRACT(year from order_date) as od
FROM orders;

