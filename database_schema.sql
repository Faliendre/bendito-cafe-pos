-- Bendito Cafe POS Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
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
  cash_received DECIMAL(10, 2),
  change_returned DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Stored here to preserve history if product changes
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO products (name, price, category, description, variable_price) VALUES
-- Bebidas Calientes
('Espresso', 10.00, 'Bebidas Calientes', 'La base de todo. Extracción pura de café (20ml).', FALSE),
('Cortado', 10.00, 'Bebidas Calientes', 'Espresso suavizado con leche.', FALSE),
('Americano', 12.00, 'Bebidas Calientes', 'Doble espresso suavemente diluido en agua caliente.', FALSE),
('Flat White', 15.00, 'Bebidas Calientes', 'Doble espresso con leche vaporizada sedosa, más intenso que un latte.', FALSE),
('Cappuccino', 15.00, 'Bebidas Calientes', 'Equilibrio perfecto de espresso, leche vaporizada y abundante espuma.', FALSE),
('Latte', 15.00, 'Bebidas Calientes', 'Espresso suave con una generosa cantidad de leche vaporizada.', FALSE),
('Mocaccino', 15.00, 'Bebidas Calientes', 'Deliciosa mezcla de espresso, chocolate y leche vaporizada.', FALSE),
('Vanilla Latte', 15.00, 'Bebidas Calientes', 'Tu latte favorito con un toque dulce de vainilla.', FALSE),
('Spanish Coffee', 15.00, 'Bebidas Calientes', 'Una versión especial de café con leche, con notas dulces.', FALSE),
('Chocolate Caliente', 15.00, 'Bebidas Calientes', 'Intenso y cremoso chocolate caliente.', FALSE),
('Affogato', 18.00, 'Bebidas Calientes', 'Bola de helado de vainilla "ahogada" en espresso caliente.', FALSE),
('Matcha Latte Caliente', 20.00, 'Bebidas Calientes', 'Suave mezcla de té matcha japonés con leche vaporizada, de sabor delicado y ligeramente herbal.', FALSE),

-- Bebidas Frías
('Iced Tea', 16.00, 'Bebidas Frías', 'Té frío refrescante, ligeramente endulzado y servido con hielo.', FALSE),
('Iced Latte', 16.00, 'Bebidas Frías', 'Espresso con leche fría, servido sobre hielo.', FALSE),
('Iced Mocaccino Latte', 16.00, 'Bebidas Frías', 'Versión fría de nuestro mocaccino, con chocolate y espresso.', FALSE),
('Iced Caramel Latte', 16.00, 'Bebidas Frías', 'Latte frío con un rico toque de dulce de leche.', FALSE),
('Iced Vanilla Latte', 16.00, 'Bebidas Frías', 'Refrescante latte frío con esencia de vainilla.', FALSE),
('Espresso Orange', 16.00, 'Bebidas Frías', 'Espresso con un toque de jugo de naranja.', FALSE),
('Iced Matcha Latte', 26.00, 'Bebidas Frías', 'Refrescante combinación de matcha con leche fría, ligeramente dulce y servido sobre hielo.', FALSE),

-- Té
('Té clásico', 12.00, 'Té', 'Té clásico caliente.', FALSE),
('Té de frutos rojos', 12.00, 'Té', 'Té caliente con sabor a frutos rojos.', FALSE),
('Té de manzanilla / trimate', 12.00, 'Té', 'Infusión caliente de manzanilla o trimate.', FALSE),
('Té de piña', 12.00, 'Té', 'Infusión caliente sabor a piña.', FALSE),

