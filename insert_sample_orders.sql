-- Script SQL untuk menambahkan sample orders ke database
-- Pastikan tabel orders dan order_items sudah ada sebelum menjalankan script ini
-- Juga pastikan ada user dengan profile yang sudah dibuat

-- Ambil user_id dari profiles table (ganti dengan user_id yang sesuai)
-- Untuk demo, kita akan menggunakan user pertama yang ada
DO $$
DECLARE
    sample_user_id uuid;
    order_1_id uuid;
    order_2_id uuid;
    order_3_id uuid;
    product_1_id uuid;
    product_2_id uuid;
    product_3_id uuid;
BEGIN
    -- Ambil user_id pertama dari profiles
    SELECT id INTO sample_user_id FROM profiles WHERE role = 'customer' LIMIT 1;
    
    -- Jika tidak ada customer, buat sample user
    IF sample_user_id IS NULL THEN
        -- Insert sample user ke auth.users terlebih dahulu (ini harus dilakukan manual di Supabase Auth)
        -- Untuk sekarang, kita skip dan gunakan admin sebagai sample
        SELECT id INTO sample_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
    END IF;
    
    -- Ambil beberapa product_id untuk sample orders
    SELECT id INTO product_1_id FROM products WHERE name LIKE '%Nike%' LIMIT 1;
    SELECT id INTO product_2_id FROM products WHERE name LIKE '%Adidas%' OR name LIKE '%Air Jordan%' LIMIT 1;
    SELECT id INTO product_3_id FROM products WHERE name LIKE '%Uniqlo%' OR name LIKE '%Stone Island%' LIMIT 1;
    
    -- Jika tidak ada produk, gunakan produk pertama yang ada
    IF product_1_id IS NULL THEN
        SELECT id INTO product_1_id FROM products LIMIT 1;
    END IF;
    IF product_2_id IS NULL THEN
        SELECT id INTO product_2_id FROM products OFFSET 1 LIMIT 1;
    END IF;
    IF product_3_id IS NULL THEN
        SELECT id INTO product_3_id FROM products OFFSET 2 LIMIT 1;
    END IF;
    
    -- Order 1: Delivered order
    INSERT INTO orders (
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        phone,
        notes,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        sample_user_id,
        'ORD-20240115-001',
        'delivered',
        1299000,
        'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110',
        '+62812345678',
        'Tolong kirim dengan bubble wrap',
        '2024-01-15 10:30:00+07',
        '2024-01-18 14:20:00+07'
    ) RETURNING id INTO order_1_id;
    
    -- Order items untuk order 1
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_brand,
        product_price,
        selected_size,
        selected_color,
        quantity,
        subtotal,
        created_at
    ) VALUES (
        order_1_id,
        product_1_id,
        'Nike Air Force 1 Low',
        'Nike',
        1299000,
        '42',
        'White',
        1,
        1299000,
        '2024-01-15 10:30:00+07'
    );
    
    -- Order 2: Shipped order
    INSERT INTO orders (
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        phone,
        notes,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        sample_user_id,
        'ORD-20240110-002',
        'shipped',
        2100000,
        'Jl. Gatot Subroto No. 456, Jakarta Selatan, DKI Jakarta 12190',
        '+62812345678',
        'Pengiriman express',
        '2024-01-10 14:15:00+07',
        '2024-01-12 09:45:00+07'
    ) RETURNING id INTO order_2_id;
    
    -- Order items untuk order 2
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_brand,
        product_price,
        selected_size,
        selected_color,
        quantity,
        subtotal,
        created_at
    ) VALUES (
        order_2_id,
        product_2_id,
        'Air Jordan 1 Retro High OG',
        'Air Jordan',
        2100000,
        '43',
        'Black/Red',
        1,
        2100000,
        '2024-01-10 14:15:00+07'
    );
    
    -- Order 3: Processing order (multiple items)
    INSERT INTO orders (
        id,
        user_id,
        order_number,
        status,
        total_amount,
        shipping_address,
        phone,
        notes,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        sample_user_id,
        'ORD-20240120-003',
        'processing',
        598000,
        'Jl. Thamrin No. 789, Jakarta Pusat, DKI Jakarta 10310',
        '+62812345678',
        'Mohon dikemas dengan rapi',
        '2024-01-20 16:45:00+07',
        '2024-01-20 16:45:00+07'
    ) RETURNING id INTO order_3_id;
    
    -- Order items untuk order 3 (2 items)
    INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        product_brand,
        product_price,
        selected_size,
        selected_color,
        quantity,
        subtotal,
        created_at
    ) VALUES 
    (
        order_3_id,
        product_3_id,
        'Uniqlo Airism T-Shirt',
        'Uniqlo',
        149000,
        'L',
        'Navy',
        2,
        298000,
        '2024-01-20 16:45:00+07'
    ),
    (
        order_3_id,
        product_1_id,
        'Nike Air Force 1 Low',
        'Nike',
        300000,
        '41',
        'Black',
        1,
        300000,
        '2024-01-20 16:45:00+07'
    );
    
    RAISE NOTICE 'Sample orders created successfully for user_id: %', sample_user_id;
END $$;

-- Verifikasi data yang telah diinsert
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'ORD-2024%'
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at
ORDER BY o.created_at DESC;

-- Tampilkan detail order items
SELECT 
    o.order_number,
    oi.product_name,
    oi.product_brand,
    oi.selected_size,
    oi.quantity,
    oi.subtotal
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number LIKE 'ORD-2024%'
ORDER BY o.created_at DESC, oi.product_name;