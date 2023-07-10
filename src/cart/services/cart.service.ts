import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart-repository';
import { Cart, CartItem } from '../models';

@Injectable()
export class CartService {
  private repository = new CartRepository();

  async findByUserId(userId: string): Promise<Cart> {
    return this.repository.get(userId);
  }

  async createByUserId(userId: string): Promise<Cart> {
    return this.repository.create(userId);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);
    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const cart: Cart = await this.findOrCreateByUserId(userId);

    const newItems = items.reduce((acc, item) => {
      const cartItem = acc.find(({product}) => product.id === item.product.id);

      if (cartItem) {
        cartItem.count = item.count;
      } else {
        acc.push(item);
      }
      return acc;
    }, cart.items);

    const updatedCart = {
      ...cart,
      items: newItems,
    }

    return await this.repository.update(updatedCart);
  }

  async removeByUserId(userId: string): Promise<void> {
    return this.repository.remove(userId);
  }
}
