import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ViewsHistoryModule } from './views-history/views-history.module';
import { CompareModule } from './compare/compare.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [
    CartModule,
    WishlistModule,
    ViewsHistoryModule,
    CompareModule,
    RecommendationsModule,
  ],
  exports: [
    CartModule,
    WishlistModule,
    ViewsHistoryModule,
    CompareModule,
    RecommendationsModule,
  ],
})
export class ShoppingModule {}
