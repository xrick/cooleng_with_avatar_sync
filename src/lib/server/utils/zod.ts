import { z } from 'zod';

export function removeUnsupportedProps<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>
): z.ZodObject<T> {
	const shape = schema.shape;
	const newShape: Record<string, z.ZodTypeAny> = {};
	for (const key in shape) {
		const prop = shape[key];
		if (prop instanceof z.ZodNumber) {
			newShape[key] = z.number();
		} else if (prop instanceof z.ZodString) {
			newShape[key] = z.string();
		} else if (prop instanceof z.ZodObject) {
			newShape[key] = removeUnsupportedProps(prop);
		} else {
			newShape[key] = prop;
		}
	}
	return z.object(newShape) as z.ZodObject<T>;
}
