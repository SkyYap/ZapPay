-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pricing DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_links table
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_name TEXT NOT NULL,
    payment_link TEXT UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    pricing DECIMAL(10,2) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to generate unique payment link hash
CREATE OR REPLACE FUNCTION generate_payment_link_hash(product_uuid UUID, link_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    -- Combine product_id and link id, then create a hash
    -- Using MD5 for simplicity, but you could use other hash functions
    RETURN 'pay_' || substr(md5(product_uuid::text || link_uuid::text), 1, 16);
END;
$$ LANGUAGE plpgsql;

-- Create index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON payment_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_links_product_id ON payment_links(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_payment_link ON payment_links(payment_link);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this based on your needs)
CREATE POLICY "Allow all operations on products" ON products
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on payment_links" ON payment_links
    FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at 
    BEFORE UPDATE ON payment_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
