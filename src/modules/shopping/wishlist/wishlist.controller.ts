import { Controller } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('shopping/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}
}
