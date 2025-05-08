import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { Quotation } from '../../shop/entities/quotation.entity';
import { QuotationItem } from '../../shop/entities/quotation-item.entity';
import { Client } from '../../clients/entities/client.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { ProductStatus } from '../enums/product.enums';
import { AccessLevel } from '../enums/user.enums';
import { GeneralStatus, OrderStatus } from '../enums/status.enums';

@Injectable()
export class ImporterService implements OnModuleInit {
	private readonly logger = new Logger(ImporterService.name);
	private connection: Connection;
	private organisation: Organisation;
	private branch: Branch;
	private lastSyncTime: Date = new Date();
	private isSynchronizing = false;
	private categoryMap: Map<string, string> = new Map(); // Store category code -> description mappings

	constructor(
		private readonly configService: ConfigService,
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Quotation)
		private readonly quotationRepository: Repository<Quotation>,
		@InjectRepository(QuotationItem)
		private readonly quotationItemRepository: Repository<QuotationItem>,
		@InjectRepository(Client)
		private readonly clientRepository: Repository<Client>,
		@InjectRepository(Organisation)
		private readonly organisationRepository: Repository<Organisation>,
		@InjectRepository(Branch)
		private readonly branchRepository: Repository<Branch>,
	) {}

	async onModuleInit() {
		try {
			// Get org and branch IDs from env file
			const orgId = this.configService.get<number>('BIT_DATABASE_ORG_ID') || 2;
			const branchId = this.configService.get<number>('BIT_DATABASE_BRANCH_ID') || 2;

			// Get organisation and branch references
			this.organisation = await this.organisationRepository.findOne({ where: { uid: orgId } });
			this.branch = await this.branchRepository.findOne({ where: { uid: branchId } });

			if (!this.organisation || !this.branch) {
				this.logger.error(
					`Organisation ${orgId} or Branch ${branchId} not found. ImporterService initialization failed.`,
				);
				return;
			}

			// Establish connection to the MySQL database using environment variables
			this.connection = await createConnection({
				name: 'bitConnection', // Unique name for this connection
				type: 'mysql',
				host: this.configService.get<string>('BIT_DATABASE_HOST'),
				port: this.configService.get<number>('BIT_DATABASE_PORT'),
				username: this.configService.get<string>('BIT_DATABASE_USER'),
				password: this.configService.get<string>('BIT_DATABASE_PASSWORD'),
				database: this.configService.get<string>('BIT_DATABASE_NAME'),
				synchronize: false, // Don't auto-create tables in external DB
			});

			this.logger.log(`ImporterService initialized for Organisation ID: ${orgId}, Branch ID: ${branchId}`);
		} catch (error) {
			this.logger.error(`Failed to initialize ImporterService: ${error.message}`, error.stack);
		}
	}

	// Main synchronization method that runs in the correct order
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Run every day at midnight
	async synchronizeAll() {
		try {
			if (!this.connection) {
				this.logger.error('BIT database connection not established');
				return;
			}

			// Check if a synchronization is already in progress
			if (this.isSynchronizing) {
				this.logger.log('Previous synchronization still in progress, skipping this cycle');
				return;
			}

			// Set flag to indicate sync is in progress
			this.isSynchronizing = true;

			// Set a minimum interval between synchronizations (10 seconds)
			const now = new Date();
			const timeDiff = now.getTime() - this.lastSyncTime.getTime();
			if (timeDiff < 10000) {
				this.logger.log('Last sync was less than 10 seconds ago, skipping this cycle');
				this.isSynchronizing = false;
				return; // Don't run if less than 10 seconds since last sync
			}
			this.lastSyncTime = now;

			this.logger.log('Starting database synchronization...');

			// Synchronize in the correct order (users, products, clients, quotations)
			await this.processUsersSync();
			await this.processProductsSync(); // Products first
			await this.processClientsSync(); // Clients second
			await this.processQuotationsSync(); // Quotations last (depends on clients)

			this.logger.log('Database synchronization completed successfully');

			// Reset flag after completion
			this.isSynchronizing = false;
		} catch (error) {
			this.logger.error(`Error in synchronization: ${error.message}`, error.stack);
			// Reset flag even if there's an error
			this.isSynchronizing = false;
		}
	}

	// Process users only - called from synchronizeAll
	private async processUsersSync() {
		try {
			this.logger.log('Fetching users from BIT database...');

			// Fetch users from both tables without date filtering
			const salesmenQuery = `
        SELECT * FROM tblsalesman 
      `;

			const usersQuery = `
        SELECT * FROM tblusers 
      `;

			const salesmen = await this.connection.query(salesmenQuery);
			const users = await this.connection.query(usersQuery);

			// Combine both arrays
			const allUsers = [...salesmen, ...users];

			if (allUsers.length > 0) {
				this.logger.log(
					`Found ${allUsers.length} users to sync (${salesmen.length} salesmen, ${users.length} users)`,
				);

				// Process users
				await this.processUsers(allUsers);
			} else {
				this.logger.log('No new users to sync');
			}
		} catch (error) {
			this.logger.error(`Error fetching users: ${error.message}`, error.stack);
		}
	}

	// Process clients only - called from synchronizeAll
	private async processClientsSync() {
		try {
			this.logger.log('Fetching clients from BIT database...');

			// Using last_sale_date or UpdatedOn for filtering
			const clients = await this.connection.query(`
				SELECT * FROM tblcustomers 
			`);

			if (clients.length > 0) {
				this.logger.log(`Found ${clients.length} clients to sync`);

				// Process clients in smaller batches to prevent overwhelming the database
				const batchSize = 100;
				for (let i = 0; i < clients.length; i += batchSize) {
					const batch = clients.slice(i, i + batchSize);
					this.logger.log(
						`Processing client batch ${i / batchSize + 1} of ${Math.ceil(clients.length / batchSize)} (${
							batch.length
						} clients)`,
					);
					await this.processClients(batch);

					// Add a small delay between batches
					if (i + batchSize < clients.length) {
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				}
			} else {
				this.logger.log('No new clients to sync');
			}
		} catch (error) {
			this.logger.error(`Error fetching clients: ${error.message}`, error.stack);
		}
	}

	// Process products only - called from synchronizeAll
	private async processProductsSync() {
		try {
			this.logger.log('Fetching products from BIT database...');

			// Load categories first to have them available for product processing
			await this.loadCategories();

			// Using m_date instead of updated_at which doesn't exist in tblinventory
			const products = await this.connection.query(`
				SELECT * FROM tblinventory 
			`);

			if (products.length > 0) {
				this.logger.log(`Found ${products.length} products to sync`);

				// Process products in smaller batches to prevent overwhelming the database
				const batchSize = 100;
				for (let i = 0; i < products.length; i += batchSize) {
					const batch = products.slice(i, i + batchSize);
					this.logger.log(
						`Processing product batch ${i / batchSize + 1} of ${Math.ceil(products.length / batchSize)} (${
							batch.length
						} products)`,
					);
					await this.processProducts(batch);

					// Add a small delay between batches
					if (i + batchSize < products.length) {
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				}
			} else {
				this.logger.log('No new products to sync');
			}
		} catch (error) {
			this.logger.error(`Error fetching products: ${error.message}`, error.stack);
		}
	}

	// Process quotations only - called from synchronizeAll
	private async processQuotationsSync() {
		try {
			this.logger.log('Fetching quotations from BIT database...');

			// First, get the quotation headers - using sale_date for filtering
			const quotations = await this.connection.query(`
        SELECT * FROM tblsalesheader
        WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND doc_type = 3 /* 3 for quotations/estimates */
      `);

			if (quotations.length > 0) {
				this.logger.log(`Found ${quotations.length} quotations to sync`);

				// For each quotation, get its items
				for (const quotation of quotations) {
					this.logger.log(`Fetching items for quotation doc_number: ${quotation.doc_number}`);

					const quotationItems = await this.connection.query(
						`
            SELECT * FROM tblsaleslines 
            WHERE doc_number = ?
          `,
						[quotation.doc_number],
					);

					this.logger.log(
						`Found ${quotationItems.length} items for quotation doc_number: ${quotation.doc_number}`,
					);

					// Combine quotation with its items
					quotation.items = quotationItems || [];

					// Process quotation with its items
					await this.processQuotation(quotation);
				}
			} else {
				this.logger.log('No new quotations to sync');
			}
		} catch (error) {
			this.logger.error(`Error fetching quotations: ${error.message}`, error.stack);
		}
	}

	// Keep these legacy methods for backward compatibility but have them delegate to the new synchronized approach
	@Cron('0 0 * * * *') // Run once per hour
	async fetchUsers() {
		await this.processUsersSync();
	}

	@Cron('5 0 * * * *') // Run once per hour, 5 minutes after users
	async fetchClients() {
		await this.processClientsSync();
	}

	@Cron('10 0 * * * *') // Run once per hour, 10 minutes after users
	async fetchProducts() {
		await this.processProductsSync();
	}

	@Cron('15 0 * * * *') // Run once per hour, 15 minutes after users
	async fetchQuotations() {
		await this.processQuotationsSync();
	}

	// Load categories from tblinventorycategory
	private async loadCategories() {
		try {
			const categories = await this.connection.query('SELECT * FROM tblinventorycategory');

			// Create a lookup map of code -> description
			this.categoryMap.clear();
			for (const cat of categories) {
				this.categoryMap.set(cat.code, cat.description);
			}

			this.logger.log(`Loaded ${categories.length} categories from database`);
		} catch (error) {
			this.logger.error(`Error loading categories: ${error.message}`, error.stack);
		}
	}

	private async processProducts(products: any[]) {
		let createdCount = 0;
		let updatedCount = 0;
		const defaultImageUrl = 'https://img.icons8.com/?size=256w&id=11878&format=png';

		for (const bitProduct of products) {
			try {
				// Data sanitization
				const productRef =
					this.sanitizeString(bitProduct.item_code) || this.sanitizeString(bitProduct.id?.toString());
				const name = this.sanitizeString(bitProduct.description_1);
				const description = this.sanitizeString(bitProduct.description_2) || '';
				const barcode =
					this.sanitizeString(bitProduct.barcode) || this.sanitizeString(bitProduct.id?.toString());

				// Get category from the category map using category_main code
				const categoryCode = this.sanitizeString(bitProduct.category_main) || '0';
				let category = this.categoryMap.get(categoryCode) || 'Other';
				if (!this.categoryMap.has(categoryCode)) {
					this.logger.warn(
						`Category code ${categoryCode} not found in category map for product ${bitProduct.id}`,
					);
				}

				// Skip products without required data
				if (!name || !productRef) {
					this.logger.warn(`Skipping product ${bitProduct.id}: Missing required data (name or productRef)`);
					continue;
				}

				// Look for existing product by product reference or name
				let product = await this.productRepository.findOne({
					where: [{ productRef: productRef }, { name: name }],
					relations: ['organisation', 'branch'],
				});

				try {
					// If product doesn't exist, create a new one
					if (!product) {
						// Create the entity instance but don't save it immediately
						product = this.productRepository.create({
							name: name,
							description: description,
							price: 0, // Need to fetch price from another table or mapping
							stockQuantity: 0, // Need to fetch stock from another table or computation
							category: category,
							status: ProductStatus.ACTIVE,
							barcode: barcode,
							productRef: productRef,
							organisation: this.organisation,
							branch: this.branch,
							imageUrl: defaultImageUrl, // Set default product image
						});

						// Manually generate SKU if needed to avoid afterInsert hook errors
						if (!product.sku && product.productRef) {
							product.sku = `SKU-${product.productRef}`;
						}

						createdCount++;
					} else {
						// Update existing product
						product.name = name;
						product.description = description || product.description;
						// Don't update price/stock if we don't have that data
						product.category = category || product.category;
						product.barcode = barcode || product.barcode;
						product.organisation = this.organisation;
						product.branch = this.branch;

						// Only set image URL if not already set
						if (!product.imageUrl) {
							product.imageUrl = defaultImageUrl;
						}

						updatedCount++;
					}

					// Save the product using query builder to avoid entity listeners
					// This bypasses the updateSKUWithCorrectUid method that causes the connection error
					if (product.uid) {
						// Update existing product with raw query
						await this.productRepository.update(
							{ uid: product.uid },
							{
								name: product.name,
								description: product.description,
								category: product.category,
								barcode: product.barcode,
								sku: product.sku || `SKU-${productRef}`,
								productRef: productRef,
								imageUrl: product.imageUrl || defaultImageUrl,
								// Don't update timestamps as they're handled by TypeORM
							},
						);
					} else {
						// Insert new product with raw query
						const result = await this.productRepository.insert({
							name: product.name,
							description: product.description,
							price: product.price || 0,
							stockQuantity: product.stockQuantity || 0,
							category: product.category,
							status: product.status,
							barcode: product.barcode,
							productRef: product.productRef,
							sku: product.sku || `SKU-${productRef}`,
							imageUrl: defaultImageUrl,
							organisation: this.organisation,
							branch: this.branch,
						});

						// Store the new ID if needed for reference
						if (result.identifiers && result.identifiers.length > 0) {
							product.uid = result.identifiers[0].uid;
						}
					}
				} catch (saveError) {
					this.logger.error(`Error saving product ${bitProduct.id}: ${saveError.message}`, saveError.stack);
				}
			} catch (error) {
				this.logger.error(`Error processing product ${bitProduct.id}: ${error.message}`, error.stack);
			}
		}

		this.logger.log(`Products processed: ${products.length} (Created: ${createdCount}, Updated: ${updatedCount})`);
	}

	private async processUsers(users: any[]) {
		let createdCount = 0;
		let updatedCount = 0;

		// Generate and hash the default password
		const defaultPassword = 'secure@2025';
		const hashedPassword = await bcrypt.hash(defaultPassword, 10);

		for (const bitUser of users) {
			try {
				// Determine if this is a salesman or regular user record
				const isSalesman = 'Code' in bitUser; // Salesman has 'Code' field

				// Extract and sanitize name components
				let firstName = '',
					lastName = '';

				if (isSalesman) {
					// For salesman, Description typically contains the full name
					const nameParts = (this.sanitizeString(bitUser.Description) || '').split(' ');
					firstName = nameParts[0] || '';
					lastName = nameParts.slice(1).join(' ') || '';
				} else {
					// For regular users, structure depends on tblusers table
					firstName =
						this.sanitizeString(bitUser.first_name) ||
						this.sanitizeString(bitUser.name) ||
						this.sanitizeString(bitUser.username) ||
						this.sanitizeString(bitUser.code) ||
						'';
					lastName = this.sanitizeString(bitUser.last_name) || this.sanitizeString(bitUser.surname) || '';
				}

				// Skip users without minimum required data
				if (
					(!firstName && !lastName) ||
					(isSalesman && !bitUser.Code) ||
					(!isSalesman && !bitUser.username && !bitUser.code)
				) {
					this.logger.warn(`Skipping user ${bitUser.id || bitUser.Code}: Missing required data`);
					continue;
				}

				// Generate email and username
				const identifier = isSalesman
					? this.sanitizeString(bitUser.Code)
					: this.sanitizeString(bitUser.username) ||
					  this.sanitizeString(bitUser.code) ||
					  bitUser.id?.toString();
				const email = this.sanitizeString(bitUser.Email) || `${identifier}@placeholder.com`;
				const username = isSalesman
					? this.sanitizeString(bitUser.Code)
					: this.sanitizeString(bitUser.username) || email;

				// Look for existing user by email, username, or identifier
				let user = await this.userRepository.findOne({
					where: [{ email: email }, { username: username }],
					relations: ['organisation', 'branch'],
				});

				// Phone number sanitization
				const phone =
					this.sanitizeString(bitUser.Tel) ||
					this.sanitizeString(bitUser.Cellphone) ||
					this.sanitizeString(bitUser.phone) ||
					'';

				// If user doesn't exist, create a new one
				if (!user) {
					user = this.userRepository.create({
						name: firstName,
						surname: lastName,
						email: email,
						username: username,
						password: hashedPassword, // Use the hashed default password
						phone: phone,
						role: isSalesman ? 'salesman' : this.sanitizeString(bitUser.role) || 'user',
						status: 'active',
						accessLevel: AccessLevel.USER,
						organisation: this.organisation,
						branch: this.branch,
					});

					createdCount++;
				} else {
					// Update existing user but don't change the password
					user.name = firstName || user.name;
					user.surname = lastName || user.surname;
					user.phone = phone || user.phone;
					user.organisation = this.organisation;
					user.branch = this.branch;

					updatedCount++;
				}

				// Save the user
				await this.userRepository.save(user);
			} catch (error) {
				this.logger.error(`Error processing user ${bitUser.id || bitUser.Code}: ${error.message}`, error.stack);
			}
		}

		this.logger.log(`Users processed: ${users.length} (Created: ${createdCount}, Updated: ${updatedCount})`);
	}

	private async processQuotation(bitQuotation: any) {
		try {
			const docNumber = this.sanitizeString(bitQuotation.doc_number);
			this.logger.log(
				`Processing quotation with doc_number: ${docNumber}, with ${
					bitQuotation.items ? bitQuotation.items.length : 0
				} items`,
			);

			// Validate customer/client data
			const customerCode = this.sanitizeString(bitQuotation.customer);

			if (!customerCode) {
				this.logger.warn(`No customer code found for quotation ${docNumber}, skipping quotation`);
				return;
			}

			// Find related client by customer code
			this.logger.log(`Looking for client with customer code: ${customerCode}`);

			const clientQuery = await this.connection.query(`SELECT * FROM tblcustomers WHERE Code = ?`, [
				customerCode,
			]);

			if (!clientQuery || clientQuery.length === 0) {
				this.logger.warn(`Client not found for quotation ${docNumber}, skipping quotation`);
				return;
			}

			const bitClient = clientQuery[0];

			// Generate email and get client name
			const clientEmail =
				this.sanitizeString(bitClient.Email) ||
				`${this.sanitizeString(bitClient.Code) || bitClient.ID}@placeholder.com`;
			const clientName =
				this.sanitizeString(bitClient.Description) || this.sanitizeString(bitClient.CustomerName) || '';

			this.logger.log(`Looking for client in our system with email: ${clientEmail} or name: ${clientName}`);

			// Find client in our system
			const client = await this.clientRepository.findOne({
				where: [{ email: clientEmail }, { name: clientName }],
				relations: ['organisation', 'branch'],
			});

			if (!client) {
				this.logger.warn(`Client not found in our system for quotation ${docNumber}, skipping quotation`);
				return;
			}

			this.logger.log(`Found client in our system: UID: ${client.uid}, name: ${client.name}`);

			// Look for existing quotation by number
			const quotationNumber = docNumber || bitQuotation.ID?.toString();
			if (!quotationNumber) {
				this.logger.warn(`Invalid quotation number for quotation ID ${bitQuotation.ID}, skipping`);
				return;
			}

			this.logger.log(`Looking for existing quotation with number: ${quotationNumber}`);

			let quotation = await this.quotationRepository.findOne({
				where: { quotationNumber: quotationNumber },
				relations: ['organisation', 'branch', 'client', 'quotationItems'],
			});

			// Parse and validate dates
			let quotationDate: Date;
			try {
				quotationDate = bitQuotation.sale_date ? new Date(bitQuotation.sale_date) : new Date();
				// Check if date is valid
				if (isNaN(quotationDate.getTime())) {
					quotationDate = new Date();
				}
			} catch (error) {
				quotationDate = new Date();
			}

			const validUntil = new Date(quotationDate);
			validUntil.setDate(validUntil.getDate() + 30); // Set valid for 30 days

			// Parse and sanitize numeric values
			const totalAmount = this.parseDecimal(bitQuotation.total_incl, 0);
			const totalItems = bitQuotation.items ? bitQuotation.items.length : 0;

			// Sanitize text fields
			const notes =
				this.sanitizeString(bitQuotation.delivery_notes) || this.sanitizeString(bitQuotation.reference_1) || '';

			// Map status
			const status = this.mapQuotationStatus(this.sanitizeString(bitQuotation.status) || 'draft');

			// If quotation doesn't exist, create a new one
			if (!quotation) {
				this.logger.log(`Quotation not found, creating new quotation with number: ${quotationNumber}`);

				quotation = this.quotationRepository.create({
					quotationNumber: quotationNumber,
					totalAmount: totalAmount,
					totalItems: totalItems,
					status: status,
					quotationDate: quotationDate,
					validUntil: validUntil,
					notes: notes,
					client: client,
					organisation: this.organisation,
					branch: this.branch,
					quotationItems: [],
				});
			} else {
				// Update existing quotation
				this.logger.log(
					`Updating existing quotation: UID: ${quotation.uid}, number: ${quotation.quotationNumber}`,
				);

				quotation.totalAmount = totalAmount;
				quotation.totalItems = totalItems;
				quotation.status = status;
				quotation.notes = notes;
				quotation.organisation = this.organisation;
				quotation.branch = this.branch;
			}

			// Save the quotation first to get its ID for item relationships
			const savedQuotation = await this.quotationRepository.save(quotation);

			// Process quotation items
			let itemsCreated = 0;

			if (bitQuotation.items && bitQuotation.items.length > 0) {
				// Clear existing items if updating (to avoid duplicates)
				if (quotation.quotationItems && quotation.quotationItems.length > 0) {
					this.logger.log(
						`Removing ${quotation.quotationItems.length} existing items for quotation UID: ${quotation.uid}`,
					);
					await this.quotationItemRepository.remove(quotation.quotationItems);
					quotation.quotationItems = [];
				}

				// Create new items
				for (const bitItem of bitQuotation.items) {
					const itemCode = this.sanitizeString(bitItem.item_code);

					// Skip items without item code
					if (!itemCode) {
						this.logger.warn(`Missing item code for quotation item ${bitItem.ID}, skipping item`);
						continue;
					}

					// Find the referenced product by item_code
					const product = await this.productRepository.findOne({
						where: [{ productRef: itemCode }, { barcode: itemCode }],
					});

					if (!product) {
						this.logger.warn(`Product not found for quotation item ${bitItem.ID}, skipping item`);
						continue;
					}

					// Parse and validate numeric values
					const quantity = this.parseDecimal(bitItem.quantity, 1);
					const lineTotal = this.parseDecimal(bitItem.incl_line_total, product.price * quantity);

					const quotationItem = this.quotationItemRepository.create({
						quantity: quantity,
						totalPrice: lineTotal,
						product: product,
						quotation: quotation,
					});

					await this.quotationItemRepository.save(quotationItem);
					itemsCreated++;
				}
			}

			// Refresh the quotation to get the updated items
			const refreshedQuotation = await this.quotationRepository.findOne({
				where: { uid: quotation.uid },
				relations: ['quotationItems'],
			});

			this.logger.log(
				`Quotation processing complete for UID: ${quotation.uid}, with ${
					refreshedQuotation?.quotationItems?.length || 0
				} items created`,
			);
		} catch (error) {
			this.logger.error(
				`Error processing quotation ${bitQuotation.doc_number || bitQuotation.ID}: ${error.message}`,
				error.stack,
			);
		}
	}

	private async processClients(clients: any[]) {
		let createdCount = 0;
		let updatedCount = 0;
		let skippedCount = 0;

		for (const bitClient of clients) {
			try {
				// Sanitize basic client data
				const code = this.sanitizeString(bitClient.Code);
				const id = bitClient.ID?.toString();
				const clientName =
					this.sanitizeString(bitClient.Description) || this.sanitizeString(bitClient.CustomerName) || '';

				// Skip clients without a name
				if (!clientName) {
					this.logger.warn(`Skipping client ${bitClient.ID}: Missing name`);
					skippedCount++;
					continue;
				}

				// Generate email if not present and sanitize contact info
				let email = this.sanitizeString(bitClient.Email);
				if (!email) {
					// Generate a unique email based on code/id to avoid duplicate empty emails
					email = `${code || id || 'client-' + this.generateRandomString(8)}@placeholder.com`;
				}

				let phone = this.sanitizeString(bitClient.Tel) || this.sanitizeString(bitClient.Cellphone) || '';
				if (!phone) {
					// Generate a unique phone number to avoid duplicate empty phones
					phone = `+000${id || this.generateRandomString(8)}`;
				}

				const alternativePhone = this.sanitizeString(bitClient.Fax) || null;
				const contactPerson = this.sanitizeString(bitClient.DocContact) || clientName;
				const description = this.sanitizeString(bitClient.notes) || '';

				// Website is optional but unique - set to null if empty to avoid unique constraint issues
				const website = this.sanitizeString(bitClient.UserDefined1) || null;

				// Parse and sanitize address components
				const address = {
					street:
						this.sanitizeString(bitClient.Address01) ||
						this.sanitizeString(bitClient.PhysicalAddress1) ||
						'',
					suburb:
						this.sanitizeString(bitClient.Address02) ||
						this.sanitizeString(bitClient.PhysicalAddress2) ||
						'',
					city:
						this.sanitizeString(bitClient.Address03) ||
						this.sanitizeString(bitClient.PhysicalAddress3) ||
						'',
					state:
						this.sanitizeString(bitClient.Address04) ||
						this.sanitizeString(bitClient.PhysicalAddress4) ||
						'',
					country:
						this.sanitizeString(bitClient.Address05) ||
						this.sanitizeString(bitClient.PhysicalAddress5) ||
						'South Africa',
					postalCode:
						this.sanitizeString(bitClient.Address06) ||
						this.sanitizeString(bitClient.PhysicalAddress6) ||
						'',
				};

				// Map financial data
				const creditLimit = this.parseDecimal(bitClient.Creditlimit, 0);
				const outstandingBalance = this.parseDecimal(bitClient.balance, 0);
				const discountPercentage = this.parseDecimal(bitClient.Discount, 0);

				// Parse dates
				let birthday = null;
				try {
					birthday =
						bitClient.Birthday && bitClient.Birthday !== '1970-01-01' ? new Date(bitClient.Birthday) : null;

					// Check if date is valid
					if (birthday && isNaN(birthday.getTime())) {
						birthday = null;
					}
				} catch (error) {
					birthday = null;
				}

				let lastVisitDate = null;
				try {
					lastVisitDate =
						bitClient.last_sale_date && bitClient.last_sale_date !== '2000-01-01'
							? new Date(bitClient.last_sale_date)
							: null;

					if (lastVisitDate && isNaN(lastVisitDate.getTime())) {
						lastVisitDate = null;
					}
				} catch (error) {
					lastVisitDate = null;
				}

				// Get category from tblcustomers.Category (if available)
				const category =
					this.sanitizeString(bitClient.Category) ||
					this.sanitizeString(bitClient.category_type) ||
					'contract';

				// First check if a client with this ID/Code already exists using raw query
				// to avoid unique constraint issues with potentially incomplete data
				const existingClients = await this.clientRepository
					.createQueryBuilder('client')
					.where('client.name = :name', { name: clientName })
					.orWhere('client.email = :email', { email: email })
					.orWhere('client.phone = :phone', { phone: phone })
					.getMany();

				if (existingClients.length > 0) {
					// Update an existing client
					const client = existingClients[0]; // Take the first match

					client.name = clientName;
					client.contactPerson = contactPerson || client.contactPerson;
					client.phone = phone;
					client.email = email;
					// Only set if not null and not empty
					if (alternativePhone) client.alternativePhone = alternativePhone;
					if (website) client.website = website;
					client.description = description || client.description;
					client.address = { ...client.address, ...address };
					client.creditLimit = creditLimit;
					client.outstandingBalance = outstandingBalance;
					client.discountPercentage = discountPercentage;
					client.birthday = birthday || client.birthday;
					client.lastVisitDate = lastVisitDate || client.lastVisitDate;
					client.category = category;
					client.paymentTerms = this.sanitizeString(bitClient.terms) || client.paymentTerms || 'Net 30';
					client.organisation = this.organisation;
					client.branch = this.branch;

					// Update custom fields without overwriting existing ones
					client.customFields = {
						...client.customFields,
						vatNumber: this.sanitizeString(bitClient.VatNumber) || client.customFields?.vatNumber || '',
						taxRef: this.sanitizeString(bitClient.TaxRef) || client.customFields?.taxRef || '',
						regNumber: this.sanitizeString(bitClient.RegNumber) || client.customFields?.regNumber || '',
						orderNumber:
							this.sanitizeString(bitClient.OrderNumber) || client.customFields?.orderNumber || '',
						supportNumber:
							this.sanitizeString(bitClient.supportNr) || client.customFields?.supportNumber || '',
						reference: this.sanitizeString(bitClient.reference) || client.customFields?.reference || '',
						priceRegime:
							this.sanitizeString(bitClient.PriceRegime) || client.customFields?.priceRegime || '',
						promoCode: this.sanitizeString(bitClient.PromoCode) || client.customFields?.promoCode || '',
						openItem: bitClient.open_item || client.customFields?.openItem || 0,
						isCashAccount: bitClient.CashAccount || client.customFields?.isCashAccount || 0,
					};

					try {
						await this.clientRepository.save(client);
						updatedCount++;
					} catch (saveError) {
						this.logger.error(
							`Error updating client ${bitClient.ID}: ${saveError.message}`,
							saveError.stack,
						);
						skippedCount++;
					}
				} else {
					// Create a new client
					try {
						const newClient = this.clientRepository.create({
							name: clientName,
							contactPerson: contactPerson,
							email: email,
							phone: phone,
							alternativePhone: alternativePhone,
							website: website,
							category: category,
							description: description,
							address: address,
							gpsCoordinates: '',
							status: GeneralStatus.ACTIVE,
							creditLimit: creditLimit,
							outstandingBalance: outstandingBalance,
							discountPercentage: discountPercentage,
							birthday: birthday,
							lastVisitDate: lastVisitDate,
							paymentTerms: this.sanitizeString(bitClient.terms) || 'Net 30',
							preferredLanguage: 'English',
							organisation: this.organisation,
							branch: this.branch,
							customFields: {
								vatNumber: this.sanitizeString(bitClient.VatNumber) || '',
								taxRef: this.sanitizeString(bitClient.TaxRef) || '',
								regNumber: this.sanitizeString(bitClient.RegNumber) || '',
								orderNumber: this.sanitizeString(bitClient.OrderNumber) || '',
								supportNumber: this.sanitizeString(bitClient.supportNr) || '',
								reference: this.sanitizeString(bitClient.reference) || '',
								priceRegime: this.sanitizeString(bitClient.PriceRegime) || '',
								promoCode: this.sanitizeString(bitClient.PromoCode) || '',
								openItem: bitClient.open_item || 0,
								isCashAccount: bitClient.CashAccount || 0,
							},
						});

						await this.clientRepository.save(newClient);
						createdCount++;
					} catch (saveError) {
						this.logger.error(
							`Error creating client ${bitClient.ID}: ${saveError.message}`,
							saveError.stack,
						);
						skippedCount++;
					}
				}
			} catch (error) {
				this.logger.error(`Error processing client ${bitClient.ID}: ${error.message}`, error.stack);
				skippedCount++;
			}
		}

		this.logger.log(
			`Clients processed: ${clients.length} (Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount})`,
		);
	}

	// Helper method to generate random string for unique values
	private generateRandomString(length: number): string {
		const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}

	// Helper methods for data sanitization and validation
	private sanitizeString(value: any): string | null {
		if (value === undefined || value === null) return null;
		if (typeof value === 'string') {
			const trimmed = value.trim();
			return trimmed === '' ? null : trimmed;
		}
		return String(value);
	}

	private parseDecimal(value: any, defaultValue: number): number {
		if (value === undefined || value === null) return defaultValue;

		try {
			const num = parseFloat(value);
			return isNaN(num) ? defaultValue : num;
		} catch (error) {
			return defaultValue;
		}
	}

	private mapQuotationStatus(bitStatus: string): OrderStatus {
		switch (bitStatus?.toLowerCase()) {
			case 'completed':
				return OrderStatus.COMPLETED;
			case 'cancelled':
				return OrderStatus.CANCELLED;
			case 'in progress':
				return OrderStatus.INPROGRESS;
			case 'approved':
				return OrderStatus.APPROVED;
			case 'rejected':
				return OrderStatus.REJECTED;
			case 'pending':
				return OrderStatus.PENDING_INTERNAL;
			case 'delivered':
				return OrderStatus.DELIVERED;
			case 'paid':
				return OrderStatus.PAID;
			case 'outfordelivery':
			case 'out_for_delivery':
			case 'out-for-delivery':
			case 'ofd':
			case 'out for delivery':
				return OrderStatus.OUTFORDELIVERY;
			case 'postponed':
				return OrderStatus.POSTPONED;
			case 'sourcing':
				return OrderStatus.SOURCING;
			case 'packing':
				return OrderStatus.PACKING;
			default:
				return OrderStatus.DRAFT;
		}
	}
}
