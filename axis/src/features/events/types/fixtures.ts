export interface APIResponse<T> {
	get: string;
	parameters: Record<string, string>;
	errors: Array<string>;
	results: number;
	paging: {
		current: number;
		total: number;
	};
	response: Array<T>;
}

export interface FixtureResponse {
	fixture: {
		id: number;
		referee: string | null;
		timezone: string;
		date: string;
		timestamp: number;
		status: {
			long: string;
			short: string;
			elapsed: number | null;
		};
	};
	league: {
		id: number;
		name: string;
		country: string;
		logo: string;
		flag: string;
		season: number;
		round: string;
	};
	teams: {
		home: {
			id: number;
			name: string;
			logo: string;
			winner: boolean | null;
		};
		away: {
			id: number;
			name: string;
			logo: string;
			winner: boolean | null;
		};
	};
	goals: {
		home: number | null;
		away: number | null;
	};
	score: {
		halftime: {
			home: number | null;
			away: number | null;
		};
		fulltime: {
			home: number | null;
			away: number | null;
		};
		extratime: {
			home: number | null;
			away: number | null;
		};
		penalty: {
			home: number | null;
			away: number | null;
		};
	};
}
