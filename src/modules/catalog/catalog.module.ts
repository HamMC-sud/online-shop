import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { MediaModule } from './media/media.module';
import { AttributesModule } from './attributes/attributes.module';
import { ModerationModule } from './moderation/moderation.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    VariantsModule,
    MediaModule,
    AttributesModule,
    ModerationModule,
  ],
  exports: [
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    VariantsModule,
    MediaModule,
    AttributesModule,
    ModerationModule,
  ],
})
export class CatalogModule {}
