import sqlite3

def run_migration():
    conn = sqlite3.connect('destin8.db')
    cur = conn.cursor()

    columns_to_add = [
        ("packages", "categories", "TEXT DEFAULT '[\"mountains\"]'"),
        ("packages", "gallery_images", "TEXT DEFAULT '[]'"),
        ("bookings", "male_count", "INTEGER DEFAULT 1"),
        ("bookings", "female_count", "INTEGER DEFAULT 0"),
    ]

    for table, col, col_def in columns_to_add:
        try:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
            print(f"Added column {col} to table {table}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col} already exists in {table}")
            else:
                print(f"Notice for {table}.{col}: {e}")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    run_migration()
