# 🏢 Assets Management Module

## Overview

The Assets Management Module is the comprehensive asset tracking and lifecycle management engine of the Loro platform, providing enterprise-grade asset registration, ownership tracking, insurance management, and organizational asset oversight capabilities. This module handles organizational assets including laptops, mobile devices, equipment, and infrastructure with multi-tenancy support, role-based access control, and comprehensive audit trails for corporate asset management and compliance.

## 🏗️ Architecture

```
assets/
├── assets.controller.ts        # REST API endpoints for asset operations
├── assets.service.ts          # Core business logic and asset management
├── assets.module.ts           # Module configuration & dependencies
├── entities/                   # Database entities
│   └── asset.entity.ts       # Asset entity with organizational relationships
├── dto/                       # Data Transfer Objects
│   ├── create-asset.dto.ts   # Asset creation validation
│   └── update-asset.dto.ts   # Asset modification validation
└── assets.controller.spec.ts  # API endpoint tests
```

## 🎯 Core Features

### Asset Lifecycle Management
- **Asset Registration** with unique serial number validation and manufacturer tracking
- **Ownership Assignment** with user and branch-level asset responsibility
- **Insurance Tracking** with expiry monitoring and compliance reporting
- **Asset Transfers** with audit trails and ownership history
- **Soft Deletion** with restoration capabilities for asset lifecycle management

### Organizational Asset Control
- **Multi-Tenancy Support** with organization-scoped asset isolation
- **Branch-Level Management** for departmental asset tracking
- **Role-Based Access** with enterprise licensing controls
- **Search & Discovery** across multiple asset attributes
- **Asset Responsibility** tracking with user assignment validation

### Compliance & Reporting
- **Insurance Management** with expiry date monitoring and renewal alerts
- **Audit Trails** for asset ownership changes and lifecycle events
- **Serial Number Uniqueness** validation across organizational boundaries
- **Purchase Date Tracking** for warranty and depreciation management
- **Asset Status Management** with soft-delete and restoration workflows

### Enterprise Integration
- **Enterprise Licensing** with feature access control
- **Organization Boundary** enforcement for secure multi-tenant operations
- **Branch Access Control** with user permission validation
- **JWT Authentication** with comprehensive security measures
- **Input Validation** with business rule enforcement

## 📊 Database Schema

### Asset Entity
```typescript
@Entity()
@Index(['serialNumber']) // Unique asset lookups
@Index(['owner', 'isDeleted']) // User asset queries
@Index(['brand', 'modelNumber']) // Asset categorization
@Index(['insuranceExpiryDate', 'hasInsurance']) // Insurance management
@Index(['org', 'branch', 'isDeleted']) // Organizational asset tracking
@Index(['purchaseDate']) // Purchase date tracking
export class Asset {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    brand: string;

    @Column({ nullable: false, unique: true })
    serialNumber: string;

    @Column({ nullable: false })
    modelNumber: string;

    @Column({ nullable: false })
    purchaseDate: Date;

    @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: false })
    hasInsurance: boolean;

    @Column({ nullable: false })
    insuranceProvider: string;

    @Column({ nullable: false })
    insuranceExpiryDate: Date;

    @Column({ nullable: false, default: false })
    isDeleted: boolean;

    @ManyToOne(() => User, (user) => user?.assets)
    owner: User;

    @ManyToOne(() => Organisation, (organisation) => organisation?.assets, { nullable: true })
    org: Organisation;

    @ManyToOne(() => Branch, (branch) => branch?.assets, { nullable: true })
    branch: Branch;
}
```

## 📚 API Endpoints

### Asset Management

#### `POST /assets` 🔒 Enterprise Protected
**Create Asset**
```typescript
// Request - Corporate Laptop
{
  "brand": "Dell",
  "serialNumber": "DL2024-001-LAP",
  "modelNumber": "Latitude 5520",
  "purchaseDate": "2024-01-15T00:00:00.000Z",
  "hasInsurance": true,
  "insuranceProvider": "TechGuard Insurance",
  "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
  "owner": { "uid": 1 },
  "branch": { "uid": 1 }
}

// Request - Mobile Device
{
  "brand": "Apple",
  "serialNumber": "APL2024-002-PHN",
  "modelNumber": "iPhone 14 Pro",
  "purchaseDate": "2024-02-20T00:00:00.000Z",
  "hasInsurance": true,
  "insuranceProvider": "MobileCare Plus",
  "insuranceExpiryDate": "2025-02-20T00:00:00.000Z",
  "owner": { "uid": 2 },
  "branch": { "uid": 1 }
}

// Response
{
  "message": "Asset created successfully",
  "asset": {
    "uid": 1,
    "brand": "Dell",
    "serialNumber": "DL2024-001-LAP",
    "modelNumber": "Latitude 5520",
    "purchaseDate": "2024-01-15T00:00:00.000Z",
    "hasInsurance": true,
    "insuranceProvider": "TechGuard Insurance",
    "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "isDeleted": false
  }
}
```

