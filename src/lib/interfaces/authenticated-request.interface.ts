import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
	user: {
		uid: number;
		branch?: {
			uid: number;
		};
		org?: {
			uid: number;
		};
		organisationRef?: number;
	};
}
