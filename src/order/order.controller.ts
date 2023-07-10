import { Body, Controller, Delete, Get, HttpStatus, Param, Put, Req, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '.';
import { AppRequest } from '../shared';

@Controller('api/profile/orders')
export class OrderController {
  constructor(
    private orderService: OrderService
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Req() req: AppRequest) {
    const result = await this.orderService.getAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { result },
    }
  } 

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  async getOne(@Req() req: AppRequest, @Param('id') id) {
    const order = await this.orderService.getOne(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { ...order },
    }
  } 

  @UseGuards(BasicAuthGuard)
  @Put(':id/status')
  async updateOrder(@Param('id') id, @Body() body) {
    const order = await this.orderService.updateOrder(id, body);
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { ...order },
    }
  } 

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteOrder(@Param('id') id) {
    await this.orderService.deleteOrder(id);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'OK',
    }
  } 
}
