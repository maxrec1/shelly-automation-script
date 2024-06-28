import paho.mqtt.client as mqtt
import json
import mysql.connector

# MQTT Broker details
broker_address = "185.164.4.216"
broker_port = 1883
username = "microdain"
password = "Fenix2017"

# MySQL database details
db_host = "localhost"
db_user = "microdain"
db_password = "Fenix2017"
db_name = "shelly_database1"

def create_table(cursor, table_name):
    print("Creating table:", table_name)
    sql = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country VARCHAR(255),
        city VARCHAR(255),
        day VARCHAR(255),
        date DATE,
        time TIME,
        isHoliday VARCHAR(255),
        isActive VARCHAR(255),
        power FLOAT,
        CO2 FLOAT,
        client VARCHAR(255) DEFAULT NULL,
        location VARCHAR(255) DEFAULT NULL
    )
    """
    print("SQL statement:", sql)
    # Execute SQL statement
    cursor.execute(sql)

def ensure_columns(cursor, table_name):
    columns = ['country', 'client', 'location']
    for column in columns:
        cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE '{column}'")
        result = cursor.fetchone()
        if not result:
            cursor.execute(f"ALTER TABLE {table_name} ADD {column} VARCHAR(255) DEFAULT NULL")

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("+/filtered_data")

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    topic = msg.topic.replace("/", "_")  # Replace '/' with '_' for table name
    print(f"Received message from topic '{msg.topic}': {data}")

    # Remove "_filtered_data" from the topic name
    topic = topic.replace("_filtered_data", "")

    # Connect to MySQL database
    conn = mysql.connector.connect(host=db_host, user=db_user, password=db_password, database=db_name)
    cursor = conn.cursor()

    # Create table if it does not exist
    table_name = topic.replace('-', '_').replace('shellyplusplugs_', '')
    create_table(cursor, table_name)
    ensure_columns(cursor, table_name)

    # Convert power from string to float
    power_value = float(data["power"].replace('Wh', ''))
    co2_value = float(data["CO2"].replace('g', ''))
    time_value = data["time"][:5]  # Truncate the time string to "HH:MM"

    # Insert data into the corresponding table
    sql = f"""
    INSERT INTO {table_name} (country, city, day, date, time, isHoliday, isActive, power, CO2)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    val = (data["country"], data["city"], data["day"], data["date"], time_value, data["isHoliday"], data["isActive"], power_value, co2_value)
    cursor.execute(sql, val)
    conn.commit()

    conn.close()

client = mqtt.Client()
client.username_pw_set(username, password)
client.on_connect = on_connect
client.on_message = on_message

client.connect(broker_address, broker_port, 60)

client.loop_forever()
