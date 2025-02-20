import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isAfterDate', async: false })
export class IsAfterDate implements ValidatorConstraintInterface {
    validate(propertyValue: string, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        
        if (!relatedValue) return false;
        
        const currentDate = new Date(propertyValue);
        const comparisonDate = new Date(relatedValue);
        
        return currentDate > comparisonDate;
    }

    defaultMessage(args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        return `${args.property} must be after ${relatedPropertyName}`;
    }
} 