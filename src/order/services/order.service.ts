import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { Client } from 'pg';
import { Order } from '../models';
import { CartService, OrderStatus } from 'src/cart';

@Injectable()
export class OrderService {
  private cartService: CartService = new CartService();

  async getAll(): Promise<Order[]> {
    const client = new Client();
    await client.connect();

    try {
      const result = await client.query(
        'SELECT * from orders'
      );

      if (result.rows.length === 0) {
        return undefined;
      }

      const orderData = result.rows[0];

      // assume that it can be only one order, since it refers to just one cart
      // and we don't refresh the cart
      const cart = await this.cartService.findByUserId(orderData.user_id);
      
      return result.rows.map(order => ({
        ...order,
        items: cart.items,
        statusHistory: [],
        address: order.delivery.address,
      }));
    } catch (error) {
      console.log('DB operation error', error);  
    } finally {
      client.end();
    }
  }

  async getOne(id: string): Promise<Order> {
    const client = new Client();
    await client.connect();

    try {
      const result = await client.query({
        text: 'SELECT * from orders WHERE id = $1',
        values: [id],
      });

      if (result.rows.length === 0) {
        return undefined;
      }

      const orderData = result.rows[0];

      // assume that it can be only one order, since it refers to just one cart
      // and we don't refresh the cart
      const cart = await this.cartService.findByUserId(orderData.user_id);
      
      return {
        ...orderData,
        items: cart.items.map(item => ({
          productId: item.product.id,
          count: item.count,
        })),
        address: orderData.delivery.address,
      };
    } catch (error) {
      console.log('DB operation error', error);  
    } finally {
      client.end();
    }
  }

  async create(data: any): Promise<Order> {
    const client = new Client();
    await client.connect();
    const { userId, cartId, items, address, total } = data;
    const { comment, ...restAddress } = address;

    try {
      const orderId = v4();

      await client.query('BEGIN');
      const result = await client.query({
        text: 'INSERT INTO orders (id, user_id, cart_id, delivery, comments, status, total) \
              VALUES($1, $2, $3, $4, $5, $6, $7)', 
        values: [orderId, userId, cartId, { type: 'HOME', address: restAddress }, comment, OrderStatus.ORDERED, total],
      });

      await client.query({
        text: 'UPDATE carts SET status = $1 WHERE id = $2', 
        values: [OrderStatus.ORDERED, cartId],
      }); 

      await client.query('COMMIT');

      return {
        id: orderId,
        userId,
        cartId,
        items,
        comments: comment,
        status: OrderStatus.ORDERED,
        total  
      };
    } catch (error) {
      console.log('DB operation error', error);  
    } finally {
      client.end();
    }
  }

  async updateOrder(id: string, data: { status: string, comment: string }): Promise<Order> { 
    const client = new Client();
    await client.connect();
    const { status, comment } = data;
    
    try {
      await client.query({
        text: 'UPDATE orders SET comments = $2, status = $3 WHERE id = $1', 
        values: [id, comment, status ],
      });

      return await this.getOne(id);
    } catch (error) {
      console.log('DB operation error', error);  
    } finally {
      client.end();
    }
  } 

  async deleteOrder(id: string): Promise<void> { 
    const client = new Client();
    await client.connect();
  
    try {
      await client.query({
        text: 'DELETE FROM orders WHERE id = $1', 
        values: [ id ],
      });
    } catch (error) {
      console.log('DB operation error', error);  
    } finally {
      client.end();
    }
  } 
}
