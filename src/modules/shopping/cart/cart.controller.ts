import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('shopping/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
}
