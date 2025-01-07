# Enterprise-Only Protection Guide

## Overview

All routes (except auth) are protected with enterprise-only access. This is a temporary measure until specific feature requirements are defined for each subscription tier.

## Implementation

### 1. Controller Protection

```typescript
// Example of protecting an entire controller
@Controller('assets')
@EnterpriseOnly('assets')
export class AssetsController {
	// All routes in this controller require enterprise access
}

// Example of protecting specific routes
@Controller('products')
export class ProductsController {
	@Get()
	@EnterpriseOnly('products')
	findAll() {
		// This route requires enterprise access
	}
}
```

### 2. Protected Modules

The following modules require enterprise access:

```typescript
-assets -
	claims -
	clients -
	communication -
	docs -
	journal -
	leads -
	licensing -
	news -
	notifications -
	organisation -
	products -
	reports -
	resellers -
	rewards -
	shop -
	tasks -
	tracking;
```

### 3. Error Response

When a non-enterprise user attempts to access a protected route:

```json
{
	"statusCode": 403,
	"message": "Your current plan does not include access to this feature",
	"error": "Forbidden"
}
```

### 4. Implementation Steps

1. Add the `@EnterpriseOnly` decorator to your controller:

```typescript
@Controller('your-module')
@EnterpriseOnly('your-module')
```

2. For specific routes:

```typescript
@Post('specific-route')
@EnterpriseOnly('your-module')
```

3. Auth module routes are exempt from this protection.

### 5. Migration Plan

1. Initially, all routes require enterprise access
2. Gradually relax restrictions based on feature requirements
3. Update feature matrix in `license-features.ts`
4. Replace `@EnterpriseOnly` with specific feature requirements

### 6. Example Migration

Current (Enterprise Only):

```typescript
@Controller('assets')
@EnterpriseOnly('assets')
```

Future (Feature-Based):

```typescript
@Controller('assets')
export class AssetsController {
	@Get()
	@RequireFeature('assets.view') // Starter Plan
	findAll() {}

	@Post('bulk')
	@RequireFeature('assets.bulk') // Professional Plan
	bulkCreate() {}

	@Post('analysis')
	@RequireFeature('assets.premium') // Business Plan
	analyze() {}
}
```
