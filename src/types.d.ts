// Type definitions

// Startup options interface
interface options {
	files?: Array<string>;
	list?: string;
	destination?: string;
	restart?: boolean;
	loggingLevel?: 0 | 1 | 2;
	stdout?: NodeJS.WriteStream;
}

// Custom error interface
interface error {
	status?: number;
	message: string;
}

// File object interface
interface file {
	path: string;
	originalname: string;
	filename: string;
	size: Number;
	folder: boolean;
}
