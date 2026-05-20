declare module "*.gz" {
	const content: Uint8Array;
	export default content;
}

declare module "*.txt" {
	const content: string;
	export default content;
}
