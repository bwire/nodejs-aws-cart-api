import { Client } from 'pg';
import { v4 as uuid } from 'uuid';
import { Cart } from '../models';

export class CartRepository {
  private async getClient(): Promise<Client> {
    const client = new Client();
    await client.connect();
    return client;
  }
  
  async get(userId: string): Promise<Cart> {
    const client = await this.getClient();

    try {
      const cartResult = await client.query({
        text: '\
          SELECT id FROM carts \
          WHERE user_Id = $1',   
        values: [ userId ]
      }); 

      if (cartResult['rows'].length !== 0) {
        const cartId = cartResult['rows'][0]['id'];

        const cartItemsResult = await client.query({
          text: '\
            SELECT \
              p.id product_id, \
              p.title, \
              p.description, \
              p.price, \
              ci.count \
            FROM cart_items ci \
            INNER JOIN products p \
            ON ci.product_id = p.id \
            WHERE cart_Id = $1',   
          values: [ cartId ]
        }); 
        
        return {
          id: cartId,
          items: cartItemsResult['rows'].map(ci => ({
            product: { 
              id: ci.product_id, 
              title: ci.title,
              description: ci.description,
              price: ci.price,
            },
            count: ci.count,
          }))
        };
      }
    } catch(err: any) {
      console.log(err);
    } finally {
      client.end();
    }
  }

  async create(userId: string): Promise<Cart> {
    const client = await this.getClient();
    try {
      const queryText = '\
        INSERT INTO carts(id, user_id, status) \
        VALUES($1, $2, $3)';

      const cartId = uuid();
      const result = await client.query({ 
        text: queryText, 
        values: [ cartId, userId, 'OPEN'],
      });

      return {
        id: cartId,
        items: [],
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      client.end();
    }   
  };

  async update(cart: Cart): Promise<Cart> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');

      await client.query({ 
        text: 'DELETE FROM cart_items WHERE cart_id = $1', 
        values: [cart.id],
      });

      const items = cart.items.filter(item => item.count !== 0);

      const updatePromises = items
        .map(item => client.query({ 
          text: "INSERT INTO cart_items (cart_id, product_id, count) VALUES($1, $2, $3)", 
          values: [cart.id, item.product.id, item.count],
      }));
      
      await Promise.all(updatePromises);
      
      // to invoke update trigger (update updated_at)
      await client.query({ 
        text: "UPDATE carts SET status = $1 WHERE id = $2", 
        values: ['OPEN', cart.id],
      });

      await client.query('COMMIT');

      return {...cart, items};
    } catch (err: any) {
      console.log(err);
    } finally {
      client.end();
    }   
  };

  async remove(userId: string): Promise<void> {
    const client = await this.getClient();
    await client.query({
      text: 'DELETE FROM carts WHERE user_Id = $1',   
      values: [ userId ]
    }); 
  }
}
