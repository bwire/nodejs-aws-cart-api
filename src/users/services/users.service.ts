import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

import { v4 } from 'uuid';

import { User } from '../models';

@Injectable()
export class UsersService {
  async findOne(name: string): Promise<User>{
    const client = new Client();
    await client.connect();

    try {
      const result = await client.query({
        text: 'SELECT * FROM users WHERE name = $1', 
        values: [name],
      });

      if (result['rows'].length === 0) {
        return undefined;
      }

      const data = result['rows'][0];

      return {
        id: data.id,
        name,
      }
    } catch (error) {
      console.log('DB operation error', error);
    } finally {
      client.end();
    }
  }

  async createOne({ name }: User): Promise<User> {
    const client = new Client();
    await client.connect();

    try {
      const userId = v4();
      await client.query({
        text: 'INSERT INTO users(id, name) VALUES($1, $2)', 
        values: [userId, name],
      });

      return {
        id: userId,
        name,
      }
    } catch (error) {
      console.log('DB operation error', error);
    } finally {
      client.end();
    }
  }

}
