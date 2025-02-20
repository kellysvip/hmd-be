import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsNoWhitespace(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsNoWhitespace",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === "string" && !/\s/.test(value);
                },
                defaultMessage(validationArguments: ValidationArguments): string {
                    return typeof validationOptions?.message === "string"
                        ? validationOptions.message
                        : `${validationArguments.property} không được chứa khoảng trắng!`;
                }
            }
        });
    };
}
