# Feature-Based Access Control Guide

## Overview

The system implements feature-based access control based on subscription plans. Each route can be protected with specific feature requirements.

## Usage Examples

### 1. Basic Route Protection

```typescript
@Controller('assets')
@UseGuards(AuthGuard, FeatureGuard)
export class AssetsController {
	// Basic asset viewing (Starter Plan)
	@Get()
	@RequireFeature('assets.view')
	findAll() {
		// ...
	}

	// Advanced asset management (Professional Plan)
	@Post('bulk')
	@RequireFeature('assets.advanced', 'assets.bulk')
	bulkCreate() {
		// ...
	}

	// Premium features (Business Plan)
	@Post('analysis')
	@RequireFeature('assets.premium')
	analyzeAssets() {
		// ...
	}

	// Enterprise features
	@Post('custom-workflow')
	@RequireFeature('assets.enterprise')
	customWorkflow() {
		// ...
	}
}
```

### 2. Multiple Feature Requirements

```typescript
@Controller('reports')
@UseGuards(AuthGuard, FeatureGuard)
export class ReportsController {
	// Requires both advanced reporting and premium analytics
	@Post('advanced-analytics')
	@RequireFeature('reports.advanced', 'reports.premium')
	generateAdvancedReport() {
		// ...
	}
}
```

### 3. Feature Levels by Plan

#### Starter Plan Features:

-   Basic viewing and creation
-   Limited functionality
-   Essential features only

```typescript
@Get()
@RequireFeature('module.view')
@RequireFeature('module.basic')
```

#### Professional Plan Features:

-   Advanced features
-   Bulk operations
-   Enhanced functionality

```typescript
@Post('advanced')
@RequireFeature('module.advanced')
```

#### Business Plan Features:

-   Premium features
-   Advanced analytics
-   Extended capabilities

```typescript
@Post('premium')
@RequireFeature('module.premium')
```

#### Enterprise Plan Features:

-   Custom workflows
-   Enterprise-level features
-   Full system access

```typescript
@Post('enterprise')
@RequireFeature('module.enterprise')
```

### 4. Module-Specific Features

#### Assets Module

```typescript
'assets.view'; // Starter
'assets.advanced'; // Professional
'assets.premium'; // Business
'assets.enterprise'; // Enterprise
```

#### Reports Module

```typescript
'reports.basic'; // Starter
'reports.advanced'; // Professional
'reports.premium'; // Business
'reports.enterprise'; // Enterprise
```

## Error Handling

When a user tries to access a feature not included in their plan, they'll receive:

```json
{
	"statusCode": 403,
	"message": "Your current plan does not include access to this feature",
	"error": "Forbidden"
}
```

## Best Practices

1. Always use the most specific feature level required
2. Combine features when multiple capabilities are needed
3. Use module-specific features rather than generic ones
4. Document required subscription level in API documentation
5. Consider graceful degradation for lower-tier plans

## Feature Hierarchy

```
module.basic       → Starter Plan
module.advanced    → Professional Plan
module.premium     → Business Plan
module.enterprise  → Enterprise Plan
```
