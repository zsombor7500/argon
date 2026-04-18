import { z } from 'zod';


export const DateFromString = z.string().transform((dateStr) => new Date(dateStr));
