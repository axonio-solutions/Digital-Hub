import { MatchDetailsSheet } from "./sheets/match-details-sheet";
import type { Match } from "./matches-table";

interface MatchCellViewerProps {
	item: Match;
}

export function MatchCellViewer({ item }: MatchCellViewerProps) {
	return <MatchDetailsSheet matchData={item}>{item.match}</MatchDetailsSheet>;
}
