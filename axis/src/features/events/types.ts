import type { events } from "@/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export interface Team {
	id: number;
	name: string;
	logo?: string;
	leagueId: number;
}

export interface League {
	id: number;
	name: string;
	country: string;
}

export interface Area {
	area_id: string;
	name_ar: string;
	name_en: string;
	capacity: number;
	base_price: number;
}

export interface Package {
	id: string;
	name: string;
	price: number;
}

export interface MatchFixture {
	fixture: {
		id: number;
		date: string;
	};
	teams: {
		home: {
			id: number;
			name: string;
			logo: string;
		};
		away: {
			id: number;
			name: string;
			logo: string;
		};
	};
}

export interface CreateMatchInput {
	cafe_id: string;
	name: string;
	match_id: number;
	start_time: string;
	base_price: string;
	total_capacity: number;
	remaining_capacity: number;
	areas: Array<string>;
	packages: Array<string>;
}

export type EventInsert = InferInsertModel<typeof events>;
export type EventSelect = InferSelectModel<typeof events>;

export type MatchEvent = Pick<
	EventSelect,
	| "id"
	| "name"
	| "start_time"
	| "total_capacity"
	| "remaining_capacity"
	| "status"
>;