#### `GET /assets` 🔒 Protected
**Get All Assets**
```typescript
// Response
{
  "assets": [
    {
      "uid": 1,
      "brand": "Dell",
      "serialNumber": "DL2024-001-LAP",
      "modelNumber": "Latitude 5520",
      "purchaseDate": "2024-01-15T00:00:00.000Z",
      "hasInsurance": true,
      "insuranceProvider": "TechGuard Insurance",
      "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isDeleted": false,
      "owner": {
        "uid": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "branch": {
        "uid": 1,
        "name": "Main Office"
      }
    }
  ],
  "message": "Assets retrieved successfully",
  "totalCount": 1
}
```

#### `GET /assets/:ref` 🔒 Protected
**Get Asset Details**
```typescript
// Response
{
  "asset": {
    "uid": 1,
    "brand": "Dell",
    "serialNumber": "DL2024-001-LAP",
    "modelNumber": "Latitude 5520",
    "purchaseDate": "2024-01-15T00:00:00.000Z",
    "hasInsurance": true,
    "insuranceProvider": "TechGuard Insurance",
    "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "isDeleted": false,
    "owner": {
      "uid": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com"
    },
    "branch": {
      "uid": 1,
      "name": "Main Office",
      "location": "New York"
    },
    "org": {
      "uid": 1,
      "name": "Acme Corporation"
    }
  },
  "message": "Asset retrieved successfully"
}
```

#### `GET /assets/search/:query` 🔒 Protected
**Search Assets**
```typescript
// Search by brand: GET /assets/search/Dell
// Search by model: GET /assets/search/Latitude
// Search by serial: GET /assets/search/DL2024

// Response
{
  "assets": [
    {
      "uid": 1,
      "brand": "Dell",
      "serialNumber": "DL2024-001-LAP",
      "modelNumber": "Latitude 5520",
      "purchaseDate": "2024-01-15T00:00:00.000Z",
      "hasInsurance": true,
      "insuranceProvider": "TechGuard Insurance",
      "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
      "owner": {
        "uid": 1,
          "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "message": "Search completed successfully",
  "searchTerm": "Dell",
  "resultCount": 1
}
```

#### `GET /assets/for/:ref` 🔒 Protected
**Get User Assets**
```typescript
// Response
{
  "assets": [
    {
      "uid": 1,
      "brand": "Dell",
      "serialNumber": "DL2024-001-LAP",
      "modelNumber": "Latitude 5520",
      "purchaseDate": "2024-01-15T00:00:00.000Z",
      "hasInsurance": true,
      "insuranceProvider": "TechGuard Insurance",
      "insuranceExpiryDate": "2025-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "user": {
    "uid": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com"
  },
  "message": "User assets retrieved successfully",
  "assetCount": 1
}
```

### Asset Modification

