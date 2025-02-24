import { Organisation } from 'src/organisation/entities/organisation.entity';
import { ProductStatus } from '../../lib/enums/product.enums';
import { QuotationItem } from '../../shop/entities/quotation-item.entity';
import { Reseller } from '../../resellers/entities/reseller.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { ProductAnalytics } from './product-analytics.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, AfterInsert, ManyToOne, getRepository, OneToOne } from 'typeorm';

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;

    @Column({ type: 'varchar', nullable: true })
    category: string;

    @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.NEW })
    status: ProductStatus;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    sku: string;

    @Column({ nullable: true })
    warehouseLocation: string;

    @Column({ default: 0 })
    stockQuantity: number;

    @Column({ nullable: false })
    productRef: string;

    @Column({ default: 10 })
    reorderPoint: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salePrice: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    discount: number;

    @Column({ nullable: true })
    barcode: string;

    @Column({ type: 'int', default: 0 })
    packageQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    weight: number;

    @Column({ default: false })
    isOnPromotion: boolean;

    @Column({ type: 'varchar', nullable: true })
    packageDetails: string;

    @Column({ type: 'timestamp', nullable: true })
    promotionStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    promotionEndDate: Date;

    @Column({ type: 'varchar', default: 'unit' })
    packageUnit: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => QuotationItem, quotationItem => quotationItem?.product)
    quotationItems: QuotationItem[];

    @ManyToOne(() => Reseller, reseller => reseller?.products)
    reseller: Reseller;

    @Column({ default: false })
    isDeleted: boolean;

    // Relations
    @ManyToOne(() => Organisation, (organisation) => organisation?.products, { nullable: true })
    organisation: Organisation;

    @ManyToOne(() => Branch, (branch) => branch?.products, { nullable: true })
    branch: Branch;

    @OneToOne(() => ProductAnalytics, analytics => analytics?.product, { cascade: true })
    analytics: ProductAnalytics;

    static generateSKU(category: string, name: string, uid: number, reseller: Reseller): string {
        // Get first 3 letters of category (uppercase)
        const categoryCode = (category || 'XXX').slice(0, 3).toUpperCase();

        // Get first 3 letters of product name (uppercase)
        const nameCode = (name || 'XXX').slice(0, 3).toUpperCase();

        // Get reseller code
        const resellerCode = reseller ? reseller.uid.toString().padStart(3, '0') : '000';

        // Pad the uid with zeros to ensure it's 6 digits
        const paddedUid = uid.toString().padStart(6, '0');

        // Simplified SKU format: CAT-NAME-RESELLER-UID
        return `${categoryCode}-${nameCode}-${resellerCode}-${paddedUid}`;
    }

    @BeforeInsert()
    async generateSKUBeforeInsert() {
        if (!this.sku && this.category && this.name) {
            this.sku = Product.generateSKU(this.category, this.name, 0, this.reseller);
        }
    }

    @AfterInsert()
    async updateSKUWithCorrectUid() {
        const repository = getRepository(Product);
        this.sku = Product.generateSKU(this.category, this.name, this.uid, this.reseller);
        await repository.save(this);
    }
}

