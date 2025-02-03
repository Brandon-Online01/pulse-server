"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const quotation_entity_1 = require("./entities/quotation.entity");
const banners_entity_1 = require("./entities/banners.entity");
const product_enums_1 = require("../lib/enums/product.enums");
const product_entity_1 = require("../products/entities/product.entity");
const typeorm_3 = require("typeorm");
const date_fns_1 = require("date-fns");
const status_enums_1 = require("../lib/enums/status.enums");
const config_1 = require("@nestjs/config");
const email_enums_1 = require("../lib/enums/email.enums");
const event_emitter_1 = require("@nestjs/event-emitter");
const clients_service_1 = require("../clients/clients.service");
const shop_gateway_1 = require("./shop.gateway");
let ShopService = class ShopService {
    constructor(productRepository, quotationRepository, bannersRepository, configService, clientsService, eventEmitter, shopGateway) {
        this.productRepository = productRepository;
        this.quotationRepository = quotationRepository;
        this.bannersRepository = bannersRepository;
        this.configService = configService;
        this.clientsService = clientsService;
        this.eventEmitter = eventEmitter;
        this.shopGateway = shopGateway;
        this.currencyLocale = this.configService.get('CURRENCY_LOCALE') || 'en-ZA';
        this.currencyCode = this.configService.get('CURRENCY_CODE') || 'ZAR';
        this.currencySymbol = this.configService.get('CURRENCY_SYMBOL') || 'R';
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat(this.currencyLocale, {
            style: 'currency',
            currency: this.currencyCode
        })
            .format(amount)
            .replace(this.currencyCode, this.currencySymbol);
    }
    async categories() {
        try {
            const allProducts = await this.productRepository.find();
            if (!allProducts) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const formattedProducts = allProducts.map(product => ({
                ...product,
                price: this.formatCurrency(Number(product.price) || 0)
            }));
            const categories = formattedProducts.map(product => product?.category);
            const uniqueCategories = [...new Set(categories)];
            const response = {
                categories: uniqueCategories,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                categories: null
            };
            return response;
        }
    }
    async getProductsByStatus(status) {
        try {
            const products = await this.productRepository.find({ where: { status } });
            return { products: products ?? null };
        }
        catch (error) {
            return { products: null };
        }
    }
    async specials() {
        const result = await this.getProductsByStatus(product_enums_1.ProductStatus.SPECIAL);
        const response = {
            products: result?.products,
            message: process.env.SUCCESS_MESSAGE,
        };
        return response;
    }
    async getBestSellers() {
        const result = await this.getProductsByStatus(product_enums_1.ProductStatus.BEST_SELLER);
        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        };
        return response;
    }
    async getNewArrivals() {
        const result = await this.getProductsByStatus(product_enums_1.ProductStatus.NEW);
        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        };
        return response;
    }
    async getHotDeals() {
        const result = await this.getProductsByStatus(product_enums_1.ProductStatus.HOTDEALS);
        const response = {
            products: result.products,
            message: process.env.SUCCESS_MESSAGE,
        };
        return response;
    }
    async createQuotation(quotationData) {
        try {
            if (!quotationData?.items?.length) {
                throw new Error('Quotation items are required');
            }
            if (!quotationData?.owner?.uid) {
                throw new Error('Owner is required');
            }
            const clientData = await this.clientsService?.findOne(Number(quotationData?.client?.uid));
            if (!clientData) {
                throw new common_1.NotFoundException(process.env.CLIENT_NOT_FOUND_MESSAGE);
            }
            const { name: clientName } = clientData?.client;
            const internalEmail = this.configService.get('INTERNAL_BROADCAST_EMAIL');
            const productPromises = quotationData?.items?.map(item => this.productRepository.find({ where: { uid: item?.uid }, relations: ['reseller'] }));
            const products = await Promise.all(productPromises);
            const resellerEmails = products
                .flat()
                .map(product => ({
                email: product?.reseller?.email,
                retailerName: product?.reseller?.name
            }))
                .filter(email => email?.email)
                .reduce((unique, item) => {
                return unique?.some(u => u?.email === item?.email)
                    ? unique
                    : [...unique, item];
            }, []);
            const productRefs = new Map(products.flat().map(product => [product.uid, product.productRef]));
            const missingProducts = quotationData?.items?.filter(item => !productRefs.has(item.uid));
            if (missingProducts?.length > 0) {
                throw new Error(`Products not found for items: ${missingProducts.map(item => item.uid).join(', ')}`);
            }
            const newQuotation = {
                quotationNumber: `QUO-${Date.now()}`,
                totalItems: Number(quotationData?.totalItems),
                totalAmount: Number(quotationData?.totalAmount),
                placedBy: { uid: quotationData?.owner?.uid },
                client: { uid: quotationData?.client?.uid },
                status: status_enums_1.OrderStatus.PENDING,
                quotationItems: quotationData?.items?.map(item => ({
                    quantity: Number(item?.quantity),
                    product: { uid: item?.uid },
                    totalPrice: Number(item?.totalPrice),
                    itemCode: productRefs.get(item?.uid)
                }))
            };
            await this.quotationRepository.save(newQuotation);
            this.shopGateway.emitNewQuotation(newQuotation?.quotationNumber);
            const baseConfig = {
                name: clientName,
                quotationId: newQuotation?.quotationNumber,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                total: Number(newQuotation?.totalAmount),
                currency: this.currencyCode,
                quotationItems: quotationData?.items?.map(item => ({
                    quantity: Number(item?.quantity),
                    product: { uid: item?.uid },
                    totalPrice: Number(item?.totalPrice),
                }))
            };
            const clientConfig = {
                ...baseConfig,
            };
            const internalConfig = {
                ...baseConfig,
            };
            const resellerConfigs = resellerEmails?.map(email => ({
                ...baseConfig,
                name: email?.retailerName,
                email: email?.email,
            }));
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.NEW_QUOTATION_INTERNAL, [internalEmail], internalConfig);
            resellerConfigs?.forEach(config => {
                this.eventEmitter.emit('send.email', email_enums_1.EmailType.NEW_QUOTATION_RESELLER, [config?.email], config);
            });
            this.eventEmitter.emit('send.email', email_enums_1.EmailType.NEW_QUOTATION_CLIENT, [clientData?.client?.email], clientConfig);
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async createBanner(bannerData) {
        try {
            const newBanner = this.bannersRepository.create(bannerData);
            const savedBanner = await this.bannersRepository.save(newBanner);
            return {
                banner: savedBanner,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                banner: null,
                message: error?.message,
            };
        }
    }
    async getBanner() {
        try {
            const banners = await this.bannersRepository.find({
                take: 5,
                order: {
                    createdAt: 'DESC'
                }
            });
            if (!banners) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                banners,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                banners: []
            };
            return response;
        }
    }
    async updateBanner(uid, bannerData) {
        try {
            const banner = await this.bannersRepository.findOne({ where: { uid } });
            if (!banner) {
                throw new common_1.NotFoundException('Banner not found');
            }
            await this.bannersRepository.update({ uid }, bannerData);
            const updatedBanner = await this.bannersRepository.findOne({ where: { uid } });
            return {
                banner: updatedBanner,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                banner: null,
                message: error?.message,
            };
        }
    }
    async deleteBanner(uid) {
        try {
            const banner = await this.bannersRepository.findOne({ where: { uid } });
            if (!banner) {
                throw new common_1.NotFoundException('Banner not found');
            }
            await this.bannersRepository.delete({ uid });
            return {
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
            };
        }
    }
    async getAllQuotations() {
        try {
            const quotations = await this.quotationRepository.find({
                relations: ['placedBy', 'client', 'quotationItems']
            });
            if (!quotations) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const response = {
                quotations,
                message: process.env.SUCCESS_MESSAGE,
            };
            return response;
        }
        catch (error) {
            const response = {
                message: error?.message,
                quotations: []
            };
            return response;
        }
    }
    async getQuotationsByUser(ref) {
        try {
            const quotations = await this.quotationRepository.find({
                where: {
                    placedBy: {
                        uid: ref
                    }
                },
                relations: ['placedBy', 'client', 'quotationItems']
            });
            if (!quotations) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const formattedQuotations = quotations.map(quotation => ({
                ...quotation,
                totalAmount: Number(quotation.totalAmount)
            }));
            return {
                quotations: formattedQuotations,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                quotations: []
            };
        }
    }
    async getQuotationByRef(ref) {
        try {
            const quotation = await this.quotationRepository.findOne({
                where: {
                    uid: ref
                },
                relations: ['placedBy', 'client', 'quotationItems', 'quotationItems.product']
            });
            if (!quotation) {
                throw new common_1.NotFoundException(process.env.NOT_FOUND_MESSAGE);
            }
            const formattedQuotation = {
                ...quotation,
                totalAmount: Number(quotation.totalAmount)
            };
            return {
                quotation: formattedQuotation,
                message: process.env.SUCCESS_MESSAGE,
            };
        }
        catch (error) {
            return {
                message: error?.message,
                quotation: null
            };
        }
    }
    async getQuotationsForDate(date) {
        try {
            const quotations = await this.quotationRepository.find({
                where: {
                    createdAt: (0, typeorm_3.Between)((0, date_fns_1.startOfDay)(date), (0, date_fns_1.endOfDay)(date))
                },
                relations: ['quotationItems']
            });
            if (!quotations) {
                throw new Error(process.env.NOT_FOUND_MESSAGE);
            }
            const groupedQuotations = {
                pending: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.PENDING),
                processing: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.INPROGRESS),
                completed: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.COMPLETED),
                cancelled: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.CANCELLED),
                postponed: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.POSTPONED),
                rejected: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.REJECTED),
                approved: quotations.filter(quotation => quotation?.status === status_enums_1.OrderStatus.APPROVED)
            };
            const metrics = {
                totalQuotations: quotations?.length,
                grossQuotationValue: this.formatCurrency(quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0)),
                averageQuotationValue: this.formatCurrency(quotations?.length > 0
                    ? quotations?.reduce((sum, quotation) => sum + (Number(quotation?.totalAmount) || 0), 0) / quotations?.length
                    : 0)
            };
            return {
                message: process.env.SUCCESS_MESSAGE,
                stats: {
                    quotations: {
                        ...groupedQuotations,
                        metrics
                    }
                }
            };
        }
        catch (error) {
            return {
                message: error?.message,
                stats: null
            };
        }
    }
    async ensureUniqueSKU(product) {
        let sku = product_entity_1.Product.generateSKU(product.category, product.name, product.uid, product.reseller);
        let counter = 1;
        while (await this.productRepository.findOne({ where: { sku } })) {
            sku = `${product_entity_1.Product.generateSKU(product.category, product.name, product.uid, product.reseller)}-${counter}`;
            counter++;
        }
        return sku;
    }
    async createProduct(productData) {
        let product = this.productRepository.create(productData);
        product = await this.productRepository.save(product);
        product.sku = await this.ensureUniqueSKU(product);
        return this.productRepository.save(product);
    }
    async generateSKUsForExistingProducts() {
        try {
            const productsWithoutSKU = await this.productRepository.find({
                where: [
                    { sku: null },
                    { sku: '' }
                ]
            });
            if (!productsWithoutSKU.length) {
                return {
                    message: 'No products found requiring SKU generation',
                    updatedCount: 0
                };
            }
            const updatePromises = productsWithoutSKU.map(async (product) => {
                product.sku = await this.ensureUniqueSKU(product);
                return this.productRepository.save(product);
            });
            await Promise.all(updatePromises);
            return {
                message: `Successfully generated SKUs for ${productsWithoutSKU.length} products`,
                updatedCount: productsWithoutSKU.length
            };
        }
        catch (error) {
            return {
                message: `Error generating SKUs: ${error.message}`,
                updatedCount: 0
            };
        }
    }
    async regenerateAllSKUs() {
        try {
            const allProducts = await this.productRepository.find();
            const updatePromises = allProducts.map(async (product) => {
                product.sku = await this.ensureUniqueSKU(product);
                return this.productRepository.save(product);
            });
            await Promise.all(updatePromises);
            return {
                message: `Successfully regenerated SKUs for ${allProducts.length} products`,
                updatedCount: allProducts.length
            };
        }
        catch (error) {
            return {
                message: `Error regenerating SKUs: ${error.message}`,
                updatedCount: 0
            };
        }
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_2.InjectRepository)(quotation_entity_1.Quotation)),
    __param(2, (0, typeorm_2.InjectRepository)(banners_entity_1.Banners)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        config_1.ConfigService,
        clients_service_1.ClientsService,
        event_emitter_1.EventEmitter2,
        shop_gateway_1.ShopGateway])
], ShopService);
//# sourceMappingURL=shop.service.js.map