-- Frappes
('Frappuccino', 23.00, 'Frappes', 'Frappé de café frappuccino con leche.', FALSE),
('Frappé Durazno (Leche)', 25.00, 'Frappes', 'Frappé de durazno con leche.', FALSE),
('Frappé Mocca', 23.00, 'Frappes', 'Frappé mocca con café, chocolate y leche.', FALSE),
('Frappé Caramel', 23.00, 'Frappes', 'Frappé de café caramel con leche.', FALSE),
('Frappé Oreo', 26.00, 'Frappes', 'Delicioso frappé con galletas Oreo y leche.', FALSE),
('Frappé Frutos Rojos (Leche)', 25.00, 'Frappes', 'Frappé de frutos rojos con leche.', FALSE),
('Frappé Pie de Limón', 25.00, 'Frappes', 'Novedoso frappé con sabor a pie de limón con leche.', FALSE),
('Frappé Frutos Rojos (Agua)', 20.00, 'Frappes', 'Frappé de frutos rojos a base de agua.', FALSE),
('Frappé Durazno (Agua)', 20.00, 'Frappes', 'Frappé de durazno a base de agua.', FALSE),

-- Cócteles
('Mojito', 25.00, 'Cócteles', 'Con hierba buena.', FALSE),
('Mojito de Frutilla', 25.00, 'Cócteles', 'Con toques de fruta natural.', FALSE),
('Café Irlandés', 25.00, 'Cócteles', 'Café caliente con un toque de whisky irlandés, azúcar y una capa de crema suave.', FALSE),
('Daiquiri de Frutilla', 25.00, 'Cócteles', 'Bebida frappeada de Frutilla con toques de fruta natural.', FALSE),

-- Bebidas Variadas
('Limoncello', 17.00, 'Bebidas Variadas', 'Bebida de limón italiana refrescante.', FALSE),
('Piña con hierba buena', 17.00, 'Bebidas Variadas', 'Licuado o infusión de piña con hierba buena.', FALSE),

-- Açaí
('Açaí', 0.00, 'Açaí', 'Açaí con toppings (precio variable según adiciones).', TRUE),

-- Panadería
('Cuñapé', 8.00, 'Panadería', 'Panecillo de queso tradicional hecho con almidón de yuca.', FALSE),
('Galletas Crumble Cookies', 12.00, 'Panadería', 'Crujientes por fuera, suaves por dentro.', FALSE),
('Cinnamon Roll', 15.00, 'Panadería', 'Rollo de canela con glaseado.', FALSE),
('Panini', 18.00, 'Panadería', 'Sándwich caliente con jamón y queso en pan de masa madre, prensado y dorado, con relleno suave y balanceado, ideal para acompañar tu café.', FALSE),
('Pizzanini', 20.00, 'Panadería', 'Mini pizza elaborada con masa madre, base crujiente y ligera, cubierta con salsa de tomate, orégano, jamón y queso gratinado.', FALSE),
('Sándwich de croissant Salado', 25.00, 'Panadería', 'Croissant, hojaldrado y crujiente, relleno con doble jamón y doble queso fundido, con toques de tomate cherry, ligeramente tostado para resaltar su sabor.', FALSE),
('Sándwich de croissant Dulce', 25.00, 'Panadería', 'Croissant, hojaldrado y crujiente, relleno con dulce de leche, crema y duraznos frescos picados, ligeramente tostado para realzar su dulzura y sabor.', FALSE),
('Creppes', 25.00, 'Panadería', 'Delicada masa francesa preparada al momento, servida con fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', FALSE),
('Waffles', 25.00, 'Panadería', 'Waffle artesanal recién horneado, acompañado de fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', FALSE),
('Panqueques', 25.00, 'Panadería', 'Esponjosos panqueques recién preparados, servidos con fruta fresca de temporada, una porción de helado, crema, jaleas y toppings seleccionados.', FALSE),

-- Extras
('Espresso (Extra)', 3.00, 'Extras', 'Shot de espresso adicional.', FALSE),
('Crema (Extra)', 6.00, 'Extras', 'Crema batida o crema adicional.', FALSE);

-- Enable Realtime for orders
alter publication supabase_realtime add table orders;

-- Expenses Table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- e.g., 'Alquiler', 'Servicios', 'Insumos/Productos', 'Sueldos', 'Otros'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for expenses
alter publication supabase_realtime add table expenses;

-- --- MIGRATIONS FOR UPGRADING EXISTING DB ---
-- Run this in your Supabase SQL Editor:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS cash_received DECIMAL(10, 2);
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS change_returned DECIMAL(10, 2);
