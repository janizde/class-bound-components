export function myTestFunction(content: string, count: number): string {
  return new Array(count).fill(content).join(',');
}