#### `PATCH /assets/:ref` 🔒 Protected
**Update Asset**
```typescript
// Request - Ownership Transfer
{
  "owner": { "uid": 2 },
  "branch": { "uid": 2 }
}

// Request - Insurance Update
{
  "insuranceProvider": "NewCorp Insurance",
  "insuranceExpiryDate": "2025-12-31T00:00:00.000Z",
  "hasInsurance": true
}

// Request - Technical Update
{
  "brand": "Dell Technologies",
  "modelNumber": "Latitude 5520 (Updated)",
  "serialNumber": "DL2024-001-LAP-UPD"
}

// Response
{
  "message": "Asset updated successfully",
  "asset": {
    "uid": 1,
    "brand": "Dell Technologies",
    "serialNumber": "DL2024-001-LAP-UPD",
    "modelNumber": "Latitude 5520 (Updated)",
    "purchaseDate": "2024-01-15T00:00:00.000Z",
    "hasInsurance": true,
    "insuranceProvider": "NewCorp Insurance",
    "insuranceExpiryDate": "2025-12-31T00:00:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

### Asset Lifecycle

#### `PATCH /assets/restore/:ref` 🔒 Protected
**Restore Deleted Asset**
```typescript
// Response
{
  "message": "Asset restored successfully",
  "asset": {
    "uid": 1,
    "brand": "Dell",
    "serialNumber": "DL2024-001-LAP",
    "modelNumber": "Latitude 5520",
    "isDeleted": false,
    "restoredAt": "2024-01-20T16:45:00.000Z"
  }
}
```

#### `DELETE /assets/:ref` 🔒 Protected
**Soft Delete Asset**
```typescript
// Response
{
  "message": "Asset deleted successfully",
  "asset": {
    "uid": 1,
    "brand": "Dell",
    "serialNumber": "DL2024-001-LAP",
    "isDeleted": true,
    "deletedAt": "2024-01-20T17:15:00.000Z"
  }
}
```

## 🔧 Service Layer

### AssetsService Core Methods

#### Asset CRUD Operations
```typescript
// Create asset
async create(createAssetDto: CreateAssetDto, orgId: number, branchId: number): Promise<Asset>

// Find all assets
async findAll(orgId: number, branchId: number): Promise<Asset[]>

// Find asset by reference
async findOne(ref: number, orgId: number, branchId: number): Promise<Asset | null>

// Update asset
async update(ref: number, updateAssetDto: UpdateAssetDto, orgId: number, branchId: number): Promise<Asset>

// Soft delete asset
async remove(ref: number, orgId: number, branchId: number): Promise<void>

// Restore deleted asset
async restore(ref: number): Promise<Asset>
```

#### Asset Search & Discovery
```typescript
// Search assets by term
async findBySearchTerm(query: string, orgId: number, branchId: number): Promise<Asset[]>

// Find assets by user
async assetsByUser(userRef: number, orgId: number, branchId: number): Promise<Asset[]>

// Find assets by branch
async assetsByBranch(branchRef: number, orgId: number): Promise<Asset[]>

// Find assets with expired insurance
async findAssetsWithExpiredInsurance(orgId: number): Promise<Asset[]>
```

#### Asset Validation & Business Logic
```typescript
// Validate serial number uniqueness
async validateSerialNumber(serialNumber: string, orgId: number, excludeAssetId?: number): Promise<boolean>

// Validate asset ownership
async validateAssetOwnership(assetRef: number, userId: number, orgId: number): Promise<boolean>

// Check insurance expiry
async checkInsuranceExpiry(assetRef: number): Promise<boolean>

// Validate branch access
async validateBranchAccess(branchRef: number, userId: number, orgId: number): Promise<boolean>
```

## 🔄 Integration Points

### User Module Integration
```typescript
// Validate asset owner exists
async validateAssetOwner(userId: number, orgId: number): Promise<User>

// Transfer asset ownership
async transferAssetOwnership(assetRef: number, newOwnerId: number, orgId: number): Promise<Asset>

// Get user asset count
async getUserAssetCount(userId: number, orgId: number): Promise<number>

// Validate user branch access
async validateUserBranchAccess(userId: number, branchId: number, orgId: number): Promise<boolean>
```

### Branch Module Integration
```typescript
// Validate branch exists
async validateBranch(branchId: number, orgId: number): Promise<Branch>

// Get branch asset inventory
async getBranchAssetInventory(branchId: number, orgId: number): Promise<Asset[]>

// Transfer assets to branch
async transferAssetsToBranch(assetIds: number[], branchId: number, orgId: number): Promise<Asset[]>

// Get branch asset statistics
async getBranchAssetStatistics(branchId: number, orgId: number): Promise<AssetStatistics>
```

### Organization Module Integration
```typescript
// Validate organization access
async validateOrganizationAccess(orgId: number, userId: number): Promise<boolean>

// Get organization asset summary
async getOrganizationAssetSummary(orgId: number): Promise<AssetSummary>

// Organization asset compliance report
async generateComplianceReport(orgId: number): Promise<ComplianceReport>

