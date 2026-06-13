import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccessControlModule } from './access-control/access-control.module';
import { SellersModule } from './sellers/sellers.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShoppingModule } from './shopping/shopping.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { FinanceModule } from './finance/finance.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CurrencyModule } from './currency/currency.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AccessControlModule,
    SellersModule,
    CatalogModule,
    InventoryModule,
    ShoppingModule,
    OrdersModule,
    PaymentsModule,
    FinanceModule,
    DeliveryModule,
    PromotionsModule,
    ReviewsModule,
    CurrencyModule,
    IntegrationsModule,
    NotificationsModule,
  ],
  exports: [
    AuthModule,
    UsersModule,
    AccessControlModule,
    SellersModule,
    CatalogModule,
    InventoryModule,
    ShoppingModule,
    OrdersModule,
    PaymentsModule,
    FinanceModule,
    DeliveryModule,
    PromotionsModule,
    ReviewsModule,
    CurrencyModule,
    IntegrationsModule,
    NotificationsModule,
  ],
})
export class ModulesModule {}
