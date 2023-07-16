CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE 
);

CREATE TYPE statuses AS ENUM ('OPEN', 'ORDERED');

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at timestamp DEFAULT current_timestamp,
  updated_at DATE NOT NULL,
  status statuses
);

CREATE FUNCTION update_updated_at_carts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER after_cart_update
  BEFORE UPDATE ON carts
  FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_carts();

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id UUID NOT NULL,
  product_id UUID NOT NULL,
  count INT,
  CONSTRAINT fk_carts_items_carts
    FOREIGN KEY(cart_id) 
    REFERENCES carts(id) 
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  cart_id UUID NOT NULL,
  payment JSONB,
  delivery JSONB,
  comments TEXT,
  status TEXT,
  total NUMERIC,
  CONSTRAINT fk_orders_carts
    FOREIGN KEY(cart_id) 
    REFERENCES carts(id) 
);

-- test data (just example)
INSERT INTO users (id, name) VALUES ('06e75a54-4ee8-4254-9ae5-de22e8ba3f88', 'bwire');
INSERT INTO carts (id, user_id, status) VALUES ('9e65e095-a037-4686-a002-64b086c23304', '06e75a54-4ee8-4254-9ae5-de22e8ba3f88', 'OPEN');
INSERT INTO cart_items (cart_id, product_id, count) VALUES ('9e65e095-a037-4686-a002-64b086c23304', '7567ec4b-b10c-48c5-9345-fc73c48a80aa', 1);
INSERT INTO cart_items (cart_id, product_id, count) VALUES ('9e65e095-a037-4686-a002-64b086c23304', '7567ec4b-b10c-48c5-9345-fc73c48a80a0', 2);