// Asset depreciation tracking
async trackAssetDepreciation(orgId: number): Promise<DepreciationReport>
```

## 🔒 Access Control & Permissions

### Asset Permissions
```typescript
export enum AssetPermission {
    CREATE = 'asset:create',
    VIEW = 'asset:view',
    UPDATE = 'asset:update',
    DELETE = 'asset:delete',
    RESTORE = 'asset:restore',
    TRANSFER = 'asset:transfer',
    SEARCH = 'asset:search',
}
```

### Enterprise Licensing
```typescript
// Enterprise feature validation
@EnterpriseOnly('assets')
export class AssetsController {
    // All asset operations require enterprise license
}
```

### Data Scoping
```typescript
// Organization-scoped asset access
async findOrganizationAssets(orgId: number, branchId?: number): Promise<Asset[]> {
    return this.assetRepository.find({
        where: {
            org: { uid: orgId },
            branch: branchId ? { uid: branchId } : undefined,
            isDeleted: false
        },
        relations: ['owner', 'branch', 'org']
    });
}
```

## 📊 Performance Optimizations

### Database Indexes
```sql
-- Asset performance indexes
CREATE INDEX IDX_ASSET_SERIAL ON assets(serialNumber);
CREATE INDEX IDX_ASSET_OWNER_DELETED ON assets(owner, isDeleted);
CREATE INDEX IDX_ASSET_BRAND_MODEL ON assets(brand, modelNumber);
CREATE INDEX IDX_ASSET_INSURANCE_EXPIRY ON assets(insuranceExpiryDate, hasInsurance);
CREATE INDEX IDX_ASSET_ORG_BRANCH_DELETED ON assets(org, branch, isDeleted);
CREATE INDEX IDX_ASSET_PURCHASE_DATE ON assets(purchaseDate);

-- Compound indexes for common queries
CREATE INDEX IDX_ASSET_ORG_OWNER ON assets(org, owner);
CREATE INDEX IDX_ASSET_BRANCH_OWNER ON assets(branch, owner);
CREATE INDEX IDX_ASSET_SEARCH_COMPOUND ON assets(brand, modelNumber, serialNumber);
```

### Caching Strategy
```typescript
// Cache keys
ASSET_CACHE_PREFIX = 'asset:'
ASSET_SEARCH_CACHE_PREFIX = 'asset_search:'
USER_ASSETS_CACHE_PREFIX = 'user_assets:'

// Cache operations
async getCachedAsset(assetId: number): Promise<Asset | null>
async cacheAssetSearch(query: string, orgId: number, results: Asset[]): Promise<void>
async invalidateAssetCache(assetId: number): Promise<void>
```

## 🚀 Usage Examples

### Basic Asset Operations
```typescript
// Create corporate laptop
const asset = await assetsService.create({
    brand: 'Dell',
    serialNumber: 'DL2024-001-LAP',
    modelNumber: 'Latitude 5520',
    purchaseDate: new Date('2024-01-15'),
    hasInsurance: true,
    insuranceProvider: 'TechGuard Insurance',
    insuranceExpiryDate: new Date('2025-01-15'),
    owner: { uid: 1 },
    branch: { uid: 1 }
}, orgId, branchId);

// Search for assets
const searchResults = await assetsService.findBySearchTerm('Dell', orgId, branchId);

// Transfer asset ownership
const updatedAsset = await assetsService.update(assetId, {
    owner: { uid: 2 },
    branch: { uid: 2 }
}, orgId, branchId);
```

### Asset Management Workflows
```typescript
// Get user's assigned assets
const userAssets = await assetsService.assetsByUser(userId, orgId, branchId);

// Check insurance expiry
const expiredInsurance = await assetsService.findAssetsWithExpiredInsurance(orgId);

// Restore accidentally deleted asset
const restoredAsset = await assetsService.restore(assetId);
```

## 🔮 Future Enhancements

### Planned Features
1. **Asset QR Codes**: Automatic QR code generation for physical asset tracking
2. **Maintenance Scheduling**: Preventive maintenance tracking and scheduling
3. **Asset Depreciation**: Automated depreciation calculation and reporting
4. **Mobile Asset Scanning**: Mobile app integration for asset discovery
5. **Warranty Management**: Warranty tracking with vendor integration

### Scalability Improvements
- **Asset Analytics**: Advanced reporting and analytics dashboards
- **Bulk Operations**: Efficient bulk asset import and export capabilities
- **Asset History**: Comprehensive asset lifecycle and ownership history
- **Integration APIs**: Third-party system integration for procurement and disposal

---

This Assets module provides comprehensive organizational asset management with enterprise-grade features including ownership tracking, insurance management, search capabilities, and role-based access control for effective corporate asset oversight and compliance. 