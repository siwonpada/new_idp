import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export function IsGistEmail(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: GistEmailValidator,
        });
    };
}

@ValidatorConstraint()
export class GistEmailValidator implements ValidatorConstraintInterface {
    validate(text: string): boolean {
        if (!text) return false;
        return text.includes('@gm.gist.ac.kr') || text.includes('@gist.ac.kr');
    }
}
