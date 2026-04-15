-- Bendito Cafe POS Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  variable_price BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pagado', -- pagado, pendiente
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'entregado', -- pendiente, preparando, listo, entregado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Stored here to preserve history if product changes
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO products (name, price, category, variable_price) VALUES
('Espresso', 15.00, 'Café', FALSE),
('Americano', 18.00, 'Café', FALSE),
('Cappuccino', 22.00, 'Café', FALSE),
('Latte', 24.00, 'Café', FALSE),
('Mocaccino', 26.00, 'Café', FALSE),
('Iced Latte', 25.00, 'Bebidas Frías', FALSE),
('Frappé Oreo', 30.00, 'Frappes', FALSE),
('Frappé Moka', 30.00, 'Frappes', FALSE),
('Açaí', 0.00, 'Açaí', TRUE),
('Té Matcha', 20.00, 'Té', FALSE),
('Croissant', 15.00, 'Panadería', FALSE),
('Alfajor', 12.00, 'Panadería', FALSE);

-- Enable Realtime for orders
alter publication supabase_realtime add table orders;
