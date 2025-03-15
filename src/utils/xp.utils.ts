//TODO: Add more complex XP calculation
export function calculateXP(hours: number, tasks: number, sales: number): number {
	return Math.round(hours * 10 + tasks * 5 + sales * 0.01);
}
