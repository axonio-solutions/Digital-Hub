export const SUPPORTED_LEAGUES = [
	{
		country: "Saudi-Arabia",
		leagues: [
			{ id: 307, name: "Pro League" },
			{ id: 308, name: "Division 1" },
			{ id: 504, name: "King's Cup" },
		],
	},
	{
		country: "England",
		leagues: [
			{ id: 39, name: "Premier League" },
			{ id: 45, name: "FA Cup" },
		],
	},
	{
		country: "Spain",
		leagues: [
			{ id: 140, name: "La Liga" },
			{ id: 143, name: "Copa del Rey" },
		],
	},
	{
		country: "International",
		leagues: [{ id: 2, name: "UEFA Champions League" }],
	},
] as const;
